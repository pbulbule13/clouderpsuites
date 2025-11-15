import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-col">
            <div className="footer-logo">
              <div className="logo-text">
                <span className="logo-cloud">Cloud</span>
                <span className="logo-erp">ERP</span>
                <span className="logo-suites">Suites</span>
              </div>
            </div>
            <p className="footer-description">
              Expert NetSuite implementation and AI-powered business automation solutions.
            </p>
            <div className="footer-social">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/ai-services">AI Services</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/our-approach">Our Approach</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><a href="/#products">NetSuite ERP</a></li>
              <li><a href="/#products">NetSuite CRM</a></li>
              <li><Link to="/ai-services">AI Automation</Link></li>
              <li><a href="/#services">Implementation</a></li>
              <li><a href="/#services">Consulting</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <Phone size={18} />
                <a href="tel:+15103979646">+1 510.397.9646</a>
              </li>
              <li>
                <Mail size={18} />
                <a href="mailto:info@clouderpsuites.com">info@clouderpsuites.com</a>
              </li>
              <li>
                <MapPin size={18} />
                <span>3559 MT Diablo Blvd, Suite 316<br />Lafayette, CA 94549</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} CloudERP Suites. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
