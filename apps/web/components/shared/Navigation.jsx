/**
 * @fileoverview Main Navigation Component
 * Premium sticky header — original feature set, refined design.
 * 
 * Features preserved:
 * - Logo with gold gradient mark
 * - Desktop pill navigation with active state
 * - Language toggle (EN/አማ)
 * - Theme toggle (light/dark)
 * - Auth: enrolled badge, referrals, profile avatar, logout
 * - Unauthenticated: Enroll Now CTA with gradient animation
 * - Mobile: slide-down menu with full feature parity
 * 
 * Design: clean glass morphism, sticky, scroll-aware shadow,
 * subtle micro-animations on hover and state changes.
 * 
 * Path: apps/web/components/shared/Navigation.jsx
 */

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
   * Close mobile menu on route change
   */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  /*
   * Main navigation items — same as original
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
   * Logout with mobile menu cleanup
   */
  const handleLogout = () => {
    setMobileMenuOpen(false);
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

          {/* ── Authenticated Actions ── */}
          {isAuthenticated ? (
            <div className="nav-auth-group">

              {/* Enrolled Badge */}
              {isEnrolled && (
                <div className="nav-enrolled-badge">
                  <div className="nav-enrolled-dot" />
                  <span className="nav-enrolled-label">Enrolled</span>
                </div>
              )}

              {/* Referrals Link */}
              <Link
                href="/profile/referrals"
                className="nav-icon-btn"
                title={t.referrals?.dashboardTitle || 'Referral Dashboard'}
              >
                <Share2 size={16} />
                <span className="nav-icon-label">{t.referrals?.shortTitle || 'Referrals'}</span>
              </Link>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="nav-profile-btn"
                title={t.profile?.title || 'My Profile'}
              >
                <span className="nav-profile-avatar">
                  {(user?.full_name || 'U').charAt(0).toUpperCase()}
                </span>
                <span className="nav-profile-name">
                  {user?.full_name?.split(' ')[0] || 'Profile'}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="nav-logout-btn"
                title={t.auth?.logout || 'Logout'}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* ── Unauthenticated — Enroll Now CTA ── */
            <Link href="/checkout" className="nav-enroll-btn">
              <span className="nav-enroll-btn-bg" />
              <span className="nav-enroll-btn-text">
                <Zap size={14} />
                <span>{t.nav?.enrollNow || 'Enroll Now'}</span>
              </span>
            </Link>
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

          {isAuthenticated && (
            <>
              <div className="nav-mobile-divider" />
              <Link
                href="/profile/referrals"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-link"
              >
                <Share2 size={16} />
                {' '}
                {t.referrals?.dashboardTitle || 'Referral Dashboard'}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-mobile-link"
              >
                <User size={16} />
                {' '}
                {t.profile?.title || 'My Profile'}
              </Link>
              <button onClick={handleLogout} className="nav-mobile-logout">
                <LogOut size={16} />
                {' '}
                {t.auth?.logout || 'Logout'}
              </button>
            </>
          )}

          {!isAuthenticated && (
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-mobile-cta"
            >
              <Zap size={16} />
              {' '}
              {t.nav?.enrollNow || 'Enroll Now'}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navigation;