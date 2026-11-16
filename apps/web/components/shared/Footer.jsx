// /**
//  * @fileoverview Site Footer Component
//  *
//  * Renders the global platform footer using pure Tailwind utilities.
//  * Features a solid background (bg-bg-card-solid) to prevent content
//  * from bleeding through, and uses mt-auto to stick to the bottom
//  * of the flex container.
//  *
//  * Path: apps/web/components/shared/Footer.jsx
//  */

// import { useState, useCallback } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import {
//   Code2,
//   Mail,
//   Phone,
//   MapPin,
//   Send,
//   Youtube,
//   Github,
//   ArrowUp,
// } from 'lucide-react';
// import { useLanguage } from '../../context/LanguageContext';
// import { useTheme } from '../../context/ThemeContext';
// import { getPlatformConfig } from '../../lib/config';
// import LanguageToggle from './LanguageToggle';

// const resolveLabel = (t, keyPath, fallback) => {
//   if (!keyPath || typeof keyPath !== 'string') return fallback || '';
//   const parts = keyPath.split('.');
//   let value = t;
//   for (const part of parts) {
//     value = value?.[part];
//     if (value === undefined || value === null) break;
//   }
//   if (typeof value === 'string' && value.length > 0) return value;
//   if (fallback) return fallback;
//   const leaf = parts[parts.length - 1];
//   return leaf.charAt(0).toUpperCase() + leaf.slice(1).replace(/([A-Z])/g, ' $1');
// };

// const SOCIAL_ICONS = {
//   telegram: Send,
//   youtube: Youtube,
//   github: Github,
//   email: Mail,
// };

// const Footer = () => {
//   const { t } = useLanguage();
//   const { theme } = useTheme();

//   const [logoError, setLogoError] = useState(false);
//   const [newsletterEmail, setNewsletterEmail] = useState('');
//   const [newsletterStatus, setNewsletterStatus] = useState(null);

//   const platformConfig = getPlatformConfig();
//   const brand = platformConfig?.brand || {};
//   const footer = platformConfig?.footer || {};

//   const brandName = brand.name || 'ABYSSiNIA';
//   const brandSuffix = brand.suffix || 'Tech Academy';
//   const brandLogoAlt = brand.logoAlt || brandName;

//   const activeLogo =
//     theme === 'light' ? brand.logoLight || brand.logo : brand.logo;

//   const tagline = resolveLabel(t, 'footer.tagline', brand.tagline || '');
//   const madeIn = resolveLabel(t, 'footer.madeIn', 'Made in Ethiopia');

//   const contactEmail = brand.email || '';
//   const contactPhone = brand.contactPhone || '';
//   const contactLocation = brand.location || '';
//   const contactTelegram = brand.telegramSupport || '';

//   const socialLinks = brand.socialLinks || {};
//   const socialEntries = Object.entries(socialLinks).filter(
//     ([, href]) => typeof href === 'string' && href.length > 0
//   );

//   const columns = Array.isArray(footer.columns) ? footer.columns : [];

//   const currentYear = new Date().getFullYear();
//   const copyrightSuffix =
//     footer.copyrightSuffix || 'ABYSSiNiA Tech Academy. All rights reserved.';
//   const poweredByLabel = footer.poweredByLabel || 'Powered by SoDar!';
//   const backToTopLabel = footer.backToTopLabel || 'Back to top';

//   const handleBackToTop = useCallback(() => {
//     if (typeof window === 'undefined') return;
//     try {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } catch {
//       window.scrollTo(0, 0);
//     }
//   }, []);

//   const handleNewsletterSubmit = useCallback(
//     (event) => {
//       event.preventDefault();
//       const trimmed = newsletterEmail.trim();
//       const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
//       if (!isValid) {
//         setNewsletterStatus('error');
//         return;
//       }
//       setNewsletterStatus('success');
//       setNewsletterEmail('');
//       setTimeout(() => setNewsletterStatus(null), 4000);
//     },
//     [newsletterEmail]
//   );

//   return (
//     <footer className="relative z-40 w-full mt-auto bg-bg-card-solid border-t border-border-medium text-sm text-text-dim">
//       {/* Top accent line */}
//       <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
//         {/* ── Main grid ── */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
//           {/* BRAND COLUMN */}
//           <div className="lg:col-span-4 flex flex-col gap-5">
//             <Link href="/" className="flex items-center gap-2.5 group" aria-label={brandName}>
//               {activeLogo && !logoError ? (
//                 <div className="relative h-10 w-auto min-w-[140px] flex items-center">
//                   <Image
//                     key={activeLogo}
//                     src={activeLogo}
//                     alt={brandLogoAlt}
//                     width={brand.footerLogoWidth || 140}
//                     height={brand.logoHeight || 40}
//                     onError={() => setLogoError(true)}
//                     className="object-contain h-full w-auto group-hover:scale-[1.02] transition-transform duration-300"
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-light via-accent to-accent-dark flex items-center justify-center shadow-glow-gold-sm">
//                     <Code2 className="w-5 h-5 text-text-inverse" />
//                   </div>
//                   <div className="flex flex-col leading-none">
//                     <span className="text-base font-extrabold text-text-main tracking-tight">{brandName}</span>
//                     <span className="text-[10px] tracking-[0.12em] text-text-dim uppercase font-medium mt-0.5">{brandSuffix}</span>
//                   </div>
//                 </>
//               )}
//             </Link>

//             {tagline && <p className="text-xs text-text-muted leading-relaxed max-w-sm">{tagline}</p>}

//             <div className="inline-flex items-center text-2xs font-bold text-accent">{madeIn}</div>

//             {socialEntries.length > 0 && (
//               <div className="flex flex-wrap items-center gap-2 mt-1">
//                 {socialEntries.map(([key, href]) => {
//                   const Icon = SOCIAL_ICONS[key] || Send;
//                   return (
//                     <a
//                       key={key}
//                       href={href}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       aria-label={key}
//                       className="w-9 h-9 rounded-lg bg-bg-pill border border-border-light flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 hover:border-accent/40 transition-colors"
//                     >
//                       <Icon className="w-4 h-4" />
//                     </a>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* LINK COLUMNS */}
//           {columns.length > 0 && (
//             <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
//               {columns.map((col) => (
//                 <div key={col.key} className="flex flex-col gap-3">
//                   <h3 className="text-2xs font-extrabold uppercase tracking-[0.15em] text-text-main">
//                     {resolveLabel(t, col.labelKey, col.key)}
//                   </h3>
//                   <ul className="flex flex-col gap-2">
//                     {(col.links || []).map((link) => (
//                       <li key={`${col.key}-${link.href}-${link.labelKey}`}>
//                         <Link href={link.href} className="text-xs text-text-muted hover:text-accent transition-colors underline-offset-4 hover:underline">
//                           {resolveLabel(t, link.labelKey, '')}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* CONTACT + NEWSLETTER */}
//           <div className="lg:col-span-3 flex flex-col gap-5">
//             <h3 className="text-2xs font-extrabold uppercase tracking-[0.15em] text-text-main">
//               {resolveLabel(t, 'footer.contactTitle', 'Get in touch')}
//             </h3>

//             <ul className="flex flex-col gap-2.5 text-xs text-text-muted">
//               {contactEmail && (
//                 <li>
//                   <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 hover:text-accent transition-colors">
//                     <Mail className="w-3.5 h-3.5 shrink-0" />
//                     <span className="truncate">{contactEmail}</span>
//                   </a>
//                 </li>
//               )}
//               {contactTelegram && (
//                 <li>
//                   <a href={contactTelegram.startsWith('http') ? contactTelegram : `https://t.me/${contactTelegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
//                     <Send className="w-3.5 h-3.5 shrink-0" />
//                     <span className="truncate">{contactTelegram}</span>
//                   </a>
//                 </li>
//               )}
//               {contactPhone && (
//                 <li>
//                   <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-2 hover:text-accent transition-colors">
//                     <Phone className="w-3.5 h-3.5 shrink-0" />
//                     <span className="truncate">{contactPhone}</span>
//                   </a>
//                 </li>
//               )}
//               {contactLocation && (
//                 <li className="inline-flex items-center gap-2">
//                   <MapPin className="w-3.5 h-3.5 shrink-0" />
//                   <span className="truncate">{contactLocation}</span>
//                 </li>
//               )}
//             </ul>

//             <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 mt-2" aria-label={resolveLabel(t, 'footer.newsletterTitle', 'Newsletter')}>
//               <label className="text-2xs font-bold text-text-main uppercase tracking-wider">
//                 {resolveLabel(t, 'footer.newsletterTitle', 'Stay in the loop')}
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="email"
//                   value={newsletterEmail}
//                   onChange={(e) => setNewsletterEmail(e.target.value)}
//                   placeholder={resolveLabel(t, 'footer.newsletterPlaceholder', 'Enter your email')}
//                   className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-bg-input border border-border-medium text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
//                   disabled={newsletterStatus === 'success'}
//                 />
//                 <button
//                   type="submit"
//                   className="shrink-0 px-3 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors disabled:opacity-50"
//                   disabled={newsletterStatus === 'success'}
//                 >
//                   {resolveLabel(t, 'footer.newsletterButton', 'Subscribe')}
//                 </button>
//               </div>
//               {newsletterStatus === 'success' && (
//                 <p className="text-2xs text-success font-semibold">{resolveLabel(t, 'footer.newsletterSuccess', 'You are subscribed.')}</p>
//               )}
//               {newsletterStatus === 'error' && (
//                 <p className="text-2xs text-error font-semibold">{resolveLabel(t, 'footer.newsletterError', 'Please enter a valid email.')}</p>
//               )}
//             </form>
//           </div>
//         </div>

//         {/* ── Bottom bar ── */}
//         <div className="mt-12 pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
//           <p className="text-2xs text-text-dim text-center sm:text-left">
//             &copy; {currentYear} {copyrightSuffix}
//           </p>

//           <div className="flex items-center gap-4 flex-wrap justify-center">
//             <LanguageToggle />
//             <span className="text-text-dim/60 hidden sm:inline">&bull;</span>
//             <p className="text-2xs text-text-dim">{poweredByLabel}</p>
//             <button
//               type="button"
//               onClick={handleBackToTop}
//               aria-label={backToTopLabel}
//               title={backToTopLabel}
//               className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-pill border border-border-light text-text-muted hover:text-accent hover:border-accent/40 transition-colors text-2xs font-bold"
//             >
//               <ArrowUp className="w-3 h-3" />
//               <span className="hidden sm:inline">{backToTopLabel}</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;








/**
 * @fileoverview Site Footer Component
 *
 * Renders the global platform footer using pure Tailwind utilities.
 * Features a solid background (bg-bg-card-solid) to prevent content
 * from bleeding through, and uses mt-auto to stick to the bottom
 * of the flex container.
 *
 * Path: apps/web/components/shared/Footer.jsx
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Code2,
  Mail,
  Phone,
  MapPin,
  Send,
  Youtube,
  Github,
  ArrowUp,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getPlatformConfig } from '../../lib/config';
import LanguageToggle from './LanguageToggle';

const resolveLabel = (t, keyPath, fallback) => {
  if (!keyPath || typeof keyPath !== 'string') return fallback || '';
  const parts = keyPath.split('.');
  let value = t;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined || value === null) break;
  }
  if (typeof value === 'string' && value.length > 0) return value;
  if (fallback) return fallback;
  const leaf = parts[parts.length - 1];
  return leaf.charAt(0).toUpperCase() + leaf.slice(1).replace(/([A-Z])/g, ' $1');
};

const SOCIAL_ICONS = {
  telegram: Send,
  youtube: Youtube,
  github: Github,
  email: Mail,
};

const FOOTER_COLUMNS_FALLBACK = [
  {
    key: 'platform',
    labelKey: 'footer.columns.platform',
    links: [
      { href: '/', labelKey: 'nav.overview' },
      { href: '/courses', labelKey: 'nav.courses' },
      { href: '/scholarships', labelKey: 'scholarships.nav.scholarships' },
      { href: '/pricing', labelKey: 'nav.tuition' },
      { href: '/contact', labelKey: 'nav.contact' },
    ]
  },
  {
    key: 'earn',
    labelKey: 'footer.columns.earn',
    links: [
      { href: '/profile/referrals', labelKey: 'footer.links.referrals' },
      { href: '/profile/reseller', labelKey: 'footer.links.reseller' },
      { href: '/#earn', labelKey: 'footer.links.agents' },
      { href: '/profile/referrals', labelKey: 'footer.links.withdrawals' },
    ]
  },
  {
    key: 'company',
    labelKey: 'footer.columns.company',
    links: [
      { href: '/about', labelKey: 'footer.links.about' },
      { href: '/privacy', labelKey: 'footer.links.privacy' },
      { href: '/terms', labelKey: 'footer.links.terms' },
      { href: '/refunds', labelKey: 'footer.links.refunds' },
    ]
  }
];

const Footer = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const [logoError, setLogoError] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const platformConfig = getPlatformConfig();
  const brand = platformConfig?.brand || {};
  const footer = platformConfig?.footer || {};

  const brandName = brand.name || 'ABYSSiNIA';
  const brandSuffix = brand.suffix || 'Tech Academy';
  const brandLogoAlt = brand.logoAlt || brandName;

  const activeLogo =
    theme === 'light' ? brand.logoLight || brand.logo : brand.logo;

  const tagline = resolveLabel(t, 'footer.tagline', brand.tagline || '');
  const madeIn = resolveLabel(t, 'footer.madeIn', 'Made in Ethiopia');

  const contactEmail = brand.email || '';
  const contactPhone = brand.contactPhone || '';
  const contactLocation = brand.location || '';
  const contactTelegram = brand.telegramSupport || '';

  const socialLinks = brand.socialLinks || {};
  const socialEntries = Object.entries(socialLinks).filter(
    ([, href]) => typeof href === 'string' && href.length > 0
  );

  // Fallback guarantees the grid always renders, fixing the empty footer bug
  const columns = Array.isArray(footer.columns) && footer.columns.length > 0
    ? footer.columns
    : FOOTER_COLUMNS_FALLBACK;

  const currentYear = new Date().getFullYear();
  const copyrightSuffix =
    footer.copyrightSuffix || 'ABYSSiNiA Tech Academy. All rights reserved.';
  const poweredByLabel = footer.poweredByLabel || 'Powered by SoDar!';
  const backToTopLabel = footer.backToTopLabel || 'Back to top';

  const handleBackToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleNewsletterSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = newsletterEmail.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      if (!isValid) {
        setNewsletterStatus('error');
        return;
      }
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(null), 4000);
    },
    [newsletterEmail]
  );

  return (
    <footer className="relative z-40 w-full mt-auto bg-bg-card-solid border-t border-border-medium text-sm text-text-dim">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* BRAND COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label={brandName}>
              {activeLogo && !logoError ? (
                <div className="relative h-10 w-auto min-w-[140px] flex items-center">
                  <Image
                    key={activeLogo}
                    src={activeLogo}
                    alt={brandLogoAlt}
                    width={brand.footerLogoWidth || 140}
                    height={brand.logoHeight || 40}
                    onError={() => setLogoError(true)}
                    className="object-contain h-full w-auto group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-light via-accent to-accent-dark flex items-center justify-center shadow-glow-gold-sm">
                    <Code2 className="w-5 h-5 text-text-inverse" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-base font-extrabold text-text-main tracking-tight">{brandName}</span>
                    <span className="text-[10px] tracking-[0.12em] text-text-dim uppercase font-medium mt-0.5">{brandSuffix}</span>
                  </div>
                </>
              )}
            </Link>

            {tagline && <p className="text-xs text-text-muted leading-relaxed max-w-sm">{tagline}</p>}

            <div className="inline-flex items-center text-2xs font-bold text-accent">{madeIn}</div>

            {socialEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {socialEntries.map(([key, href]) => {
                  const Icon = SOCIAL_ICONS[key] || Send;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="w-9 h-9 rounded-lg bg-bg-pill border border-border-light flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/10 hover:border-accent/40 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* LINK COLUMNS */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.key} className="flex flex-col gap-3">
                <h3 className="text-2xs font-extrabold uppercase tracking-[0.15em] text-text-main">
                  {resolveLabel(t, col.labelKey, col.key)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {(col.links || []).map((link) => (
                    <li key={`${col.key}-${link.href}-${link.labelKey}`}>
                      <Link href={link.href} className="text-xs text-text-muted hover:text-accent transition-colors underline-offset-4 hover:underline">
                        {resolveLabel(t, link.labelKey, '')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CONTACT + NEWSLETTER */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <h3 className="text-2xs font-extrabold uppercase tracking-[0.15em] text-text-main">
              {resolveLabel(t, 'footer.contactTitle', 'Get in touch')}
            </h3>

            <ul className="flex flex-col gap-2.5 text-xs text-text-muted">
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 hover:text-accent transition-colors">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contactEmail}</span>
                  </a>
                </li>
              )}
              {contactTelegram && (
                <li>
                  <a href={contactTelegram.startsWith('http') ? contactTelegram : `https://t.me/${contactTelegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent transition-colors">
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contactTelegram}</span>
                  </a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-2 hover:text-accent transition-colors">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{contactPhone}</span>
                  </a>
                </li>
              )}
              {contactLocation && (
                <li className="inline-flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{contactLocation}</span>
                </li>
              )}
            </ul>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 mt-2" aria-label={resolveLabel(t, 'footer.newsletterTitle', 'Newsletter')}>
              <label className="text-2xs font-bold text-text-main uppercase tracking-wider">
                {resolveLabel(t, 'footer.newsletterTitle', 'Stay in the loop')}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={resolveLabel(t, 'footer.newsletterPlaceholder', 'Enter your email')}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-bg-input border border-border-medium text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  disabled={newsletterStatus === 'success'}
                />
                <button
                  type="submit"
                  className="shrink-0 px-3 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors disabled:opacity-50"
                  disabled={newsletterStatus === 'success'}
                >
                  {resolveLabel(t, 'footer.newsletterButton', 'Subscribe')}
                </button>
              </div>
              {newsletterStatus === 'success' && (
                <p className="text-2xs text-success font-semibold">{resolveLabel(t, 'footer.newsletterSuccess', 'You are subscribed.')}</p>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-2xs text-error font-semibold">{resolveLabel(t, 'footer.newsletterError', 'Please enter a valid email.')}</p>
              )}
            </form>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-2xs text-text-dim text-center sm:text-left">
            &copy; {currentYear} {copyrightSuffix}
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <LanguageToggle />
            <span className="text-text-dim/60 hidden sm:inline">&bull;</span>
            <p className="text-2xs text-text-dim">{poweredByLabel}</p>
            <button
              type="button"
              onClick={handleBackToTop}
              aria-label={backToTopLabel}
              title={backToTopLabel}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-pill border border-border-light text-text-muted hover:text-accent hover:border-accent/40 transition-colors text-2xs font-bold"
            >
              <ArrowUp className="w-3 h-3" />
              <span className="hidden sm:inline">{backToTopLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;