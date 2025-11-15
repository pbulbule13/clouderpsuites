import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Award, Users, Globe, TrendingUp, Shield, Target,
  CheckCircle, Sparkles, Zap, Heart
} from 'lucide-react';
import './About.css';

const About = () => {
  const values = [
    {
      icon: <Shield />,
      title: 'Security First',
      description: 'Every solution designed with security, compliance, and audit requirements at the core'
    },
    {
      icon: <Target />,
      title: 'Results Driven',
      description: 'Focus on measurable ROI and business outcomes, not just technology implementation'
    },
    {
      icon: <Users />,
      title: 'Client Partnership',
      description: 'We work as an extension of your team, deeply invested in your success'
    },
    {
      icon: <Sparkles />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI and cloud technologies to solve real business problems'
    }
  ];

  const expertise = [
    {
      area: 'Finance & Accounting',
      capabilities: ['Financial Management', 'Revenue Recognition', 'Billing & Collections', 'Audit & Compliance']
    },
    {
      area: 'IT & Operations',
      capabilities: ['ITSM', 'Infrastructure Management', 'Service Delivery', 'Change Management']
    },
    {
      area: 'Procurement',
      capabilities: ['Procure-to-Pay', 'Vendor Management', 'Contract Management', 'Spend Analytics']
    },
    {
      area: 'Engineering',
      capabilities: ['Project Management', 'Resource Planning', 'Agile Workflows', 'DevOps Integration']
    }
  ];

  const stats = [
    { number: '20+', label: 'Years Combined Experience' },
    { number: '24K+', label: 'Organizations Served' },
    { number: '100+', label: 'Countries Worldwide' },
    { number: '95%', label: 'Client Satisfaction' }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - CloudERP Suites | NetSuite & AI Experts</title>
        <meta name="description" content="Learn about CloudERP Suites - expert NetSuite implementation and AI automation consultants with 20+ years of experience serving enterprises worldwide." />
      </Helmet>

      <main className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-content">
              <h1 className="fade-in-up">About CloudERP Suites</h1>
              <p className="about-hero-subtitle fade-in-up">
                Transforming businesses through expert NetSuite implementation and intelligent AI automation
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-content">
              <div className="mission-text">
                <h2>Our Mission</h2>
                <p>
                  At CloudERP Suites, we empower organizations to achieve operational excellence through
                  intelligent enterprise systems. We combine deep NetSuite expertise with cutting-edge AI
                  automation to deliver solutions that don't just work—they transform how you do business.
                </p>
                <p>
                  With two decades of experience serving 24,000+ organizations across 100+ countries, we
                  bring proven methodologies, security-first design, and cross-functional expertise to
                  every engagement.
                </p>
              </div>
              <div className="mission-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Core Values</h2>
              <p className="section-subtitle">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-2">
              {values.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon">
                    {value.icon}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="expertise-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Cross-Functional Expertise</h2>
              <p className="section-subtitle">
                Deep knowledge across every critical business function
              </p>
            </div>

            <div className="expertise-grid">
              {expertise.map((area, index) => (
                <div key={index} className="expertise-card">
                  <h3>{area.area}</h3>
                  <ul className="expertise-list">
                    {area.capabilities.map((capability, idx) => (
                      <li key={idx}>
                        <CheckCircle size={18} />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-section bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose CloudERP Suites</h2>
            </div>

            <div className="why-grid">
              <div className="why-item">
                <div className="why-icon">
                  <Award />
                </div>
                <h4>Proven Methodology</h4>
                <p>
                  NetSuite SuiteSuccess framework refined from tens of thousands of deployments worldwide
                </p>
              </div>

              <div className="why-item">
                <div className="why-icon">
                  <Zap />
                </div>
                <h4>Quick Time to Value</h4>
                <p>
                  Pilot programs that prove ROI within weeks, not months
                </p>
              </div>

              <div className="why-item">
                <div className="why-icon">
                  <Globe />
                </div>
                <h4>Global Experience</h4>
                <p>
                  Serving organizations across 100+ countries with local compliance expertise
                </p>
              </div>

              <div className="why-item">
                <div className="why-icon">
                  <TrendingUp />
                </div>
                <h4>AI-First Approach</h4>
                <p>
                  Practical AI automation tailored to your workflows, not generic transformation hype
                </p>
              </div>

              <div className="why-item">
                <div className="why-icon">
                  <Shield />
                </div>
                <h4>Security & Compliance</h4>
                <p>
                  ITSM, ERP, and audit requirements built into every solution from day one
                </p>
              </div>

              <div className="why-item">
                <div className="why-icon">
                  <Heart />
                </div>
                <h4>Ongoing Partnership</h4>
                <p>
                  Continuous support and optimization to maximize your investment
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Let's Build Something Great Together</h2>
              <p>
                Schedule a consultation to discuss how we can transform your business with NetSuite and AI
              </p>
              <Link to="/contact" className="btn btn-accent btn-large">
                Schedule Free Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
