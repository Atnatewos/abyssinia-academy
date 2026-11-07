/**
 * @fileoverview Custom App Component
 *
 * Wraps every page with the platform's context providers (theme, language,
 * toast, auth, confirm) and loads the global stylesheet plus the shared
 * admin styles. Anonymous page views are tracked through the usePageView
 * hook so analytics stay passive and privacy-preserving.
 *
 * Provider order matters:
 *   Theme → Language → Toast → Auth → Confirm
 *
 * ConfirmProvider is mounted LAST so it can consume the language context
 * for localized dialog labels. It wraps the Component tree so any child
 * (including modal overlays and layout components) can call useConfirm()
 * and receive the styled dialog — never the browser's native confirm().
 *
 * Path: apps/web/pages/_app.jsx
 */

import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ConfirmProvider } from '../components/shared/ConfirmProvider';
import usePageView from '../hooks/usePageView';

import '../styles/globals.css';
import '../styles/admin.css';

/**
 * Root App component — every route renders inside this wrapper.
 *
 * Provider order is significant:
 *   - ThemeProvider first — affects the document element
 *   - LanguageProvider next — reads theme storage
 *   - ToastProvider — pure utility, no deps
 *   - AuthProvider — reads language for error strings
 *   - ConfirmProvider last — reads language for dialog labels,
 *     ensures every descendant can call useConfirm()
 */
const App = ({ Component, pageProps }) => {
  usePageView();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <ConfirmProvider>
              <Component {...pageProps} />
            </ConfirmProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;