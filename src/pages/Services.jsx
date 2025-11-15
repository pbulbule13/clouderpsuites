import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Search, FileText, Settings, Code, Link as LinkIcon,
  Database, Zap, GraduationCap, Headphones, AlertTriangle, Package, Users
} from 'lucide-react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: <Search />,
      title: 'Assessment & Architecture',
      description: 'Provides customized 360-degree assessments where experts analyze, document, and architect a solution tailored to specific business needs, ensuring scalability and staff satisfaction.'
    },
    {
      icon: <FileText />,
      title: 'Business Process Review',
      description: 'Examines organizational operations to identify efficiency improvements. The service involves evaluating, mapping, questioning, and thinking outside the box to save time and money while supporting solution selection.'
    },
    {
      icon: <Settings />,
      title: 'Implementation & Configuration',
      description: 'Configures cloud platforms (NetSuite, Salesforce, Concur, Expensify) with flexibility to meet business requirements and demonstrate the quickest ROI.'
    },
    {
      icon: <Code />,
      title: 'Customization & Development',
      description: 'Develops custom tools and scripts when out-of-the-box solutions require enhancement for competitive advantage and/or significantly improve your efficiencies.'
    },
    {
      icon: <LinkIcon />,
      title: 'Integration',
      description: 'Maps data flows and connects cloud and on-premises systems using off-the-shelf or custom technologies.'
    },
    {
      icon: <Database />,
      title: 'Data Migration',
      description: 'Cleans and migrates data from legacy systems to new cloud platforms.'
    },
    {
      icon: <Zap />,
      title: 'Optimization',
      description: 'Conducts health checks and upgrade readiness reviews to maximize system efficiency, especially after platform upgrades occurring every six months.'
    },
    {
      icon: <GraduationCap />,
      title: 'Training',
      description: 'Delivers onsite, remote, group, and individual training with hands-on training sessions integrated into implementation and ongoing operations.'
    },
    {
      icon: <Headphones />,
      title: 'Support',
      description: 'Provides post-launch support packages ensuring systems remain efficiently up and running at all times.'
    },
    {
      icon: <AlertTriangle />,
      title: 'Project Rescue',
      description: 'Intervenes at any project stage when implementations face derailment.'
    },
    {
      icon: <Package />,
      title: 'Prepackaged Services',
      description: 'Fixed-price services including KPIs, dashboards, process optimization, and database cleaning.'
    },
    {
      icon: <Users />,
      title: 'Staff Augmentation',
      description: 'Provides dedicated resources for projects without requiring internal training overhead.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services | CloudERP Suites</title>
        <meta name="description" content="Comprehensive, efficient and cost-effective cloud solutions leveraging industry best practices and deployment expertise." />
      </Helmet>

      <main className="services-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <h1>Our Services</h1>
            <p className="hero-subtitle">
              Comprehensive, efficient and cost-effective cloud solutions leveraging industry best practices
              and deployment expertise to help businesses scale sustainably.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-grid-section">
          <div className="container">
            <div className="services-grid">
              {services.map((service, index) => (
                <article key={index} className="service-card">
                  <div className="service-icon">
                    {service.icon}
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="services-cta">
          <div className="container">
            <div className="cta-box">
              <h2>Need Help With Your Cloud Solution?</h2>
              <p>Contact us for a free consultation to discuss your business needs</p>
              <Link to="/contact" className="btn btn-primary btn-large">
                Schedule Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Services;
