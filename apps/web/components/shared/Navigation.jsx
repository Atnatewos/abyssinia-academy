/**
 * @fileoverview Main Navigation Header
 *
 * Premium sticky header built on the existing design-system classes
 * (nav-header / nav-pills / nav-controls / nav-mobile-menu).
 * Includes the config-gated "Earn" anchor pill (#earn) that jumps to
 * the Learn & Earn section on the landing page.
 *
 * Path: apps/web/components/shared/Navigation.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Code2,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  LogIn,
  Zap,
  ChevronDown,
  User,
  Share2,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getPlatformConfig, getLandingEarnConfig } from '../../lib/config';

const Navigation = () => {
  const router = useRouter();
  const { t, language, toggleLanguage, mounted: langMounted } = useLanguage();
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const platformConfig = getPlatformConfig();
  const brand = platformConfig?.brand || {};
  const brandName = brand.name || 'ABYSSiNIA';
  const brandSuffix = brand.suffix || 'Tech Academy';

  /* Earn pill is config-gated so marketing can disable it without a deploy */
  const earnConfig = getLandingEarnConfig();
  const earnEnabled = earnConfig?.enabled !== false;
  const earnAnchorId = earnConfig?.anchorId || 'earn';

  const navLabels = t.landing?.nav || {};
  const isMounted = langMounted && themeMounted;
  const isEnrolled = Boolean(user?.is_enrolled || user?.isEnrolled);

  /**
   * Sticky header elevation on scroll.
   */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Close transient menus on route change.
   */
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [router.pathname]);

  /**
   * Close the profile dropdown on outside click.
   */
  useEffect(() => {
    if (!isProfileOpen) return undefined;
    const handleOutside = (event) => {
      if (!event.target.closest('.nav-profile-dropdown')) setIsProfileOpen(false);
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [isProfileOpen]);

  const handleLogout = useCallback(async () => {
    if (typeof logout === 'function') await logout();
    setIsProfileOpen(false);
    router.push('/');
  }, [logout, router]);

  /* Desktop pill set — Earn inserted between Courses and Tuition */
  const pills = [
    { href: '/', label: navLabels.overview || 'Overview', exact: true },
    { href: '/courses', label: navLabels.courses || 'Courses' },
    ...(earnEnabled ? [{ href: '/#earn', label: navLabels.earn || 'Earn' }] : []),
    { href: '/pricing', label: navLabels.tuition || 'Tuition' },
    { href: '/contact', label: navLabels.contact || 'Contact' },
    ...(isAuthenticated
      ? [{ href: '/portal', label: navLabels.portal || 'Classroom Portal', dot: isEnrolled }]
      : []),
  ];

  const mobileLinks = pills;

  return (
    <header className={`nav-header ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Brand */}
        <Link href="/" className="nav-logo" aria-label={brandName}>
          <div className="nav-logo-icon">
            <Code2 />
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-name">{brandName}</span>
            <span className="nav-logo-suffix">{brandSuffix}</span>
          </div>
        </Link>

        {/* Desktop pills */}
        <nav className="nav-pills" aria-label="Primary">
          {pills.map((pill) => {
            const active = pill.exact
              ? router.pathname === pill.href
              : router.pathname.startsWith(pill.href);
            return (
              <Link key={pill.href} href={pill.href} className={`nav-pill ${active ? 'active' : ''}`}>
                {pill.label}
                {pill.dot ? <span className="nav-pill-dot" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="nav-controls">
          <button type="button" className="nav-icon-btn" onClick={toggleLanguage} disabled={!isMounted} aria-label="Switch language">
            <Globe />
            <span>{isMounted ? language.toUpperCase() : 'EN'}</span>
          </button>

          <button
            type="button"
            className="nav-icon-btn nav-theme-btn"
            onClick={toggleTheme}
            disabled={!isMounted}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isMounted && (theme === 'dark' ? <Sun /> : <Moon />)}
          </button>

          {isAuthenticated ? (
            <div className="nav-profile-dropdown">
              <button
                type="button"
                className="nav-profile-trigger"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
              >
                <span className="nav-profile-avatar">
                  {(user?.full_name || user?.fullName || 'A').charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={14} className={`nav-profile-chevron ${isProfileOpen ? 'open' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="nav-dropdown-menu" role="menu">
                  <div className="nav-dropdown-header">
                    <span className="nav-dropdown-user-name">{user?.full_name || user?.fullName || ''}</span>
                    <span className="nav-dropdown-user-email">{user?.email || user?.phone || ''}</span>
                  </div>
                  <div className="nav-dropdown-divider" />
                  <Link href="/profile" className="nav-dropdown-item" role="menuitem">
                    <User size={16} />
                    {navLabels.myProfile || 'My Profile'}
                  </Link>
                  <Link href="/profile/referrals" className="nav-dropdown-item" role="menuitem">
                    <Share2 size={16} />
                    {navLabels.referralDashboard || 'Referral Dashboard'}
                  </Link>
                  <Link href="/portal" className="nav-dropdown-item" role="menuitem">
                    <BookOpen size={16} />
                    {navLabels.portal || 'Classroom Portal'}
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <button type="button" className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout} role="menuitem">
                    <LogOut size={16} />
                    {navLabels.logout || 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-unauth-group">
              <Link href="/auth/login" className="nav-signin-btn">
                <LogIn size={15} />
                <span>{navLabels.signIn || 'Sign In'}</span>
              </Link>
              <Link href="/auth/register" className="nav-enroll-btn">
                <span className="nav-enroll-btn-bg" aria-hidden="true" />
                <span className="nav-enroll-btn-text">
                  <Zap size={15} />
                  {navLabels.enroll || 'Enroll Now'}
                </span>
              </Link>
            </div>
          )}

          <button
            type="button"
            className="nav-mobile-toggle"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="nav-mobile-menu">
          {mobileLinks.map((pill) => (
            <Link key={pill.href} href={pill.href} className={`nav-mobile-link ${router.pathname === pill.href ? 'active' : ''}`}>
              {pill.label}
              {pill.dot ? <span className="nav-pill-dot" aria-hidden="true" /> : null}
            </Link>
          ))}
          <div className="nav-mobile-divider" />
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="nav-mobile-link">{navLabels.myProfile || 'My Profile'}</Link>
              <Link href="/profile/referrals" className="nav-mobile-link">{navLabels.referralDashboard || 'Referral Dashboard'}</Link>
              <button type="button" className="nav-mobile-logout" onClick={handleLogout}>
                <LogOut size={18} />
                {navLabels.logout || 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-mobile-link">{navLabels.signIn || 'Sign In'}</Link>
              <Link href="/auth/register" className="nav-mobile-cta">
                <Zap size={16} />
                {navLabels.enroll || 'Enroll Now'}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navigation;