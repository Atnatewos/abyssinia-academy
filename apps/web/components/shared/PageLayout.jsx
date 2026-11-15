// /**
//  * @fileoverview Page Layout Wrapper
//  * Consistent layout shell for every page - matches Gemini foundation exactly
//  * Wraps all pages with Banner, FloatingGlow, Navigation, and Footer
//  * Path: apps/web/components/shared/PageLayout.jsx
//  */

// import Banner from './Banner';
// import FloatingGlow from './FloatingGlow';
// import Navigation from './Navigation';
// import Footer from './Footer';

// /**
//  * PageLayout - Standard page wrapper used by ALL pages
//  * Ensures every page has the same banner, background, navigation, and footer
//  * @param {object} props
//  * @param {React.ReactNode} props.children - Page content to render inside the layout
//  */
// const PageLayout = ({ children }) => {
//   return (
//     <div className="page-wrapper">
//       {/* Ambient background glow orbs - present on every page */}
//       <FloatingGlow />

//       {/* Top promotional banner - present on every page */}
//       <Banner />

//       {/* Main navigation header - present on every page */}
//       <Navigation />

//       {/* Page-specific content */}
//       <main className="page-content">
//         {children}
//       </main>

//       {/* Site footer - present on every page */}
//       <Footer />
//     </div>
//   );
// };

// export default PageLayout;




/**
 * @fileoverview Page Layout Wrapper
 *
 * Enforces a Flexbox column layout (min-h-screen) so the footer
 * is always pushed to the bottom of the viewport on short pages.
 *
 * Path: apps/web/components/shared/PageLayout.jsx
 */

import Banner from './Banner';
import FloatingGlow from './FloatingGlow';
import Navigation from './Navigation';
import Footer from './Footer';
import { useBanner } from '../../context/BannerContext';

const PageLayout = ({ children }) => {
  const { headerHeight, animationDurationMs } = useBanner();

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-main relative overflow-hidden">
      <FloatingGlow />
      <Banner />
      <Navigation />

      <main
        className="flex-1 flex flex-col relative z-10 transition-[padding] ease-out motion-reduce:transition-none"
        style={{
          paddingTop: `${headerHeight}px`,
          transitionDuration: `${animationDurationMs}ms`,
        }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default PageLayout;