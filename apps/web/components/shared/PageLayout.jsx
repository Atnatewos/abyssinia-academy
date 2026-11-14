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
 * Consistent layout shell for every page. Renders Banner, FloatingGlow,
 * Navigation, and Footer around the page content.
 *
 * The <main> padding-top is driven by BannerContext.headerHeight so it
 * automatically adjusts when the banner is dismissed (112px → 72px) with
 * a smooth transition. No page ever has to guess the header height.
 *
 * Path: apps/web/components/shared/PageLayout.jsx
 */

import Banner from './Banner';
import FloatingGlow from './FloatingGlow';
import Navigation from './Navigation';
import Footer from './Footer';
import { useBanner } from '../../context/BannerContext';

/**
 * PageLayout — Standard page wrapper used by ALL pages.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
const PageLayout = ({ children }) => {
  const { headerHeight, animationDurationMs } = useBanner();

  return (
    <div className="page-wrapper">
      {/* Ambient background glow orbs — present on every page */}
      <FloatingGlow />

      {/* Top promotional banner — dismissible, positioned below nav */}
      <Banner />

      {/* Main navigation header — always on top */}
      <Navigation />

      {/* Page-specific content — padding driven by live header height */}
      <main
        className="page-content transition-[padding] ease-out motion-reduce:transition-none"
        style={{
          paddingTop: `${headerHeight}px`,
          transitionDuration: `${animationDurationMs}ms`,
        }}
      >
        {children}
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default PageLayout;