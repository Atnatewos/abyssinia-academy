/**
 * @fileoverview Custom App Component
 *
 * Wraps every page with the platform's context providers (theme, language,
 * toast, authentication) and loads the global stylesheet plus the shared
 * admin styles. Anonymous page views are tracked through the usePageView
 * hook so analytics stay passive and privacy-preserving.
 *
 * Import order matters:
 *   1. globals.css              — base reset + all feature stylesheets
 *   2. admin.css                — admin shell styles
 *   3. Tailwind utilities       — loaded by globals.css as the final layer
 *
 * Path: apps/web/pages/_app.jsx
 */

import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import usePageView from '../hooks/usePageView';

import '../styles/globals.css';
import '../styles/admin.css';

/**
 * Root App component — every route renders inside this wrapper.
 *
 * Provider order is significant: ThemeProvider must wrap LanguageProvider
 * because both rely on localStorage but Theme also affects the document
 * element. AuthProvider comes last so it can consume the language context
 * for future localized error messages.
 */
const App = ({ Component, pageProps }) => {
  /*
   * Anonymous page view tracking. Fires once per route change and records
   * only the request path — no cookies, no personal identifiers.
   */
  usePageView();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;