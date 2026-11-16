// /**
//  * @fileoverview Main Navigation Header
//  *
//  * Pure Tailwind implementation. The mobile menu uses a theme-aware RGBA
//  * background so it matches both light and dark modes, and includes a
//  * styled in-panel close button. The notification bell is intentionally
//  * omitted inside the mobile dropdown because it already lives in the
//  * navbar (top-right) and remains visible at all breakpoints.
//  *
//  * Path: apps/web/components/shared/Navigation.jsx
//  */

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useRouter } from 'next/router';
// import {
//   Code2,
//   Menu,
//   X,
//   Sun,
//   Moon,
//   LogIn,
//   Zap,
//   ChevronDown,
//   User,
//   Share2,
//   LogOut,
//   BookOpen,
//   GraduationCap,
//   Store,
//   Wallet,
// } from 'lucide-react';
// import { useLanguage } from '../../context/LanguageContext';
// import { useTheme } from '../../context/ThemeContext';
// import { useAuth } from '../../context/AuthContext';
// import { useBanner } from '../../context/BannerContext';
// import { getPlatformConfig, getLandingConfig } from '../../lib/config';
// import { useWalletBalance } from '../../hooks/useWalletBalance';
// import NotificationBell from '../notifications/NotificationBell';
// import LanguageToggle from './LanguageToggle';

// const NAV_FALLBACKS = {
//   overview: 'Overview',
//   courses: 'Courses',
//   scholarships: 'Scholarships',
//   earn: 'Earn',
//   tuition: 'Tuition',
//   contact: 'Contact',
//   portal: 'Classroom Portal',
//   signIn: 'Sign In',
//   enroll: 'Enroll Now',
//   logout: 'Logout',
//   myProfile: 'My Profile',
//   myResellerStore: 'My Reseller Store',
//   referralDashboard: 'Referral Dashboard',
//   myScholarships: 'My Scholarships',
// };

// const resolveNavLabel = (t, keyPath) => {
//   if (!keyPath || typeof keyPath !== 'string') return '';
//   const parts = keyPath.split('.');
//   let value = t;
//   for (const part of parts) {
//     value = value?.[part];
//     if (value === undefined || value === null) break;
//   }
//   if (typeof value === 'string' && value.length > 0) return value;
//   const leaf = parts[parts.length - 1];
//   if (NAV_FALLBACKS[leaf]) return NAV_FALLBACKS[leaf];
//   return leaf.charAt(0).toUpperCase() + leaf.slice(1);
// };

// const resolveConfig = (cfg, keyPath) => {
//   if (!keyPath || typeof keyPath !== 'string') return undefined;
//   const parts = keyPath.split('.');
//   let value = cfg;
//   for (const part of parts) {
//     value = value?.[part];
//     if (value === undefined || value === null) return undefined;
//   }
//   return value;
// };

// const resolveLabel = (t, keyPath, fallbackKey) => {
//   const parts = keyPath.split('.');
//   let value = t;
//   for (const part of parts) {
//     value = value?.[part];
//     if (value === undefined || value === null) break;
//   }
//   if (typeof value === 'string' && value.length > 0) return value;
//   return NAV_FALLBACKS[fallbackKey] || fallbackKey;
// };

// const Navigation = () => {
//   const router = useRouter();
//   const { t, mounted: langMounted } = useLanguage();
//   const { theme, toggleTheme, mounted: themeMounted } = useTheme();
//   const { isAuthenticated, user, logout } = useAuth();
//   const { isVisible: bannerVisible, bannerHeight, animationDurationMs } = useBanner();

//   const { balance, loading: balanceLoading } = useWalletBalance(isAuthenticated);

//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [logoError, setLogoError] = useState(false);

//   const platformConfig = getPlatformConfig();
//   const brand = platformConfig?.brand || {};
//   const brandName = brand.name || 'ABYSSiNIA';
//   const brandSuffix = brand.suffix || 'Tech Academy';
//   const brandLogoAlt = brand.logoAlt || brandName;

//   const landingConfig = getLandingConfig();
//   const isMounted = langMounted && themeMounted;
//   const isEnrolled = Boolean(user?.is_enrolled || user?.isEnrolled);

//   const activeLogo = useMemo(() => {
//     if (!themeMounted) return brand.logo;
//     return theme === 'light' ? brand.logoLight || brand.logo : brand.logo;
//   }, [theme, themeMounted, brand.logo, brand.logoLight]);

//   /**
//    * Mobile menu background — theme-aware RGBA.
//    * Kept identical to the previous version so no visual regressions.
//    */
//   const mobileMenuBackground = useMemo(
//     () =>
//       theme === 'light'
//         ? 'rgba(255, 255, 255, 0.93)'
//         : 'rgba(15, 23, 42, 0.93)',
//     [theme]
//   );

//   const pills = useMemo(() => {
//     const configured = Array.isArray(landingConfig?.navLinks)
//       ? landingConfig.navLinks
//       : [];

//     const fallback = [
//       { href: '/', labelKey: 'nav.overview', exact: true },
//       { href: '/courses', labelKey: 'nav.courses' },
//       { href: '/scholarships', labelKey: 'scholarships.nav.scholarships' },
//       { href: '/pricing', labelKey: 'nav.tuition' },
//       { href: '/contact', labelKey: 'nav.contact' },
//     ];

//     const source = configured.length > 0 ? configured : fallback;

//     return source
//       .filter((item) => {
//         if (item.requiresAuth && !isAuthenticated) return false;
//         if (item.configGate) {
//           const gateValue = resolveConfig(
//             { landing: landingConfig },
//             item.configGate
//           );
//           if (gateValue === false) return false;
//         }
//         return true;
//       })
//       .map((item) => ({
//         href: item.href,
//         label: resolveNavLabel(t, item.labelKey),
//         exact: item.exact === true,
//         dot: item.showDot === 'enrolled' ? isEnrolled : false,
//       }));
//   }, [landingConfig, t, isAuthenticated, isEnrolled]);

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     handleScroll();
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     setIsMobileOpen(false);
//     setIsProfileOpen(false);
//   }, [router.pathname]);

//   useEffect(() => {
//     if (!isProfileOpen) return undefined;
//     const handleOutside = (event) => {
//       if (!event.target.closest('[data-nav-profile]')) setIsProfileOpen(false);
//     };
//     document.addEventListener('click', handleOutside);
//     return () => document.removeEventListener('click', handleOutside);
//   }, [isProfileOpen]);

//   /* Lock body scroll when the mobile menu is open */
//   useEffect(() => {
//     if (isMobileOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => { document.body.style.overflow = ''; };
//   }, [isMobileOpen]);

//   const handleLogout = useCallback(async () => {
//     if (typeof logout === 'function') await logout();
//     setIsProfileOpen(false);
//     router.push('/');
//   }, [logout, router]);

//   const isActive = (href, exact) => {
//     if (exact) return router.pathname === href;
//     if (href === '/#earn') return false;
//     return router.pathname.startsWith(href);
//   };

//   useEffect(() => {
//     setLogoError(false);
//   }, [theme]);

//   const topOffset = bannerVisible ? bannerHeight : 0;

//   return (
//     <header
//       className={`fixed left-0 right-0 z-50 h-[72px] flex items-center px-4 sm:px-6 lg:px-10
//                   backdrop-blur-xl saturate-150 border-b transition-all duration-300
//                   ${isScrolled
//                     ? 'bg-bg-nav-scrolled border-accent/20 shadow-lg'
//                     : 'bg-bg-nav border-transparent'}`}
//       style={{
//         top: `${topOffset}px`,
//         transitionDuration: `${animationDurationMs}ms`,
//       }}
//     >
//       <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
//         {/* Brand */}
//         <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label={brandName}>
//           {activeLogo && !logoError ? (
//             <div className="relative h-10 w-auto min-w-[140px] flex items-center">
//               <Image
//                 key={activeLogo}
//                 src={activeLogo}
//                 alt={brandLogoAlt}
//                 width={brand.logoWidth || 140}
//                 height={brand.logoHeight || 40}
//                 priority
//                 onError={() => setLogoError(true)}
//                 className="object-contain h-full w-auto group-hover:scale-[1.02] transition-transform duration-300"
//               />
//             </div>
//           ) : (
//             <>
//               <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-light via-accent to-accent-dark flex items-center justify-center shadow-glow-gold-sm group-hover:scale-105 transition-transform duration-300">
//                 <Code2 className="w-5 h-5 text-text-inverse" />
//               </div>
//               <div className="hidden sm:flex flex-col leading-none">
//                 <span className="text-base font-extrabold text-text-main tracking-tight">{brandName}</span>
//                 <span className="text-[10px] tracking-[0.12em] text-text-dim uppercase font-medium mt-0.5">{brandSuffix}</span>
//               </div>
//             </>
//           )}
//         </Link>

//         {/* Desktop pills */}
//         <nav className="hidden md:flex items-center gap-0.5 bg-bg-pill-container p-1 rounded-full border border-border-pill" aria-label="Primary">
//           {pills.map((pill) => {
//             const active = isActive(pill.href, pill.exact);
//             return (
//               <Link
//                 key={pill.href}
//                 href={pill.href}
//                 className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
//                             ${active
//                               ? 'bg-accent text-text-inverse font-semibold shadow-glow-gold-sm'
//                               : 'text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover'}`}
//               >
//                 {pill.label}
//                 {pill.dot ? (
//                   <span className="inline-block w-1.5 h-1.5 rounded-full bg-success ml-1.5 align-middle animate-pulse" aria-hidden="true" />
//                 ) : null}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Controls */}
//         <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
//           <LanguageToggle />

//           <button
//             type="button"
//             className="p-2 rounded-lg text-text-nav-icon hover:text-text-nav-icon-hover hover:bg-bg-icon-btn-hover transition-colors"
//             onClick={toggleTheme}
//             disabled={!isMounted}
//             aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
//           >
//             {isMounted && (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
//           </button>

//           {isAuthenticated && (
//             <Link
//               href="/profile/referrals"
//               className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all mr-1"
//               title="View Wallet Dashboard"
//             >
//               <Wallet className="w-3.5 h-3.5" />
//               <span className="text-xs font-bold font-mono">
//                 {balanceLoading ? '...' : balance !== null ? `${balance.toLocaleString()} ETB` : '0 ETB'}
//               </span>
//             </Link>
//           )}

//           {isAuthenticated && <NotificationBell />}

//           {isAuthenticated ? (
//             <div className="relative" data-nav-profile>
//               <button
//                 type="button"
//                 className="flex items-center gap-1 p-0.5 pr-1.5 rounded-full border border-transparent hover:bg-bg-icon-btn-hover hover:border-border-pill transition-colors"
//                 onClick={() => setIsProfileOpen((prev) => !prev)}
//                 aria-expanded={isProfileOpen}
//                 aria-haspopup="menu"
//               >
//                 <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-text-inverse text-xs font-bold shrink-0">
//                   {(user?.full_name || user?.fullName || 'A').charAt(0).toUpperCase()}
//                 </span>
//                 <ChevronDown size={14} className={`text-text-nav-icon transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isProfileOpen && (
//                 <div role="menu" className="absolute top-[calc(100%+8px)] right-0 w-60 rounded-xl border border-border-nav-scrolled bg-bg-card-solid backdrop-blur-xl shadow-xl p-2 z-[55] animate-fade-in-up">
//                   <div className="px-3 pt-2 pb-2">
//                     <p className="text-xs font-bold text-text-main truncate">{user?.full_name || user?.fullName || ''}</p>
//                     <p className="text-[11px] text-text-dim truncate mt-0.5">{user?.email || user?.phone || ''}</p>
//                   </div>
//                   <div className="h-px bg-border-light my-1" />
//                   <Link href="/profile" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
//                     <User className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.myProfile', 'myProfile')}
//                   </Link>
//                   <Link href="/profile/reseller" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
//                     <Store className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.myResellerStore', 'myResellerStore')}
//                   </Link>
//                   <Link href="/profile/scholarships" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
//                     <GraduationCap className="w-4 h-4" />
//                     {resolveLabel(t, 'scholarships.myApplications.pageTitle', 'myScholarships')}
//                   </Link>
//                   <Link href="/profile/referrals" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
//                     <Share2 className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.referralDashboard', 'referralDashboard')}
//                   </Link>
//                   <Link href="/portal" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
//                     <BookOpen className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.portal', 'portal')}
//                   </Link>
//                   <div className="h-px bg-border-light my-1" />
//                   <button type="button" role="menuitem" onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-colors">
//                     <LogOut className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.logout', 'logout')}
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex items-center gap-1">
//               <Link href="/auth/login" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-nav-icon hover:text-text-nav-icon-hover hover:bg-bg-icon-btn-hover transition-colors">
//                 <LogIn className="w-4 h-4" />
//                 <span>{resolveLabel(t, 'nav.signIn', 'signIn')}</span>
//               </Link>
//               <Link href="/auth/register" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent text-text-inverse text-xs font-bold shadow-glow-gold-sm hover:bg-accent-light hover:-translate-y-0.5 transition-all">
//                 <Zap className="w-3.5 h-3.5" />
//                 {resolveLabel(t, 'nav.enroll', 'enroll')}
//               </Link>
//             </div>
//           )}

//           <button
//             type="button"
//             className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border-pill text-text-nav-icon hover:bg-bg-icon-btn-hover transition-colors"
//             onClick={() => setIsMobileOpen((prev) => !prev)}
//             aria-expanded={isMobileOpen}
//             aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
//           >
//             {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//           </button>
//         </div>
//       </div>

//       {/* MOBILE MENU — Floating Panel with theme-aware RGBA and in-panel close button */}
//       {isMobileOpen && (
//         <>
//           {/* Blurred Backdrop Overlay */}
//           <div
//             className="fixed inset-0 top-[72px] bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fade-in"
//             onClick={() => setIsMobileOpen(false)}
//             aria-hidden="true"
//           />

//           {/* Floating Menu Panel */}
//           <div
//             className="fixed z-40 md:hidden
//                        top-[84px] left-4 right-4
//                        border border-border-medium
//                        rounded-2xl
//                        shadow-2xl shadow-black/60
//                        max-h-[75vh]
//                        overflow-y-auto
//                        flex flex-col
//                        animate-fade-in-up
//                        backdrop-blur-3xl"
//             style={{ backgroundColor: mobileMenuBackground }}
//           >
//             {/* Panel header: title + in-panel close button */}
//             <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-border-light">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
//                 <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
//                   Menu
//                 </span>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsMobileOpen(false)}
//                 aria-label="Close menu"
//                 className="flex items-center justify-center w-8 h-8 rounded-lg
//                            text-text-muted
//                            hover:text-text-main
//                            hover:bg-bg-ghost-hover
//                            active:scale-95
//                            transition-all duration-150"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* Panel body */}
//             <div className="flex flex-col gap-1 px-4 pt-3 pb-6">
//               {isAuthenticated && (
//                 <div className="mb-3 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between">
//                   <div className="flex items-center gap-2 text-accent">
//                     <Wallet className="w-4 h-4" />
//                     <span className="text-xs font-bold uppercase tracking-wider">Wallet Balance</span>
//                   </div>
//                   <span className="text-sm font-extrabold text-accent font-mono">
//                     {balanceLoading ? '...' : balance !== null ? `${balance.toLocaleString()} ETB` : '0 ETB'}
//                   </span>
//                 </div>
//               )}

//               {pills.map((pill) => {
//                 const active = isActive(pill.href, pill.exact);
//                 return (
//                   <Link
//                     key={pill.href}
//                     href={pill.href}
//                     className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
//                                 ${active
//                                   ? 'bg-accent/10 text-accent font-semibold'
//                                   : 'text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover'}`}
//                   >
//                     {pill.label}
//                     {pill.dot ? (
//                       <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
//                     ) : null}
//                   </Link>
//                 );
//               })}

//               <div className="h-px bg-border-light my-2" />

//               {/*
//                 Note: The NotificationBell is intentionally NOT rendered inside
//                 the mobile dropdown. It remains in the top navbar at all
//                 breakpoints so users still have access to it.
//               */}
//               {isAuthenticated ? (
//                 <>
//                   <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
//                     <User className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.myProfile', 'myProfile')}
//                   </Link>
//                   <Link href="/profile/reseller" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
//                     <Store className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.myResellerStore', 'myResellerStore')}
//                   </Link>
//                   <Link href="/profile/scholarships" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
//                     <GraduationCap className="w-4 h-4" />
//                     {resolveLabel(t, 'scholarships.myApplications.pageTitle', 'myScholarships')}
//                   </Link>
//                   <Link href="/profile/referrals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
//                     <Share2 className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.referralDashboard', 'referralDashboard')}
//                   </Link>
//                   <button
//                     type="button"
//                     onClick={handleLogout}
//                     className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm text-error hover:bg-error/10 transition-colors mt-1"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.logout', 'logout')}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/auth/login" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-text-nav-link hover:bg-bg-ghost-hover transition-colors">
//                     {resolveLabel(t, 'nav.signIn', 'signIn')}
//                   </Link>
//                   <Link href="/auth/register" className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-accent text-text-inverse text-sm font-bold shadow-glow-gold-sm mt-2">
//                     <Zap className="w-4 h-4" />
//                     {resolveLabel(t, 'nav.enroll', 'enroll')}
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </header>
//   );
// };

// export default Navigation;





/**
 * @fileoverview Main Navigation Header
 *
 * Pure Tailwind implementation. The mobile menu uses a theme-aware RGBA
 * background so it matches both light and dark modes, and includes a
 * styled in-panel close button. The notification bell is intentionally
 * omitted inside the mobile dropdown because it already lives in the
 * navbar (top-right) and remains visible at all breakpoints.
 *
 * Path: apps/web/components/shared/Navigation.jsx
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Code2,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  Zap,
  ChevronDown,
  User,
  Share2,
  LogOut,
  BookOpen,
  GraduationCap,
  Store,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useBanner } from '../../context/BannerContext';
import { getPlatformConfig, getLandingConfig } from '../../lib/config';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import NotificationBell from '../notifications/NotificationBell';
import LanguageToggle from './LanguageToggle';

const NAV_FALLBACKS = {
  overview: 'Overview',
  courses: 'Courses',
  scholarships: 'Scholarships',
  earn: 'Earn',
  tuition: 'Tuition',
  contact: 'Contact',
  portal: 'Classroom Portal',
  signIn: 'Sign In',
  enroll: 'Enroll Now',
  logout: 'Logout',
  myProfile: 'My Profile',
  myResellerStore: 'My Reseller Store',
  referralDashboard: 'Referral Dashboard',
  myScholarships: 'My Scholarships',
};

const resolveNavLabel = (t, keyPath) => {
  if (!keyPath || typeof keyPath !== 'string') return '';
  const parts = keyPath.split('.');
  let value = t;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined || value === null) break;
  }
  if (typeof value === 'string' && value.length > 0) return value;
  const leaf = parts[parts.length - 1];
  if (NAV_FALLBACKS[leaf]) return NAV_FALLBACKS[leaf];
  return leaf.charAt(0).toUpperCase() + leaf.slice(1);
};

const resolveConfig = (cfg, keyPath) => {
  if (!keyPath || typeof keyPath !== 'string') return undefined;
  const parts = keyPath.split('.');
  let value = cfg;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined || value === null) return undefined;
  }
  return value;
};

const resolveLabel = (t, keyPath, fallbackKey) => {
  const parts = keyPath.split('.');
  let value = t;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined || value === null) break;
  }
  if (typeof value === 'string' && value.length > 0) return value;
  return NAV_FALLBACKS[fallbackKey] || fallbackKey;
};

const Navigation = () => {
  const router = useRouter();
  const { t, mounted: langMounted } = useLanguage();
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { isVisible: bannerVisible, bannerHeight, animationDurationMs } = useBanner();

  const { balance, loading: balanceLoading } = useWalletBalance(isAuthenticated);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const platformConfig = getPlatformConfig();
  const brand = platformConfig?.brand || {};
  const brandName = brand.name || 'ABYSSiNIA';
  const brandSuffix = brand.suffix || 'Tech Academy';
  const brandLogoAlt = brand.logoAlt || brandName;

  const landingConfig = getLandingConfig();
  const isMounted = langMounted && themeMounted;
  const isEnrolled = Boolean(user?.is_enrolled || user?.isEnrolled);

  const activeLogo = useMemo(() => {
    if (!themeMounted) return brand.logo;
    return theme === 'light' ? brand.logoLight || brand.logo : brand.logo;
  }, [theme, themeMounted, brand.logo, brand.logoLight]);

  const mobileMenuBackground = useMemo(
    () =>
      theme === 'light'
        ? 'rgba(255, 255, 255, 0.93)'
        : 'rgba(15, 23, 42, 0.93)',
    [theme]
  );

  const pills = useMemo(() => {
    const fallback = [
      { href: '/', labelKey: 'nav.overview', exact: true },
      { href: '/courses', labelKey: 'nav.courses' },
      { href: '/scholarships', labelKey: 'scholarships.nav.scholarships' },
      { href: '/#earn', labelKey: 'nav.earn' },
      { href: '/pricing', labelKey: 'nav.tuition' },
      { href: '/contact', labelKey: 'nav.contact' },
    ];

    const configured = Array.isArray(landingConfig?.navLinks) && landingConfig.navLinks.length > 0
      ? landingConfig.navLinks
      : fallback;

    return configured
      .filter((item) => {
        if (item.requiresAuth && !isAuthenticated) return false;
        if (item.configGate) {
          const gateValue = resolveConfig(
            { landing: landingConfig },
            item.configGate
          );
          if (gateValue === false) return false;
        }
        return true;
      })
      .map((item) => ({
        href: item.href,
        label: resolveNavLabel(t, item.labelKey),
        exact: item.exact === true,
        dot: item.showDot === 'enrolled' ? isEnrolled : false,
      }));
  }, [landingConfig, t, isAuthenticated, isEnrolled]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!isProfileOpen) return undefined;
    const handleOutside = (event) => {
      if (!event.target.closest('[data-nav-profile]')) setIsProfileOpen(false);
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const handleLogout = useCallback(async () => {
    if (typeof logout === 'function') await logout();
    setIsProfileOpen(false);
    router.push('/');
  }, [logout, router]);

  const isActive = (href, exact) => {
    if (exact) return router.pathname === href;
    if (href === '/#earn') return false;
    return router.pathname.startsWith(href);
  };

  useEffect(() => {
    setLogoError(false);
  }, [theme]);

  const topOffset = bannerVisible ? bannerHeight : 0;

  return (
    <header
      className={`fixed left-0 right-0 z-50 h-[72px] flex items-center px-4 sm:px-6 lg:px-10
                  backdrop-blur-xl saturate-150 border-b transition-all duration-300
                  ${isScrolled
                    ? 'bg-bg-nav-scrolled border-accent/20 shadow-lg'
                    : 'bg-bg-nav border-transparent'}`}
      style={{
        top: `${topOffset}px`,
        transitionDuration: `${animationDurationMs}ms`,
      }}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label={brandName}>
          {activeLogo && !logoError ? (
            <div className="relative h-10 w-auto min-w-[140px] flex items-center">
              {/* Standard img tag used to prevent Vercel image optimization 404s on dynamic config paths */}
              <img
                key={activeLogo}
                src={activeLogo}
                alt={brandLogoAlt}
                onError={() => setLogoError(true)}
                className="object-contain h-full w-auto group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-light via-accent to-accent-dark flex items-center justify-center shadow-glow-gold-sm group-hover:scale-105 transition-transform duration-300">
                <Code2 className="w-5 h-5 text-text-inverse" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-base font-extrabold text-text-main tracking-tight">{brandName}</span>
                <span className="text-[10px] tracking-[0.12em] text-text-dim uppercase font-medium mt-0.5">{brandSuffix}</span>
              </div>
            </>
          )}
        </Link>

        {/* Desktop pills - isolated to prevent background bleed */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-transparent" aria-label="Primary">
          {pills.map((pill) => {
            const active = isActive(pill.href, pill.exact);
            return (
              <Link
                key={pill.href}
                href={pill.href}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                            ${active
                              ? 'bg-accent text-text-inverse font-semibold shadow-glow-gold-sm'
                              : 'text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover'}`}
              >
                {pill.label}
                {pill.dot ? (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success ml-1.5 align-middle animate-pulse" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <LanguageToggle />

          <button
            type="button"
            className="p-2 rounded-lg text-text-nav-icon hover:text-text-nav-icon-hover hover:bg-bg-icon-btn-hover transition-colors"
            onClick={toggleTheme}
            disabled={!isMounted}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isMounted && (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
          </button>

          {isAuthenticated && (
            <Link
              href="/profile/referrals"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all mr-1"
              title="View Wallet Dashboard"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-xs font-bold font-mono">
                {balanceLoading ? '...' : balance !== null ? `${balance.toLocaleString()} ETB` : '0 ETB'}
              </span>
            </Link>
          )}

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <div className="relative" data-nav-profile>
              <button
                type="button"
                className="flex items-center gap-1 p-0.5 pr-1.5 rounded-full border border-transparent hover:bg-bg-icon-btn-hover hover:border-border-pill transition-colors"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-text-inverse text-xs font-bold shrink-0">
                  {(user?.full_name || user?.fullName || 'A').charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={14} className={`text-text-nav-icon transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div role="menu" className="absolute top-[calc(100%+8px)] right-0 w-60 rounded-xl border border-border-nav-scrolled bg-bg-card-solid backdrop-blur-xl shadow-xl p-2 z-[55] animate-fade-in-up">
                  <div className="px-3 pt-2 pb-2">
                    <p className="text-xs font-bold text-text-main truncate">{user?.full_name || user?.fullName || ''}</p>
                    <p className="text-[11px] text-text-dim truncate mt-0.5">{user?.email || user?.phone || ''}</p>
                  </div>
                  <div className="h-px bg-border-light my-1" />
                  <Link href="/profile" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
                    <User className="w-4 h-4" />
                    {resolveLabel(t, 'nav.myProfile', 'myProfile')}
                  </Link>
                  <Link href="/profile/reseller" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
                    <Store className="w-4 h-4" />
                    {resolveLabel(t, 'nav.myResellerStore', 'myResellerStore')}
                  </Link>
                  <Link href="/profile/scholarships" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
                    <GraduationCap className="w-4 h-4" />
                    {resolveLabel(t, 'scholarships.myApplications.pageTitle', 'myScholarships')}
                  </Link>
                  <Link href="/profile/referrals" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
                    <Share2 className="w-4 h-4" />
                    {resolveLabel(t, 'nav.referralDashboard', 'referralDashboard')}
                  </Link>
                  <Link href="/portal" role="menuitem" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main hover:bg-bg-ghost-hover transition-colors">
                    <BookOpen className="w-4 h-4" />
                    {resolveLabel(t, 'nav.portal', 'portal')}
                  </Link>
                  <div className="h-px bg-border-light my-1" />
                  <button type="button" role="menuitem" onClick={handleLogout} className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    {resolveLabel(t, 'nav.logout', 'logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/auth/login" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-nav-icon hover:text-text-nav-icon-hover hover:bg-bg-icon-btn-hover transition-colors">
                <LogIn className="w-4 h-4" />
                <span>{resolveLabel(t, 'nav.signIn', 'signIn')}</span>
              </Link>
              <Link href="/auth/register" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent text-text-inverse text-xs font-bold shadow-glow-gold-sm hover:bg-accent-light hover:-translate-y-0.5 transition-all">
                <Zap className="w-3.5 h-3.5" />
                {resolveLabel(t, 'nav.enroll', 'enroll')}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border-pill text-text-nav-icon hover:bg-bg-icon-btn-hover transition-colors"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU — Floating Panel with theme-aware RGBA */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 top-[72px] bg-black/40 backdrop-blur-sm z-30 md:hidden animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed z-40 md:hidden
                       top-[84px] left-4 right-4
                       border border-border-medium
                       rounded-2xl
                       shadow-2xl shadow-black/60
                       max-h-[75vh]
                       overflow-y-auto
                       flex flex-col
                       animate-fade-in-up
                       backdrop-blur-3xl"
            style={{ backgroundColor: mobileMenuBackground }}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center w-8 h-8 rounded-lg
                           text-text-muted hover:text-text-main
                           hover:bg-bg-ghost-hover active:scale-95
                           transition-all duration-150"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1 px-4 pt-3 pb-6">
              {isAuthenticated && (
                <div className="mb-3 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-accent">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Wallet Balance</span>
                  </div>
                  <span className="text-sm font-extrabold text-accent font-mono">
                    {balanceLoading ? '...' : balance !== null ? `${balance.toLocaleString()} ETB` : '0 ETB'}
                  </span>
                </div>
              )}

              {pills.map((pill) => {
                const active = isActive(pill.href, pill.exact);
                return (
                  <Link
                    key={pill.href}
                    href={pill.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                ${active
                                  ? 'bg-accent/10 text-accent font-semibold'
                                  : 'text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover'}`}
                  >
                    {pill.label}
                    {pill.dot ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
                    ) : null}
                  </Link>
                );
              })}

              <div className="h-px bg-border-light my-2" />

              {isAuthenticated ? (
                <>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
                    <User className="w-4 h-4" />
                    {resolveLabel(t, 'nav.myProfile', 'myProfile')}
                  </Link>
                  <Link href="/profile/reseller" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
                    <Store className="w-4 h-4" />
                    {resolveLabel(t, 'nav.myResellerStore', 'myResellerStore')}
                  </Link>
                  <Link href="/profile/scholarships" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
                    <GraduationCap className="w-4 h-4" />
                    {resolveLabel(t, 'scholarships.myApplications.pageTitle', 'myScholarships')}
                  </Link>
                  <Link href="/profile/referrals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-nav-link hover:text-text-nav-link-hover hover:bg-bg-ghost-hover transition-colors">
                    <Share2 className="w-4 h-4" />
                    {resolveLabel(t, 'nav.referralDashboard', 'referralDashboard')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm text-error hover:bg-error/10 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    {resolveLabel(t, 'nav.logout', 'logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-text-nav-link hover:bg-bg-ghost-hover transition-colors">
                    {resolveLabel(t, 'nav.signIn', 'signIn')}
                  </Link>
                  <Link href="/auth/register" className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-accent text-text-inverse text-sm font-bold shadow-glow-gold-sm mt-2">
                    <Zap className="w-4 h-4" />
                    {resolveLabel(t, 'nav.enroll', 'enroll')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navigation;