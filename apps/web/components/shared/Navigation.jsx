/**
 * @fileoverview Main Navigation Component
 * Sticky header with logo, pill navigation, theme/language toggles, and auth actions
 * Matches the Gemini foundation navigation exactly
 * Path: apps/web/components/shared/Navigation.jsx
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Code2, Zap, Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Navigation - Sticky header present on every page
 * Renders logo, desktop pill navigation, mobile menu, and control buttons
 */
const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, t, toggleLanguage } = useLanguage();
  const { isAuthenticated, isEnrolled, logout } = useAuth();

  /**
   * Navigation items sourced from translations
   * Portal link only shows when user is enrolled
   */
  const navItems = [
    { path: '/', label: t.nav?.overview || 'Overview' },
    { path: '/courses', label: t.nav?.courses || 'Courses' },
    { path: '/portal', label: t.nav?.portal || 'Classroom Portal', requiresEnrollment: true },
    { path: '/pricing', label: t.nav?.tuition || 'Tuition' },
  ];

  /**
   * Determine if a route is currently active
   * @param {string} path - Route path to check
   * @returns {boolean} Whether this route matches current page
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
        {/* Logo Section */}
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Code2 />
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-name">
              <span className="text-gradient-gold">ABYSSiNIA</span>
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

          {/* Authentication Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isEnrolled && (
                <div className="nav-enrolled-badge">
                  <div className="nav-enrolled-dot">&#10003;</div>
                  <span className="nav-enrolled-label">Enrolled</span>
                </div>
              )}
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