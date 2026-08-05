/**
 * @fileoverview Main Navigation Component
 * Clean, organized header with profile dropdown menu.
 * 
 * Behavior:
 * - Stays fixed at top ALWAYS (position: fixed, not sticky)
 * - Scroll down: slides up and hides
 * - Scroll up: instantly reappears
 * 
 * Path: apps/web/components/shared/Navigation.jsx
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [hidden, setHidden] = useState(false);
  const dropdownRef = useRef(null);
  const prevScrollRef = useRef(0);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, t, toggleLanguage } = useLanguage();
  const { isAuthenticated, isEnrolled, user, logout } = useAuth();

  /*
   * Hide on scroll down, show on scroll up.
   * Uses requestAnimationFrame for smooth performance.
   */
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          const prev = prevScrollRef.current;

          if (current < 20) {
            setHidden(false);
          } else if (current > prev && current > 80) {
            setHidden(true);
            setProfileDropdownOpen(false);
          } else if (current < prev) {
            setHidden(false);
          }

          prevScrollRef.current = current;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', label: t.nav?.overview || 'Overview' },
    { path: '/courses', label: t.nav?.courses || 'Courses' },
    { path: '/portal', label: t.nav?.portal || 'Classroom', requiresEnrollment: true },
    { path: '/pricing', label: t.nav?.tuition || 'Pricing' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return router.pathname === '/';
    return router.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    logout();
  };

  return (
    <header
      className="nav-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
    >
      <div className="nav-inner">

        {/* ── Logo ── */}
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

        <div style={{ flex: 1 }} />

        {/* ── Right Side Controls ── */}
        <div className="nav-controls">
          <button onClick={toggleLanguage} className="nav-icon-btn" title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'} aria-label="Toggle language">
            <Globe size={16} />
            <span className="nav-icon-label">{language === 'en' ? 'EN' : 'አማ'}</span>
          </button>

          <button onClick={toggleTheme} className="nav-icon-btn nav-theme-btn" title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              {isEnrolled && (
                <span className="nav-enrolled-indicator" title="Enrolled">
                  <span className="nav-enrolled-indicator-dot" />
                </span>
              )}

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
                  <ChevronDown size={14} className={`nav-profile-chevron ${profileDropdownOpen ? 'open' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="nav-dropdown-menu">
                    <div className="nav-dropdown-header">
                      <span className="nav-dropdown-user-name">{user?.full_name || 'Student'}</span>
                      <span className="nav-dropdown-user-email">{user?.phone || user?.email || ''}</span>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <Link href="/profile" className="nav-dropdown-item" onClick={() => setProfileDropdownOpen(false)}><User size={16} /><span>{t.profile?.title || 'My Profile'}</span></Link>
                    {isEnrolled && <Link href="/portal" className="nav-dropdown-item" onClick={() => setProfileDropdownOpen(false)}><BookOpen size={16} /><span>{t.nav?.portal || 'My Courses'}</span></Link>}
                    <Link href="/profile/referrals" className="nav-dropdown-item" onClick={() => setProfileDropdownOpen(false)}><Share2 size={16} /><span>{t.referrals?.dashboardTitle || 'Referrals'}</span></Link>
                    <div className="nav-dropdown-divider" />
                    <button onClick={handleLogout} className="nav-dropdown-item nav-dropdown-logout"><LogOut size={16} /><span>{t.auth?.logout || 'Sign Out'}</span></button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-unauth-group">
              <Link href="/auth/login" className="nav-signin-btn"><LogIn size={14} /><span>{t.auth?.signIn || 'Sign In'}</span></Link>
              <Link href="/auth/register" className="nav-signin-btn"><UserPlus size={14} /><span>{t.auth?.register || 'Register'}</span></Link>
              <Link href="/checkout" className="nav-enroll-btn">
                <span className="nav-enroll-btn-bg" />
                <span className="nav-enroll-btn-text"><Zap size={14} /><span>{t.nav?.enrollNow || 'Enroll Now'}</span></span>
              </Link>
            </div>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="nav-mobile-toggle" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Menu ── */}
      {mobileMenuOpen && (
        <nav className="nav-mobile-menu">
          {navItems.map((item) => {
            if (item.requiresEnrollment && !isEnrolled) return null;
            return <Link key={item.path} href={item.path} onClick={() => setMobileMenuOpen(false)} className={`nav-mobile-link ${isActive(item.path) ? 'active' : ''}`}>{item.label}</Link>;
          })}
          <div className="nav-mobile-divider" />
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-link"><User size={16} /> {t.profile?.title || 'My Profile'}</Link>
              {isEnrolled && <Link href="/portal" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-link"><BookOpen size={16} /> {t.nav?.portal || 'My Courses'}</Link>}
              <Link href="/profile/referrals" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-link"><Share2 size={16} /> {t.referrals?.dashboardTitle || 'Referral Dashboard'}</Link>
              <button onClick={handleLogout} className="nav-mobile-logout"><LogOut size={16} /> {t.auth?.logout || 'Sign Out'}</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-link"><LogIn size={16} /> {t.auth?.signIn || 'Sign In'}</Link>
              <Link href="/checkout" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-cta"><Zap size={16} /> {t.nav?.enrollNow || 'Enroll Now'}</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navigation;