/**
 * @fileoverview Custom App Component
 * Wraps all pages with context providers for theme, language, auth, and toasts.
 * Tracks anonymous page views via usePageView hook.
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
 * Root App component - all pages render inside this wrapper.
 * Provides Theme, Language, Auth, and Toast contexts.
 * Tracks every page view anonymously for analytics.
 */
const App = ({ Component, pageProps }) => {
  /*
   * Track page views — fires on initial load and every route change.
   * Anonymous, no cookies, no personal data.
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