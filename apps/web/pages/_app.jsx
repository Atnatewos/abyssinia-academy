/**
 * @fileoverview Next.js Application Root
 *
 * Wires every global provider in the correct order so that:
 *   - Theme preferences apply before first paint
 *   - Language is available to all consumers
 *   - Toast notifications work from any component
 *   - Auth state is loaded once and shared
 *   - Confirmation dialogs can be opened from any component
 *
 * Path: apps/web/pages/_app.jsx
 */

import '../styles/globals.css';
import '../styles/themes.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/animations.css';
import '../styles/design-system.css';
import '../styles/admin.css';
import '../styles/admin-mlm.css';
import '../styles/admin-mobile.css';
import '../styles/admin-godmode.css';
import '../styles/landing-3d.css';
import '../styles/referral.css';
import '../styles/notifications.css';
import '../styles/responsive.css';
import '../styles/skeleton.css';

import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ConfirmProvider } from '../components/shared/ConfirmProvider';

/**
 * MyApp — Top-level component for every page.
 *
 * Provider order matters:
 *   Theme    → outermost, drives CSS variables
 *   Language → strings, callbacks
 *   Toast    → feedback layer
 *   Confirm  → confirmation dialogs
 *   Auth     → consumes everything above
 */
function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default MyApp;