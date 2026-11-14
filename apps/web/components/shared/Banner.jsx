// /**
//  * @fileoverview Top Promo Banner (Dismissible)
//  *
//  * Fixed strip that sits BELOW the navigation (top-[72px]). Dismissible
//  * via the X button, with persistence in BannerContext. Animated collapse
//  * when dismissed so the navigation slides up smoothly.
//  *
//  * Uses only Tailwind utility classes. No custom CSS classes. Colors
//  * resolve from the accent design token (bg-accent/95), so brand changes
//  * propagate automatically.
//  *
//  * Path: apps/web/components/shared/Banner.jsx
//  */

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { Sparkles, X } from 'lucide-react';
// import { useLanguage } from '../../context/LanguageContext';
// import { useBanner } from '../../context/BannerContext';
// import {
//   getCommissionStructure,
//   getWithdrawalConfig,
// } from '../../lib/config';

// const Banner = () => {
//   const { t } = useLanguage();
//   const {
//     isVisible,
//     mounted,
//     dismiss,
//     bannerHeight,
//     navHeight,
//     animationDurationMs,
//   } = useBanner();

//   /* Local flag to drive the exit animation before unmounting */
//   const [renderVisible, setRenderVisible] = useState(false);

//   /* Local copy so the animated collapse has time to play */
//   useEffect(() => {
//     if (isVisible) setRenderVisible(true);
//   }, [isVisible]);

//   const commissionConfig = getCommissionStructure();
//   const withdrawalConfig = getWithdrawalConfig();

//   const totalPerSale = commissionConfig?.totalPerSale || 0;
//   const processingHours = withdrawalConfig?.processingTimeHours || 48;

//   const rawText =
//     t.banner?.text ||
//     '💰 Students earn while they learn — up to {total} ETB per sale · Withdraw in {hours}h.';

//   const bannerText = rawText
//     .replace('{total}', totalPerSale.toLocaleString('en-US'))
//     .replace('{hours}', String(processingHours));

//   const ctaLabel =
//     t.banner?.claimDiscount ||
//     t.nav?.claimDiscount ||
//     'See How You Earn →';

//   /* 
//    * Don't render anything until mounted (SSR safe), or if the banner
//    * has fully collapsed and been unmounted.
//    */
//   if (!mounted) return null;
//   if (!isVisible && !renderVisible) return null;

//   return (
//     <div
//       role="region"
//       aria-label="Promotion"
//       className="fixed left-0 right-0 z-40
//                  flex items-center justify-center gap-2 sm:gap-3
//                  px-4 sm:px-6
//                  bg-accent text-text-inverse
//                  border-b border-accent-dark/40
//                  shadow-sm
//                  overflow-hidden
//                  transition-[height,opacity,transform] ease-out
//                  motion-reduce:transition-none"
//       style={{
//         top: `${navHeight}px`,
//         height: isVisible ? `${bannerHeight}px` : '0px',
//         opacity: isVisible ? 1 : 0,
//         transform: isVisible ? 'translateY(0)' : 'translateY(-4px)',
//         transitionDuration: `${animationDurationMs}ms`,
//       }}
//     >
//       <Sparkles
//         className="w-3.5 h-3.5 shrink-0 animate-[spin_6s_linear_infinite]"
//         aria-hidden="true"
//       />

//       <span className="text-[11px] sm:text-xs font-semibold truncate">
//         {bannerText}
//       </span>

//       <Link
//         href="/#earn"
//         className="hidden sm:inline-flex items-center gap-1
//                    text-[11px] font-extrabold whitespace-nowrap
//                    underline underline-offset-2
//                    hover:no-underline transition-all"
//       >
//         {ctaLabel}
//       </Link>

//       <button
//         type="button"
//         onClick={dismiss}
//         aria-label="Dismiss announcement"
//         className="ml-1 sm:ml-2 p-1 rounded-md
//                    text-text-inverse/80
//                    hover:text-text-inverse hover:bg-text-inverse/10
//                    transition-colors shrink-0"
//       >
//         <X className="w-3.5 h-3.5" />
//       </button>
//     </div>
//   );
// };

// export default Banner;







/**
 * @fileoverview Top Promo Banner (Dismissible)
 *
 * Fixed strip that sits ABOVE the navigation at top-0. Dismissible via
 * the X button, with persistence in BannerContext. When dismissed, the
 * navigation slides up from top-[40px] to top-0 and the page content
 * follows.
 *
 * Path: apps/web/components/shared/Banner.jsx
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBanner } from '../../context/BannerContext';
import {
  getCommissionStructure,
  getWithdrawalConfig,
} from '../../lib/config';

const Banner = () => {
  const { t } = useLanguage();
  const {
    isVisible,
    mounted,
    dismiss,
    bannerHeight,
    animationDurationMs,
  } = useBanner();

  /* Local flag drives the exit animation before unmount */
  const [renderVisible, setRenderVisible] = useState(false);

  useEffect(() => {
    if (isVisible) setRenderVisible(true);
  }, [isVisible]);

  const commissionConfig = getCommissionStructure();
  const withdrawalConfig = getWithdrawalConfig();

  const totalPerSale = commissionConfig?.totalPerSale || 0;
  const processingHours = withdrawalConfig?.processingTimeHours || 48;

  const rawText =
    t.banner?.text ||
    '💰 Students earn while they learn — up to {total} ETB per sale · Withdraw in {hours}h.';

  const bannerText = rawText
    .replace('{total}', totalPerSale.toLocaleString('en-US'))
    .replace('{hours}', String(processingHours));

  const ctaLabel =
    t.banner?.claimDiscount ||
    t.nav?.claimDiscount ||
    'See How You Earn →';

  if (!mounted) return null;
  if (!isVisible && !renderVisible) return null;

  return (
    <div
      role="region"
      aria-label="Promotion"
      className="fixed top-0 left-0 right-0 z-[60]
                 flex items-center justify-center gap-2 sm:gap-3
                 px-4 sm:px-6
                 bg-accent text-text-inverse
                 border-b border-accent-dark/40
                 shadow-sm
                 overflow-hidden
                 transition-[height,opacity,transform] ease-out
                 motion-reduce:transition-none"
      style={{
        height: isVisible ? `${bannerHeight}px` : '0px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-4px)',
        transitionDuration: `${animationDurationMs}ms`,
      }}
    >
      <Sparkles
        className="w-3.5 h-3.5 shrink-0 animate-[spin_6s_linear_infinite]"
        aria-hidden="true"
      />

      <span className="text-[11px] sm:text-xs font-semibold truncate">
        {bannerText}
      </span>

      <Link
        href="/#earn"
        className="hidden sm:inline-flex items-center gap-1
                   text-[11px] font-extrabold whitespace-nowrap
                   underline underline-offset-2
                   hover:no-underline transition-all"
      >
        {ctaLabel}
      </Link>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="ml-1 sm:ml-2 p-1 rounded-md
                   text-text-inverse/80
                   hover:text-text-inverse hover:bg-text-inverse/10
                   transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Banner;