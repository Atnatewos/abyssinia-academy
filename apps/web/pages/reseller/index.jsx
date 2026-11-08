/**
 * @fileoverview Reseller Program Landing Page
 *
 * Route: /reseller
 *
 * Public page explaining the reseller program. This is the entry point
 * that marketing assets point to — "Become a reseller at /reseller".
 *
 * Renders:
 *   - Hero: "Earn 70% per sale"
 *   - How it works (4 steps)
 *   - Real earnings examples (3 tiers)
 *   - The 3 earning engines (direct reseller, sub-resellers, agent commissions)
 *   - FAQ
 *   - CTA: "Start Selling Now"
 *
 * If the user is authenticated, CTA goes to /profile/reseller.
 * If not, CTA goes to /auth/register (with referral to /profile/reseller).
 *
 * Path: apps/web/pages/reseller/index.jsx
 */

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Wallet,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Gift,
  Globe,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Wallet,
    title: 'Set your price',
    description:
      'Choose how much to charge for the course. You keep 70% of every sale. Set your price anywhere from 800 ETB to 5,000 ETB.',
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'Share your link',
    description:
      'Get your personal reseller link. Share it on Telegram, WhatsApp, Facebook, or in person. Anyone who buys through it earns you commission.',
  },
  {
    step: 3,
    icon: Users,
    title: 'Recruit sub-resellers (optional)',
    description:
      'Invite others to sell for you. You decide how much of your 70% share they get — anywhere from 10% to 70%.',
  },
  {
    step: 4,
    icon: TrendingUp,
    title: 'Get paid',
    description:
      'Your earnings unlock after 7 days (refund protection). Withdraw to Telebirr, CBE Birr, or Bank Transfer — within 24 hours.',
  },
];

const EARNINGS_TIERS = [
  {
    tier: 'Starter',
    price: 800,
    perSale: 560,
    description: 'For students and first-time sellers',
    highlight: false,
  },
  {
    tier: 'Professional',
    price: 1500,
    perSale: 1050,
    description: 'Most popular — good balance of price and profit',
    highlight: true,
  },
  {
    tier: 'Premium',
    price: 3000,
    perSale: 2100,
    description: 'For branded sellers with a reputation',
    highlight: false,
  },
];

const ENGINE_CARDS = [
  {
    icon: Wallet,
    title: 'Direct Sales',
    description:
      'Set your own price. Share your link. Earn 70% of every sale you personally close.',
    stat: '70% per sale',
    color: '#10b981',
  },
  {
    icon: Users,
    title: 'Sub-Resellers',
    description:
      'Recruit sub-resellers. You decide their share of your earnings. Every sub-sale still pays you.',
    stat: '5-40% passive',
    color: '#f59e0b',
  },
  {
    icon: Gift,
    title: 'Bonus Credits',
    description:
      'Hit milestones — 5 direct referrals, 50 team members — and earn bonus credits toward future courses.',
    stat: 'Up to 65,000 ETB',
    color: '#8b5cf6',
  },
];

const ResellerLandingPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const ctaHref = isAuthenticated ? '/profile/reseller' : '/auth/register?redirect=/profile/reseller';
  const ctaLabel = isAuthenticated ? 'Go to My Reseller Dashboard' : 'Become a Reseller';

  return (
    <>
      <SEOHead
        title="Become a Reseller — Earn 70% Per Sale | Abyssinia Academy"
        description="Set your own price. Share your link. Keep 70% of every sale. Build a team and earn passive income. Designed for Ethiopia."
      />
      <PageLayout>
        <div className="container-xl py-12 flex flex-col gap-16">
          {/* ═══════════════════════════════════════════════════
           * HERO
           * ═══════════════════════════════════════════════════ */}
          <section className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              The Reseller Program
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-main leading-tight">
              Set your price.{' '}
              <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                Keep 70%.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-muted max-w-2xl leading-relaxed">
              Turn your network into income. Sell the Abyssinia Academy course
              at any price you choose — from 800 ETB to 5,000 ETB. Every sale
              pays you 70% instantly. No inventory. No upfront cost.
            </p>

            <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-text-inverse font-extrabold text-base shadow-glow-gold hover:bg-accent-light hover:shadow-glow-gold-lg hover:-translate-y-0.5 transition-all"
              >
                {ctaLabel}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-border-medium text-text-muted font-bold text-sm hover:border-accent/40 hover:text-accent transition-colors"
              >
                See How It Works
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 w-full max-w-xl">
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-extrabold text-accent">70%</span>
                <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                  Your Cut
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-extrabold text-accent">24h</span>
                <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                  Payout
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-extrabold text-accent">0</span>
                <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                  Upfront Cost
                </span>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
           * HOW IT WORKS
           * ═══════════════════════════════════════════════════ */}
          <section id="how-it-works" className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                How It Works
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main">
                From signup to first payment in 4 steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="flex flex-col gap-3 p-6 rounded-2xl bg-bg-card-solid border border-border-light hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-extrabold text-base">
                        {item.step}
                      </div>
                      <Icon size={20} className="text-accent" />
                    </div>
                    <h3 className="text-base font-extrabold text-text-main">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
           * EARNINGS EXAMPLES
           * ═══════════════════════════════════════════════════ */}
          <section className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Real Numbers
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main">
                What you earn at every price
              </h2>
              <p className="text-sm text-text-muted max-w-xl mx-auto">
                Set your own price. You keep 70% of every sale. Here's what
                that looks like at three common price points.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EARNINGS_TIERS.map((tier) => (
                <div
                  key={tier.tier}
                  className={`flex flex-col gap-4 p-6 rounded-2xl border transition-all ${
                    tier.highlight
                      ? 'bg-accent/5 border-accent/40 shadow-glow-gold-sm scale-105'
                      : 'bg-bg-card-solid border-border-light'
                  }`}
                >
                  {tier.highlight && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-2xs font-bold uppercase tracking-wider bg-accent text-text-inverse self-start">
                      <Sparkles size={10} />
                      Most Popular
                    </span>
                  )}
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-extrabold text-text-main">
                      {tier.tier}
                    </h3>
                    <p className="text-2xs text-text-muted">{tier.description}</p>
                  </div>

                  <div className="flex flex-col gap-0.5 pt-3 border-t border-border-light">
                    <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                      Sell at
                    </span>
                    <span className="text-2xl font-extrabold text-text-main">
                      {tier.price.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-success">
                      You keep
                    </span>
                    <span className="text-3xl font-extrabold text-success">
                      {tier.perSale.toLocaleString()} ETB
                    </span>
                    <span className="text-2xs text-text-dim">
                      per sale
                    </span>
                  </div>

                  <Link
                    href={ctaHref}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
                  >
                    Start Selling
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
           * THREE EARNING ENGINES
           * ═══════════════════════════════════════════════════ */}
          <section className="flex flex-col gap-8">
            <div className="text-center flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Three Ways to Earn
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main">
                Stack multiple income streams
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ENGINE_CARDS.map((engine) => {
                const Icon = engine.icon;
                return (
                  <div
                    key={engine.title}
                    className="flex flex-col gap-3 p-6 rounded-2xl bg-bg-card-solid border border-border-light"
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${engine.color}20`,
                        color: engine.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="text-base font-extrabold text-text-main">
                      {engine.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed flex-1">
                      {engine.description}
                    </p>
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: engine.color }}
                    >
                      {engine.stat}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
           * TRUST SIGNALS
           * ═══════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-5 rounded-xl bg-bg-card-solid border border-border-light">
              <Shield size={22} className="text-success shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-text-main">
                  7-day fraud protection
                </span>
                <span className="text-xs text-text-muted">
                  Payouts lock for 7 days to protect against refunds. Then
                  they're yours.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 rounded-xl bg-bg-card-solid border border-border-light">
              <Zap size={22} className="text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-text-main">
                  Instant approval
                </span>
                <span className="text-xs text-text-muted">
                  Admin approves payments within 24 hours. Your earnings appear
                  the moment they do.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-5 rounded-xl bg-bg-card-solid border border-border-light">
              <Globe size={22} className="text-info shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-text-main">
                  Ethiopian rails
                </span>
                <span className="text-xs text-text-muted">
                  Withdraw via Telebirr, CBE Birr, or Bank Transfer. No
                  international payment complexity.
                </span>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
           * FAQ
           * ═══════════════════════════════════════════════════ */}
          <section className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Common Questions
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-main">
                Everything you need to know
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {[
                {
                  q: 'Do I need to pay to become a reseller?',
                  a: 'No. Every registered user is automatically a reseller. Zero upfront cost. You just set your price and share your link.',
                },
                {
                  q: 'How much can I earn per sale?',
                  a: 'You keep 70% of every sale. At 1,000 ETB, you earn 700 ETB. At 2,000 ETB, you earn 1,400 ETB. The price is yours to set.',
                },
                {
                  q: 'When do I get paid?',
                  a: 'Earnings lock for 7 days (refund protection). After that, they unlock. Withdrawals are processed within 24 hours via Telebirr, CBE Birr, or Bank Transfer.',
                },
                {
                  q: 'Can I recruit other resellers?',
                  a: 'Yes. Invite sub-resellers and decide their share of your 70% (10-70%). Every sale they make still pays you the difference.',
                },
                {
                  q: 'What if a buyer refunds?',
                  a: 'The commission reverses automatically. You won\'t keep money from refunded sales. This is why the 7-day lock exists.',
                },
                {
                  q: 'Can I use my own agent code AND a referral?',
                  a: 'No. Agent codes override all other attribution. If you share an agent code, the MLM chain does not fire. Pick one model per link.',
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group p-4 rounded-xl bg-bg-card-solid border border-border-light cursor-pointer"
                >
                  <summary className="flex items-center justify-between gap-2 text-sm font-bold text-text-main list-none">
                    {faq.q}
                    <ArrowRight
                      size={14}
                      className="text-accent transition-transform group-open:rotate-90 shrink-0"
                    />
                  </summary>
                  <p className="mt-3 text-xs text-text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
           * FINAL CTA
           * ═══════════════════════════════════════════════════ */}
          <section className="flex flex-col items-center text-center gap-4 p-12 rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30">
            <Sparkles size={32} className="text-accent" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main max-w-2xl">
              Your network is worth money. Start earning today.
            </h2>
            <p className="text-sm text-text-muted max-w-xl">
              No upfront cost. No inventory. Just set your price and share your
              link. The first sale could be today.
            </p>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-text-inverse font-extrabold text-base shadow-glow-gold hover:bg-accent-light hover:shadow-glow-gold-lg hover:-translate-y-0.5 transition-all mt-2"
            >
              {ctaLabel}
              <ArrowRight size={18} />
            </Link>
            <div className="flex items-center gap-2 text-2xs text-text-dim mt-2">
              <CheckCircle2 size={12} />
              Free to join · No credit card · Ethiopian payments
            </div>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default ResellerLandingPage;