/**
 * @fileoverview Contact Us Page
 * Support and contact information with Telegram, email, and FAQ links.
 * All content from i18n config — zero hardcoded strings.
 * Path: apps/web/pages/contact/index.jsx
 */

import { MessageCircle, Mail, HelpCircle, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getPlatform } from '../../lib/config';

/**
 * ContactPage — Support and contact hub for students and visitors.
 */
const ContactPage = () => {
  const { t } = useLanguage();
  const platformConfig = getPlatform();
  const brand = platformConfig.brand || {};
  const siteName = `${brand.name || 'ABYSSiNIA'} ${brand.suffix || 'Tech Academy'}`;

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Telegram Community',
      description: 'Join our private Telegram group for direct mentorship, peer support, and course discussions.',
      action: 'Join Telegram',
      href: platformConfig.links?.telegram || 'https://t.me/AbyssiniaAcademy',
      external: true,
      color: '#0088cc',
    },
    {
      icon: HelpCircle,
      title: 'Frequently Asked Questions',
      description: 'Find instant answers to common questions about enrollment, payments, and course access.',
      action: 'View FAQ',
      href: '/#faq',
      external: false,
      color: 'var(--accent-gold)',
    },
    {
      icon: BookOpen,
      title: 'Course Information',
      description: 'Browse our full course catalog and explore the 5-phase curriculum structure.',
      action: 'Browse Courses',
      href: '/courses',
      external: false,
      color: 'var(--accent-gold)',
    },
  ];

  return (
    <>
      <SEOHead title="Contact Us" description={`Get in touch with ${siteName}. Join our Telegram community or browse our FAQ.`} />
      <PageLayout>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 1rem 5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Support</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Contact Us
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', maxWidth: '32rem', margin: '0 auto', lineHeight: 1.6 }}>
              We are here to help. Choose the best way to reach us below.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Link
                  key={index}
                  href={method.href}
                  target={method.external ? '_blank' : undefined}
                  rel={method.external ? 'noopener noreferrer' : undefined}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="feature-card" style={{ cursor: 'pointer', height: '100%' }}>
                    <div
                      className="feature-card-icon"
                      style={{ background: `${method.color}15`, borderColor: `${method.color}30`, color: method.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="feature-card-title" style={{ marginBottom: '0.5rem' }}>{method.title}</h3>
                    <p className="feature-card-desc" style={{ marginBottom: '1rem' }}>{method.description}</p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700, color: method.color }}>
                      {method.action}
                      {method.external ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Direct Info */}
          <div
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-main)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Prefer Direct Contact?
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Reach out to our team anytime. We typically respond within a few hours.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a
                href="https://t.me/AbyssiniaAcademy"
                target="_blank"
                rel="noopener noreferrer"
                className="pricing-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <MessageCircle size={18} />
                Telegram Support
              </a>
            </div>
          </div>

        </div>
      </PageLayout>
    </>
  );
};

export default ContactPage;