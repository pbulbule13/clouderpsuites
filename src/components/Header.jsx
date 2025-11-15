import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSidebarOpen(false);
  }, [location]);

  const navItems = [
    { label: 'Cloud Products', path: '/' },
    { label: 'AI Automation', path: '/ai-services' },
    { label: 'Services', path: '/services' },
    { label: 'Solution Partners', path: '/solution-partners' },
    { label: 'Our Approach', path: '/our-approach' },
    { label: 'About Us', path: '/about' }
  ];

  return (
    <>
      {/* Left Sidebar */}
      <div className={`header-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <Link to="/" className="sidebar-logo">
            <img src="/images/logo-light.png" alt="CloudERP Suites" />
          </Link>

          <div className="sidebar-links">
            <Link to="/contact" className="sidebar-link">
              Schedule Review Session
            </Link>
            <a href="mailto:info@clouderpsuites.com" className="sidebar-link">
              <Mail size={16} />
              <span>info@clouderpsuites.com</span>
            </a>
            <a href="tel:+15103979646" className="sidebar-link">
              <Phone size={16} />
              <span>+1 510.397.9646</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            {/* Sidebar Toggle */}
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <Link to="/" className="logo">
              <img src="/images/logo-main.png" alt="CloudERP Suites" className="logo-image" />
            </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="header-cta">
            <Link to="/contact" className="btn btn-primary">
              Schedule Review Session
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-mobile-link"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/contact" className="btn btn-primary btn-full">
            Schedule Consultation
          </Link>
        </nav>
      </div>
    </header>
    </>
  );
};

export default Header;
