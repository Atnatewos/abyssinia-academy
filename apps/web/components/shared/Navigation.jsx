/**
 * @fileoverview Main Navigation Component
 * Sticky header with logo, pill navigation, theme/language toggles,
 * auth actions, profile link, and referrals link.
 * Path: apps/web/components/shared/Navigation.jsx
 */

import { useState } from 'react';
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
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Navigation — Main site header present on every page.
 * Renders logo, desktop pill navigation, mobile menu, and control buttons.
 */
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, t, toggleLanguage } = useLanguage();
  const { isAuthenticated, isEnrolled, user, logout } = useAuth();

  /*
   * Main navigation items
   */
  const navItems = [
    { path: '/', label: t.nav?.overview || 'Overview' },
    { path: '/courses', label: t.nav?.courses || 'Courses' },
    { path: '/portal', label: t.nav?.portal || 'Classroom Portal', requiresEnrollment: true },
    { path: '/pricing', label: t.nav?.tuition || 'Tuition' },
  ];

  /**
   * Check if a route is currently active
   */
  const isActive = (path) => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  /**
   * Close mobile menu and call logout
   */
  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <header className="nav-header">
      <div className="nav-inner">

        {/* Logo */}
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

        {/* Desktop Navigation Pills */}
        <nav className="nav-pills">
          {navItems.map((item) => {
            if (item.requiresEnrollment && !isEnrolled) return null;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-pill ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
                {item.path === '/portal' && isEnrolled && (
                  <span className="nav-pill-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Controls */}
        <div className="nav-controls">

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="nav-icon-btn"
            title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <Globe />
            <span>{language === 'en' ? 'EN' : 'አማ'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nav-icon-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>

          {/* Authenticated Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              {/* Enrolled Badge */}
              {isEnrolled && (
                <div className="nav-enrolled-badge">
                  <div className="nav-enrolled-dot">&#10003;</div>
                  <span className="nav-enrolled-label">Enrolled</span>
                </div>
              )}

              {/* Referrals Link — shown to all authenticated users */}
              <Link
                href="/profile/referrals"
                className="nav-icon-btn"
                title={t.referrals?.dashboardTitle || 'Referral Dashboard'}
              >
                <Share2 />
                <span>{t.referrals?.dashboardTitle?.split(' ')[0] || 'Referrals'}</span>
              </Link>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="nav-icon-btn"
                title={t.profile?.title || 'My Profile'}
              >
                <User />
                <span>{user?.full_name?.split(' ')[0] || 'Profile'}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  padding: '0.25rem 0.75rem',
                  fontWeight: 500,
                }}
              >
                {t.auth?.logout || 'Logout'}
              </button>
            </div>
          ) : (
            /* Unauthenticated — Enroll Now CTA */
            <Link href="/checkout" className="nav-enroll-btn">
              <span className="nav-enroll-btn-bg" />
              <span className="nav-enroll-btn-text">
                <Zap />
                <span>{t.nav?.enrollNow || 'Enroll Now'}</span>
              </span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="nav-mobile-menu">

          {/* Main nav items */}
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

          {/* Referrals link in mobile menu */}
          {isAuthenticated && (
            <Link
              href="/profile/referrals"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-mobile-link"
            >
              <Share2 size={16} />
              {' '}
              {t.referrals?.dashboardTitle || 'Referral Dashboard'}
            </Link>
          )}

          {/* Profile link in mobile menu */}
          {isAuthenticated && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-mobile-link"
            >
              <User size={16} />
              {' '}
              {t.profile?.title || 'My Profile'}
            </Link>
          )}

          {/* Logout / Enroll in mobile menu */}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-mobile-logout">
              {t.auth?.logout || 'Logout'}
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-mobile-cta"
            >
              {t.nav?.enrollNow || 'Enroll Now'}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navigation;