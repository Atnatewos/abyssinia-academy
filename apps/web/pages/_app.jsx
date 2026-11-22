/**
 * @fileoverview Next.js App Root
 *
 * Providers mounted here (order matters — outer first):
 *   ThemeProvider   — global theme state (dark/light)
 *   BannerProvider  — global banner visibility + localStorage
 *   LanguageProvider — i18n state
 *   ToastProvider   — global toast notifications
 *   ConfirmProvider — global confirmation dialogs
 *   AuthProvider    — user session
 *
 * Stylesheet order:
 *   globals.css → tailwind.css → hero-cta.css
 *   The isolated hero CTA sheet loads last so its scoped, token-driven
 *   rules win every cascade tie without affecting any other surface.
 *
 * Path: apps/web/pages/_app.jsx
 */

import '../styles/globals.css';
import '../styles/tailwind.css';
import '../styles/hero-cta.css';
import { ThemeProvider } from '../context/ThemeContext';
import { BannerProvider } from '../context/BannerContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { ConfirmProvider } from '../components/shared/ConfirmProvider';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  /* Preserve per-page layout overrides if the page defines them */
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <ThemeProvider>
      <BannerProvider>
        <LanguageProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>
                {getLayout(<Component {...pageProps} />)}
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </LanguageProvider>
      </BannerProvider>
    </ThemeProvider>
  );
}