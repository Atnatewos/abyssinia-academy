/**
 * @fileoverview Main Navigation Component
 * Clean, organized header with profile dropdown menu.
 * 
 * Desktop layout (left to right):
 * [Logo] [Pills: Overview, Courses, Classroom, Pricing] [spacer] [EN] [☀] [👤▼] [Enroll]
 * 
 * Profile dropdown (authenticated):
 *   ├─ My Profile
 *   ├─ My Courses  
 *   ├─ Referrals
 *   ├─ ─────────
 *   └─ Sign Out
 * 
 * Unauthenticated:
 *   [Sign In] [Enroll Now]
 * 
 * Path: apps/web/components/shared/Navigation.jsx
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Code2,
  Zap,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  User,
  Share2,
  LogOut,
  BookOpen,
  ChevronDown,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, t, toggleLanguage } = useLanguage();
  const { isAuthenticated, isEnrolled, user, logout } = useAuth();

  /*
   * Track scroll position for shadow/border transition
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /*
   * Close mobile menu and dropdown on route change
   */
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [router.pathname]);

  /*
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /*
   * Main navigation items
   */
  const navItems = [
    { path: '/', label: t.nav?.overview || 'Overview' },
    { path: '/courses', label: t.nav?.courses || 'Courses' },
    { path: '/portal', label: t.nav?.portal || 'Classroom', requiresEnrollment: true },
    { path: '/pricing', label: t.nav?.tuition || 'Pricing' },
    { path: '/contact', label: 'Contact' },
  ];

  /**
   * Check if a route is currently active
   */
  const isActive = (path) => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  /**
   * Logout with cleanup
   */
  const handleLogout = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    logout();
  };

  return (
    <header className={`nav-header ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">

        {/* ── Logo ── */}
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Code2 />
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-name">
              <span className="text-gradient-gold">ABYSSiNiA</span>
            </span>
            <span className="nav-logo-suffix">Tech Academy</span>
          </div>
        </Link>

        {/* ── Desktop Navigation Pills ── */}
        <nav className="nav-pills">
          {navItems.map((item) => {
            if (item.requiresEnrollment && !isEnrolled) return null;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-pill ${active ? 'active' : ''}`}
              >
                {item.label}
                {item.path === '/portal' && isEnrolled && (
                  <span className="nav-pill-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Right Side Controls ── */}
        <div className="nav-controls">

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="nav-icon-btn"
            title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <Globe size={16} />
            <span className="nav-icon-label">{language === 'en' ? 'EN' : 'አማ'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nav-icon-btn nav-theme-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* ── Authenticated: Profile Dropdown + Enrolled Badge ── */}
          {isAuthenticated ? (
            <>
              {/* Enrolled Indicator — subtle, outside dropdown */}
              {isEnrolled && (
                <span className="nav-enrolled-indicator" title="Enrolled">
                  <span className="nav-enrolled-indicator-dot" />
                </span>
              )}

              {/* Profile Dropdown */}
              <div className="nav-profile-dropdown" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="nav-profile-trigger"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="nav-profile-avatar">
                    {(user?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`nav-profile-chevron ${profileDropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="nav-dropdown-menu">
                    {/* User info header */}
                    <div className="nav-dropdown-header">
                      <span className="nav-dropdown-user-name">
                        {user?.full_name || 'Student'}
                      </span>
                      <span className="nav-dropdown-user-email">
                        {user?.phone || user?.email || ''}
                      </span>
                    </div>

                    <div className="nav-dropdown-divider" />

                    {/* Menu items */}
                    <Link
                      href="/profile"
                      className="nav-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User size={16} />
                      <span>{t.profile?.title || 'My Profile'}</span>
                    </Link>

                    {isEnrolled && (
                      <Link
                        href="/portal"
                        className="nav-dropdown-item"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <BookOpen size={16} />
                        <span>{t.nav?.portal || 'My Courses'}</span>
                      </Link>
                    )}

                    <Link
                      href="/profile/referrals"
                      className="nav-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Share2 size={16} />
                      <span>{t.referrals?.dashboardTitle || 'Referrals'}</span>
                    </Link>

                    <div className="nav-dropdown-divider" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="nav-dropdown-item nav-dropdown-logout"
                    >
                      <LogOut size={16} />
                      <span>{t.auth?.logout || 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Unauthenticated: Sign In + Enroll ── */
            /* ── Unauthenticated: Sign In + Register + Enroll ── */
            <div className="nav-unauth-group">
              <Link href="/auth/login" className="nav-signin-btn">
                <LogIn size={14} />
                <span>{t.auth?.signIn || 'Sign In'}</span>
              </Link>

              <Link href="/auth/register" className="nav-signin-btn">
                <UserPlus size={14} />
                <span>{t.auth?.register || 'Register'}</span>
              </Link>

              <Link href="/checkout" className="nav-enroll-btn">
                <span className="nav-enroll-btn-bg" />
                <span className="nav-enroll-btn-text">
                  <Zap size={14} />
                  <span>{t.nav?.enrollNow || 'Enroll Now'}</span>
                </span>
              </Link>
            </div>
          )}

          {/* ── Mobile Menu Toggle ── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Menu ── */}
      {mobileMenuOpen && (
        <nav className="nav-mobile-menu">
          {navItems.map((item) => {
            if (item.requiresEnrollment && !isEnrolled) return null;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-mobile-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="nav-mobile-divider" />

          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-link"
              >
                <User size={16} /> {t.profile?.title || 'My Profile'}
              </Link>
              {isEnrolled && (
                <Link
                  href="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-mobile-link"
                >
                  <BookOpen size={16} /> {t.nav?.portal || 'My Courses'}
                </Link>
              )}
              <Link
                href="/profile/referrals"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-link"
              >
                <Share2 size={16} /> {t.referrals?.dashboardTitle || 'Referral Dashboard'}
              </Link>
              <button onClick={handleLogout} className="nav-mobile-logout">
                <LogOut size={16} /> {t.auth?.logout || 'Sign Out'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-link"
              >
                <LogIn size={16} /> {t.auth?.signIn || 'Sign In'}
              </Link>
              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-cta"
              >
                <Zap size={16} /> {t.nav?.enrollNow || 'Enroll Now'}
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navigation;