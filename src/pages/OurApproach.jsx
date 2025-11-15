import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Target, Search, Lightbulb, Code, Rocket, LineChart,
  CheckCircle, Users, Clock, Shield
} from 'lucide-react';
import './OurApproach.css';

const OurApproach = () => {
  const phases = [
    {
      number: '01',
      icon: <Search />,
      title: 'Discovery & Assessment',
      description: 'Deep dive into your business processes, pain points, and objectives',
      activities: [
        'Stakeholder interviews',
        'Process mapping',
        'System audit',
        'Requirements gathering'
      ]
    },
    {
      number: '02',
      icon: <Lightbulb />,
      title: 'Strategy & Design',
      description: 'Develop tailored solution architecture aligned with your business goals',
      activities: [
        'Solution architecture',
        'Data migration strategy',
        'Integration planning',
        'Change management plan'
      ]
    },
    {
      number: '03',
      icon: <Code />,
      title: 'Configuration & Development',
      description: 'Build and configure your NetSuite environment with precision',
      activities: [
        'System configuration',
        'Custom development',
        'Integration setup',
        'Data migration'
      ]
    },
    {
      number: '04',
      icon: <CheckCircle />,
      title: 'Testing & Validation',
      description: 'Rigorous testing to ensure everything works flawlessly',
      activities: [
        'Unit testing',
        'Integration testing',
        'User acceptance testing',
        'Performance validation'
      ]
    },
    {
      number: '05',
      icon: <Rocket />,
      title: 'Deployment & Go-Live',
      description: 'Smooth transition to your new system with minimal disruption',
      activities: [
        'Production deployment',
        'User training',
        'Go-live support',
        'Cutover management'
      ]
    },
    {
      number: '06',
      icon: <LineChart />,
      title: 'Optimization & Support',
      description: 'Continuous improvement and support to maximize your ROI',
      activities: [
        'Performance monitoring',
        'Ongoing optimization',
        'User support',
        'Feature enhancements'
      ]
    }
  ];

  const principles = [
    {
      icon: <Users />,
      title: 'Collaborative Partnership',
      description: 'We work as an extension of your team, not as external consultants'
    },
    {
      icon: <Target />,
      title: 'Business-Driven',
      description: 'Technology serves your business goals, not the other way around'
    },
    {
      icon: <Clock />,
      title: 'Agile Methodology',
      description: 'Iterative approach with quick wins and continuous feedback'
    },
    {
      icon: <Shield />,
      title: 'Security First',
      description: 'Compliance, audit, and security built into every phase'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Our Approach - Implementation Methodology | CloudERP Suites</title>
        <meta name="description" content="Learn about our proven NetSuite implementation methodology combining SuiteSuccess framework with agile practices for rapid, successful deployments." />
      </Helmet>

      <main className="approach-page">
        {/* Hero Section */}
        <section className="approach-hero">
          <div className="container">
            <div className="approach-hero-content">
              <h1 className="fade-in-up">Our Approach</h1>
              <p className="approach-hero-subtitle fade-in-up">
                A proven methodology refined from thousands of successful NetSuite implementations worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="approach-intro">
          <div className="container">
            <div className="intro-content">
              <h2>Implementation That Works</h2>
              <p>
                Our approach combines NetSuite's proven SuiteSuccess methodology with agile best practices
                and AI-first thinking. The result: faster implementations, lower risk, and better outcomes.
              </p>
              <p>
                We don't just install software—we transform your business operations while ensuring your
                team is equipped to succeed from day one.
              </p>
            </div>
          </div>
        </section>

        {/* Implementation Phases */}
        <section className="phases-section bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Six-Phase Implementation Process</h2>
              <p className="section-subtitle">
                Structured, repeatable, and proven across thousands of deployments
              </p>
            </div>

            <div className="phases-timeline">
              {phases.map((phase, index) => (
                <div key={index} className="phase-card">
                  <div className="phase-number">{phase.number}</div>
                  <div className="phase-icon">
                    {phase.icon}
                  </div>
                  <div className="phase-content">
                    <h3>{phase.title}</h3>
                    <p>{phase.description}</p>
                    <ul className="phase-activities">
                      {phase.activities.map((activity, idx) => (
                        <li key={idx}>
                          <CheckCircle size={16} />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guiding Principles */}
        <section className="principles-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Guiding Principles</h2>
              <p className="section-subtitle">
                The core values that drive every engagement
              </p>
            </div>

            <div className="grid grid-2">
              {principles.map((principle, index) => (
                <div key={index} className="principle-card">
                  <div className="principle-icon">
                    {principle.icon}
                  </div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SuiteSuccess Framework */}
        <section className="framework-section bg-light">
          <div className="container">
            <div className="framework-content">
              <div className="framework-text">
                <h2>Built on NetSuite SuiteSuccess</h2>
                <p>
                  SuiteSuccess is NetSuite's proven implementation methodology, refined from tens of
                  thousands of global deployments over two decades.
                </p>
                <ul className="framework-benefits">
                  <li>
                    <CheckCircle />
                    <span>Pre-configured industry best practices</span>
                  </li>
                  <li>
                    <CheckCircle />
                    <span>Accelerated time to value</span>
                  </li>
                  <li>
                    <CheckCircle />
                    <span>Lower implementation risk</span>
                  </li>
                  <li>
                    <CheckCircle />
                    <span>Proven templates and workflows</span>
                  </li>
                  <li>
                    <CheckCircle />
                    <span>Continuous innovation and updates</span>
                  </li>
                </ul>
              </div>
              <div className="framework-visual">
                <div className="framework-stat">
                  <div className="stat-big">24,000+</div>
                  <div className="stat-label">Organizations</div>
                </div>
                <div className="framework-stat">
                  <div className="stat-big">20+</div>
                  <div className="stat-label">Years Proven</div>
                </div>
                <div className="framework-stat">
                  <div className="stat-big">100+</div>
                  <div className="stat-label">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="approach-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Start Your Transformation?</h2>
              <p>
                Let's discuss how our proven approach can accelerate your NetSuite implementation
              </p>
              <div className="cta-buttons">
                <Link to="/contact" className="btn btn-accent btn-large">
                  Schedule Consultation
                </Link>
                <Link to="/ai-services" className="btn btn-secondary btn-large">
                  Explore AI Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default OurApproach;
