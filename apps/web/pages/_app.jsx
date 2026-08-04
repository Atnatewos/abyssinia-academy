/**
 * @fileoverview Custom App Component
 * Wraps all pages with context providers for theme, language, auth, and toasts
 * Path: apps/web/pages/_app.jsx
 */

import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import '../styles/globals.css';
import '../styles/admin.css';

/**
 * Root App component - all pages render inside this wrapper
 * Provides Theme, Language, Auth, and Toast contexts
 */
const App = ({ Component, pageProps }) => {
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