/**
 * @fileoverview Student Scholarship Handlers
 *
 * Endpoints that require an authenticated student.
 *
 * applyForScholarship now accepts a `payment` payload for paid
 * campaigns. The handler passes it through to the service layer which
 * validates and inserts the payments row atomically with the
 * application.
 *
 * Path: apps/web/lib/scholarships/http/handlers/student.js
 */

import { requireUser, parseJsonBody } from '../middleware';
import { ok, created, methodNotAllowed } from '../response';
import { handleError, domainError } from '../errors';
import {
  applyForScholarship,
  withdrawApplication,
  listUserApplications,
  listActiveCampaigns,
  getCampaignBySlug,
} from '../../service';
import { query } from '../../../db';

/* ============================================================================
 * LIST CAMPAIGNS + MY APPLICATIONS
 * ========================================================================== */

export const handleListCampaigns = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const { userId } = await requireUser(req);

    const [campaigns, applications] = await Promise.all([
      listActiveCampaigns({ limit: 20 }),
      listUserApplications(userId),
    ]);

    const appByCampaign = {};
    for (const app of applications) {
      appByCampaign[app.campaign_id] = app;
    }

    const campaignsWithStatus = campaigns.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameAm: c.name_am,
      description: c.description,
      descriptionAm: c.description_am,
      grantsFullCourse: c.grants_full_course,
      grantsPhases: c.grants_phases,
      registrationFeeETB: Number(c.registration_fee_etb) || 0,
      quota: c.quota,
      remaining: Math.max(0, c.quota - c.approved_count),
      applicationsCloseAt: c.applications_close_at,
      coverImageUrl: c.cover_image_url,
      hasLearnMore:
        Boolean(c.learn_more_content && c.learn_more_content.trim()) ||
        Boolean(c.learn_more_url && c.learn_more_url.trim()),
      myApplication: appByCampaign[c.id]
        ? {
            id: appByCampaign[c.id].id,
            status: appByCampaign[c.id].status,
            appliedAt: appByCampaign[c.id].created_at,
          }
        : null,
    }));

    return ok(res, { campaigns: campaignsWithStatus });
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * GET SINGLE CAMPAIGN
 * ========================================================================== */

export const handleGetCampaign = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const { userId } = await requireUser(req);

    const slug = String(req.query.slug || '').trim();
    if (!slug) {
      throw domainError('VALIDATION_ERROR', 'Campaign slug is required.');
    }

    const campaign = await getCampaignBySlug(slug);
    if (!campaign) {
      throw domainError('NOT_FOUND', 'Campaign not found.');
    }

    const appResult = await query(
      `SELECT id, status, created_at, reviewed_at, rejection_reason,
              payment_due_at, enrollment_created_at
       FROM scholarship_applications
       WHERE campaign_id = $1 AND applicant_user_id = $2
       LIMIT 1`,
      [campaign.id, userId]
    );
    const myApplication = appResult.rows[0] || null;

    const userResult = await query(
      `SELECT banned_at FROM users WHERE id = $1`,
      [userId]
    );
    const isBanned =
      userResult.rows[0]?.banned_at !== null &&
      userResult.rows[0]?.banned_at !== undefined;

    const now = new Date();
    const isOpen =
      campaign.is_active === true &&
      new Date(campaign.applications_open_at) <= now &&
      (!campaign.applications_close_at ||
        new Date(campaign.applications_close_at) > now);
    const hasQuota = campaign.approved_count < campaign.quota;

    let canApply = true;
    let blockReason = null;
    if (myApplication) {
      canApply = false;
      blockReason = 'ALREADY_APPLIED';
    } else if (isBanned) {
      canApply = false;
      blockReason = 'USER_BANNED';
    } else if (!isOpen) {
      canApply = false;
      blockReason = 'CAMPAIGN_CLOSED';
    } else if (!hasQuota) {
      canApply = false;
      blockReason = 'QUOTA_FULL';
    }

    return ok(res, {
      campaign: {
        slug: campaign.slug,
        name: campaign.name,
        nameAm: campaign.name_am,
        description: campaign.description,
        descriptionAm: campaign.description_am,
        grantsFullCourse: campaign.grants_full_course,
        grantsPhases: campaign.grants_phases,
        registrationFeeETB: Number(campaign.registration_fee_etb) || 0,
        quota: campaign.quota,
        approvedCount: campaign.approved_count,
        remaining: Math.max(0, campaign.quota - campaign.approved_count),
        applicationsOpenAt: campaign.applications_open_at,
        applicationsCloseAt: campaign.applications_close_at,
        coverImageUrl: campaign.cover_image_url,
        requiredDocuments: campaign.required_documents || [],
        learnMoreContent: campaign.learn_more_content || null,
        learnMoreUrl: campaign.learn_more_url || null,
      },
      eligibility: {
        canApply,
        blockReason,
        isBanned,
        isOpen,
        hasQuota,
      },
      myApplication,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

/* ============================================================================
 * APPLY / WITHDRAW / MY APPLICATIONS
 * ========================================================================== */

/**
 * POST /api/scholarships/apply
 *
 * For paid campaigns, the client MUST include:
 *   payment: { method, transactionRef, screenshotUrl, amount }
 *
 * The service inserts the application and the payments row inside the
 * same transaction. If validation fails, neither row lands.
 */
export const handleApply = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { userId } = await requireUser(req);

    const body = parseJsonBody(req);
    const campaignSlug = String(body.campaignSlug || '').trim();
    const motivation = String(body.motivation || '');
    const documents = Array.isArray(body.documents) ? body.documents : [];

    /* Payment payload is optional at the handler layer — the service
       decides whether it's required based on the campaign's fee. */
    const payment = body.payment && typeof body.payment === 'object'
      ? {
          method: String(body.payment.method || '').trim(),
          transactionRef: String(body.payment.transactionRef || '').trim(),
          screenshotUrl: String(body.payment.screenshotUrl || '').trim(),
          amount: Number(body.payment.amount) || 0,
        }
      : null;

    if (!campaignSlug) {
      throw domainError('VALIDATION_ERROR', 'campaignSlug is required.');
    }

    const result = await applyForScholarship({
      userId,
      campaignSlug,
      motivation,
      documents,
      payment,
    });

    return created(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};

export const handleWithdraw = async (req, res) => {
  try {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const { userId } = await requireUser(req);

    const body = parseJsonBody(req);
    const applicationId = String(body.applicationId || '').trim();
    if (!applicationId) {
      throw domainError('VALIDATION_ERROR', 'applicationId is required.');
    }

    const result = await withdrawApplication({ applicationId, userId });
    return ok(res, result);
  } catch (error) {
    return handleError(error, res);
  }
};

export const handleListMyApplications = async (req, res) => {
  try {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    const { userId } = await requireUser(req);

    const applications = await listUserApplications(userId);
    return ok(res, { applications });
  } catch (error) {
    return handleError(error, res);
  }
};