// /**
//  * @fileoverview Next.js App Root
//  *
//  * Providers mounted here (order matters — outer first):
//  *   ThemeProvider   — global theme state (dark/light)
//  *   BannerProvider  — global banner visibility + localStorage
//  *   LanguageProvider — i18n state
//  *   ToastProvider   — global toast notifications
//  *   ConfirmProvider — global confirmation dialogs
//  *   AuthProvider    — user session
//  *
//  * BannerProvider is placed high so Banner, Navigation, and PageLayout
//  * can all consume the same headerHeight state without prop drilling.
//  *
//  * The global wrapper uses `min-h-screen flex flex-col` to guarantee
//  * a sticky footer architecture across every route.
//  *
//  * Path: apps/web/pages/_app.jsx
//  */

// import '../styles/globals.css';
// import '../styles/tailwind.css';
// import { ThemeProvider } from '../context/ThemeContext';
// import { BannerProvider } from '../context/BannerContext';
// import { LanguageProvider } from '../context/LanguageContext';
// import { ToastProvider } from '../context/ToastContext';
// import { ConfirmProvider } from '../components/shared/ConfirmProvider';
// import { AuthProvider } from '../context/AuthContext';

// export default function App({ Component, pageProps }) {
//   /* Preserve per-page layout overrides if the page defines them */
//   const getLayout = Component.getLayout || ((page) => page);

//   return (
//     <ThemeProvider>
//       <BannerProvider>
//         <LanguageProvider>
//           <ToastProvider>
//             <ConfirmProvider>
//               <AuthProvider>
//                 {/* Global Flex Wrapper */}
//                 <div className="min-h-screen flex flex-col bg-bg-main text-text-main">
//                   {getLayout(<Component {...pageProps} />)}
//                 </div>
//               </AuthProvider>
//             </ConfirmProvider>
//           </ToastProvider>
//         </LanguageProvider>
//       </BannerProvider>
//     </ThemeProvider>
//   );
// }





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
 * Path: apps/web/pages/_app.jsx
 */

import '../styles/globals.css';
import '../styles/tailwind.css';
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
                {/*
                  The layout wrapper (min-h-screen flex flex-col) lives inside
                  PageLayout.jsx to prevent flexbox collision and ensure the
                  sticky footer works on every page.
                */}
                {getLayout(<Component {...pageProps} />)}
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </LanguageProvider>
      </BannerProvider>
    </ThemeProvider>
  );
}