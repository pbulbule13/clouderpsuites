import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Contact Info */}
          <div className="header-contact-info">
            <a href="tel:+15103979646" className="header-contact-link">
              <Phone size={16} />
              <span>+1 510.397.9646</span>
            </a>
            <a href="mailto:info@clouderpsuites.com" className="header-contact-link">
              <Mail size={16} />
              <span>info@clouderpsuites.com</span>
            </a>
          </div>

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
  );
};

export default Header;
