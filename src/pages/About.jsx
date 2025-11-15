import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | CloudERP Suites</title>
        <meta name="description" content="CloudERP Suites innovative team of business and technical professionals sets the standard for best practices when it comes to moving to the NetSuite cloud." />
      </Helmet>

      <main className="about-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <h1>About Us</h1>
          </div>
        </section>

        {/* Main Content */}
        <section className="about-content">
          <div className="container">
            <div className="about-main">
              <h2>Why Choose Us</h2>

              <p className="about-intro">
                CloudERP Suites innovative team of business and technical professionals sets the standard
                for best practices when it comes to moving to the NetSuite cloud for businesses of all sizes.
              </p>

              <p className="about-description">
                We provide advisory services to organizations evaluating cloud solutions. Our professionals
                guide clients through selecting appropriate cloud products, implementing solutions, and
                executing integration and customization projects. The platform operates as a
                software-as-a-service model, eliminating installation requirements.
              </p>

              <p className="about-mission">
                Cloud ERP Suites delivers an environment where firms from diverse backgrounds can work
                together towards achieving their own common goals.
              </p>

              <div className="about-services">
                <h3>Our Services</h3>
                <ul className="services-list">
                  <li>Cloud product recommendations</li>
                  <li>Implementation support</li>
                  <li>Integration services</li>
                  <li>Customization projects</li>
                  <li>NetSuite ERP solutions</li>
                  <li>NetSuite CRM solutions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="container">
            <div className="cta-box">
              <h2>Ready to Get Started?</h2>
              <p>Contact us today for a free consultation</p>
              <Link to="/contact" className="btn btn-primary btn-large">
                Free Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
