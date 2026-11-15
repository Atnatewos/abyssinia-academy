/**
 * @fileoverview Language Toggle — Dropdown Variant (Tailwind)
 *
 * Renders a globe icon button that opens a dropdown listing every locale.
 *
 * When used in the footer (placement="top"), the dropdown is rendered
 * inside a full-screen portal with a transparent backdrop. The dropdown
 * anchors to the bottom of the viewport using `bottom` (not `top` +
 * translate) so it NEVER pushes the page content or creates a scroll gap.
 *
 * Path: apps/web/components/shared/LanguageToggle.jsx
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const LanguageToggle = ({ placement = 'bottom' }) => {
  const { language, setLanguage, supportedLanguages, mounted } = useLanguage();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ bottom: 0, right: 16 });
  
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);

  const activeLocale =
    supportedLanguages.find((entry) => entry.code === language) ||
    supportedLanguages[0] ||
    null;

  const dropdownBackground = useMemo(
    () =>
      theme === 'light'
        ? 'rgba(255, 255, 255, 0.98)'
        : 'rgba(15, 23, 42, 0.98)',
    [theme]
  );

  /**
   * Calculate precise coordinates for the fixed-position dropdown.
   * 
   * We anchor from the BOTTOM of the viewport using `bottom` instead
   * of `top + translateY(-100%)`. This avoids the browser thinking
   * the element extends the document height, which causes the "footer
   * pushed down" bug.
   */
  const updatePosition = useCallback(() => {
    if (placement === 'top' && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Distance from the trigger's top edge to the viewport bottom
      const bottomOffset = viewportHeight - rect.top + 8;
      
      setCoords({
        bottom: bottomOffset,
        right: window.innerWidth - rect.right,
      });
    }
  }, [placement]);

  useEffect(() => {
    if (!isOpen) return undefined;

    updatePosition();

    const handleOutside = (event) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (placement === 'top') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isOpen, placement, updatePosition]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const activeIndex = supportedLanguages.findIndex(
      (entry) => entry.code === language
    );
    const targetIndex = activeIndex === -1 ? 0 : activeIndex;
    requestAnimationFrame(() => {
      optionRefs.current[targetIndex]?.focus();
    });
  }, [isOpen, language, supportedLanguages]);

  const handleOptionKeyDown = useCallback(
    (event, index) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (index + 1) % supportedLanguages.length;
        optionRefs.current[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex =
          (index - 1 + supportedLanguages.length) % supportedLanguages.length;
        optionRefs.current[prevIndex]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        optionRefs.current[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        optionRefs.current[supportedLanguages.length - 1]?.focus();
      }
    },
    [supportedLanguages.length]
  );

  const handleSelect = useCallback(
    (code) => {
      if (typeof setLanguage === 'function' && code !== language) {
        setLanguage(code);
      }
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [setLanguage, language]
  );

  /* Placeholder while SSR hydration is in progress */
  if (!mounted || !activeLocale) {
    return (
      <button
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-text-nav-icon opacity-50 cursor-wait transition-colors"
        aria-label="Language loading"
        disabled
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">EN</span>
      </button>
    );
  }

  /**
   * The dropdown menu markup.
   * Uses `bottom` positioning to prevent viewport/document height expansion.
   */
  const renderMenu = () => (
    <ul
      className={`flex flex-col py-1.5 rounded-xl border border-border-medium backdrop-blur-xl shadow-2xl shadow-black/40 z-[9999] animate-fade-in-up w-44 ${
        placement === 'top'
          ? 'fixed origin-bottom-right'
          : 'absolute top-full right-0 mt-2 origin-top-right'
      }`}
      style={{
        backgroundColor: dropdownBackground,
        ...(placement === 'top' ? {
          bottom: coords.bottom,
          right: coords.right,
        } : {}),
      }}
      ref={menuRef}
      role="listbox"
      aria-label="Select language"
      tabIndex={-1}
    >
      {supportedLanguages.map((entry, index) => {
        const isActive = entry.code === language;
        return (
          <li key={entry.code} role="none">
            <button
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm transition-colors outline-none
                ${
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-ghost-hover focus:bg-bg-ghost-hover focus:text-text-main'
                }`}
              onClick={() => handleSelect(entry.code)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              <span className="text-xs font-bold font-mono w-6">
                {entry.code.toUpperCase()}
              </span>
              <span className="flex-1 text-left">
                {entry.nativeLabel}
              </span>
              {isActive && (
                <Check
                  size={14}
                  className="text-accent shrink-0"
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-text-nav-icon hover:text-text-nav-icon-hover hover:bg-bg-icon-btn-hover transition-colors ${
          isOpen ? 'bg-bg-icon-btn-hover text-text-nav-icon-hover' : ''
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change language — current: ${activeLocale.label}`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-bold font-mono tracking-wider">
          {activeLocale.code.toUpperCase()}
        </span>
      </button>

      {/* 
        For placement="top" (footer), we portal the menu into a 
        fixed full-screen overlay. This prevents the browser from 
        extending the document height, so the footer never gets pushed.
      */}
      {isOpen && placement === 'top' && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setIsOpen(false)}
            >
              {renderMenu()}
            </div>,
            document.body
          )
        : isOpen
          ? renderMenu()
          : null}
    </div>
  );
};

export default LanguageToggle;