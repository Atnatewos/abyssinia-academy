/**
 * @fileoverview Language Toggle — Dropdown Variant
 *
 * Renders a globe icon button that opens a dropdown listing every locale
 * discovered by the LanguageContext. Fully driven by `supportedLanguages`
 * from context — adding a new locale requires no changes to this file.
 *
 * Features:
 *   - Auto-positioned dropdown (left/right edge-aware)
 *   - Outside-click dismiss
 *   - Escape key dismiss
 *   - Keyboard navigation (arrow up/down, enter, space)
 *   - ARIA `listbox` / `option` roles for screen readers
 *   - Active locale highlighted with gold accent
 *   - Uses design-system CSS variables for theme safety
 *
 * Path: apps/web/components/shared/LanguageToggle.jsx
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage, supportedLanguages, mounted } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  /**
   * The currently active locale descriptor (for label + nativeLabel display).
   * Falls back to the first entry if the active locale is somehow missing.
   */
  const activeLocale =
    supportedLanguages.find((entry) => entry.code === language) ||
    supportedLanguages[0] ||
    null;

  /**
   * Close the dropdown when clicking anywhere outside the container.
   * Active only while the menu is open — no persistent listeners.
   */
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  /**
   * Close on Escape key. Returns focus to the trigger so keyboard users
   * don't get stranded inside a dismissed menu.
   */
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

  /**
   * When the menu opens, move focus to the currently active option so
   * keyboard users land on their current selection.
   */
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

  /**
   * Arrow-key navigation inside the open listbox. Wraps around top/bottom.
   */
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

  /**
   * Select a locale and close the menu. Restores focus to the trigger.
   */
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

  /* Don't render until client-side hydration completes (avoids mismatch) */
  if (!mounted || !activeLocale) {
    return (
      <button
        type="button"
        className="nav-icon-btn"
        aria-label="Language"
        disabled
      >
        <Globe />
        <span>EN</span>
      </button>
    );
  }

  return (
    <div className="language-dropdown" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`nav-icon-btn language-dropdown-trigger ${
          isOpen ? 'open' : ''
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change language — current: ${activeLocale.label}`}
      >
        <Globe />
        <span>{activeLocale.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <ul
          className="language-dropdown-menu"
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
                  className={`language-dropdown-option ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(entry.code)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                >
                  <span className="language-dropdown-option-code">
                    {entry.code.toUpperCase()}
                  </span>
                  <span className="language-dropdown-option-label">
                    {entry.nativeLabel}
                  </span>
                  {isActive && (
                    <Check
                      size={14}
                      className="language-dropdown-option-check"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageToggle;