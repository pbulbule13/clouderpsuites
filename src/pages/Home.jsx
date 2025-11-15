import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Cloud, Zap, Users, TrendingUp, Shield, CheckCircle,
  Database, Settings, BarChart3, Sparkles
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const products = [
    {
      icon: <Cloud />,
      title: 'NetSuite ERP',
      description: 'Complete financial management and business automation serving 24,000+ organizations worldwide',
      features: ['Financial Management', 'Order Management', 'Inventory Control', 'Multi-Currency Support']
    },
    {
      icon: <Users />,
      title: 'NetSuite CRM+',
      description: 'Customer relationship management with sales automation and marketing tools',
      features: ['Sales Automation', 'Marketing Campaigns', 'Customer Service', 'Analytics Dashboard']
    },
    {
      icon: <Database />,
      title: 'NetSuite OneWorld',
      description: 'Multi-subsidiary, multi-currency financial management for global enterprises',
      features: ['Global Consolidation', 'Multi-Entity Management', 'Intercompany Accounting', 'Local Compliance']
    },
    {
      icon: <Settings />,
      title: 'NetSuite PSA & SRP',
      description: 'Professional services automation and resource planning for project-based businesses',
      features: ['Project Management', 'Resource Planning', 'Time Tracking', 'Billing Automation']
    }
  ];

  const services = [
    {
      icon: <CheckCircle />,
      title: 'Implementation',
      description: 'End-to-end NetSuite implementation leveraging SuiteSuccess methodology'
    },
    {
      icon: <TrendingUp />,
      title: 'Optimization',
      description: 'Enhance existing NetSuite deployments for maximum efficiency and ROI'
    },
    {
      icon: <Shield />,
      title: 'Integration',
      description: 'Seamlessly connect NetSuite with your existing business systems'
    },
    {
      icon: <Sparkles />,
      title: 'AI Automation',
      description: 'Transform operations with AI-driven workflows and intelligent automation'
    }
  ];

  return (
    <>
      <Helmet>
        <title>CloudERP Suites - NetSuite Implementation & AI Automation Services</title>
        <meta name="description" content="Expert NetSuite ERP implementation, AI automation, and business transformation services. Serving 24,000+ organizations with proven SuiteSuccess methodology." />
        <meta name="keywords" content="NetSuite, ERP implementation, AI automation, business automation, CRM, cloud ERP" />
      </Helmet>

      <main className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-background"></div>
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title fade-in-up">
                Transform Your Business with
                <span className="text-gradient"> NetSuite & AI</span>
              </h1>
              <p className="hero-subtitle fade-in-up">
                Expert NetSuite implementation and AI-powered automation solutions that drive real business results.
                Trusted by enterprises worldwide for digital transformation.
              </p>
              <div className="hero-cta fade-in-up">
                <Link to="/contact" className="btn btn-primary btn-large">
                  Schedule Free Consultation
                </Link>
                <Link to="/ai-services" className="btn btn-secondary btn-large">
                  Explore AI Services
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">24,000+</div>
                  <div className="stat-label">Organizations Served</div>
                </div>
                <div className="stat">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Countries Worldwide</div>
                </div>
                <div className="stat">
                  <div className="stat-number">20+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Products Section */}
        <section id="products" className="products">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">NetSuite Cloud Products</h2>
              <p className="section-subtitle">
                Comprehensive business management solutions built on the world's #1 cloud ERP platform
              </p>
            </div>

            <div className="grid grid-2">
              {products.map((product, index) => (
                <div key={index} className="product-card">
                  <div className="card-icon">
                    {product.icon}
                  </div>
                  <h3 className="card-title">{product.title}</h3>
                  <p className="card-description">{product.description}</p>
                  <ul className="feature-list">
                    {product.features.map((feature, idx) => (
                      <li key={idx}>
                        <CheckCircle size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="cta-center">
              <Link to="/contact" className="btn btn-primary">
                Discuss Your Requirements
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="services bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">
                Comprehensive NetSuite and AI services to accelerate your digital transformation
              </p>
            </div>

            <div className="grid grid-4">
              {services.map((service, index) => (
                <div key={index} className="card">
                  <div className="card-icon">
                    {service.icon}
                  </div>
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-description">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="partners" className="why-choose">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose CloudERP Suites</h2>
              <p className="section-subtitle">
                Partner with experts who understand your business challenges
              </p>
            </div>

            <div className="grid grid-3">
              <div className="benefit-card">
                <div className="benefit-number">01</div>
                <h3>Proven Methodology</h3>
                <p>SuiteSuccess framework refined from tens of thousands of global deployments</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-number">02</div>
                <h3>AI-First Approach</h3>
                <p>Integrate cutting-edge AI automation tailored to your actual workflows</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-number">03</div>
                <h3>Security First</h3>
                <p>ITSM, ERP, and audit compliance built into every solution</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-number">04</div>
                <h3>Quick ROI</h3>
                <p>Pilot programs that prove measurable value within weeks</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-number">05</div>
                <h3>Cross-Functional Expertise</h3>
                <p>Deep knowledge across finance, IT, operations, procurement, and engineering</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-number">06</div>
                <h3>Ongoing Support</h3>
                <p>Continuous optimization and support to maximize your investment</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Transform Your Business?</h2>
              <p>Schedule a free consultation to discuss your NetSuite implementation or AI automation needs</p>
              <div className="cta-buttons">
                <Link to="/contact" className="btn btn-accent btn-large">
                  Schedule Consultation
                </Link>
                <Link to="/ai-services" className="btn btn-secondary btn-large">
                  Learn About AI Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
