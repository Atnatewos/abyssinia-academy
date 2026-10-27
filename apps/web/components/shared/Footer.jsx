/**
 * @fileoverview Site Footer Component
 * Footer with brand copyright and contact information
 * Path: apps/web/components/shared/Footer.jsx
 */

/**
 * Footer - Site footer present on every page
 * Displays copyright, phone, and location
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>
          &copy; 2026 &ndash; {currentYear} ABYSSiNIA Tech Academy. All rights reserved. Powered By SoDar!
        </p>
        <div className="site-footer-info">
          <span>+251 920944941</span>
          <span>&bull;</span>
          <span>Addis Ababa, Ethiopia</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;