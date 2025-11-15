import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './OurApproach.css';

const OurApproach = () => {
  return (
    <>
      <Helmet>
        <title>Our Approach | CloudERP Suites</title>
        <meta name="description" content="Cloud ERP Suites delivers an environment where firms from diverse backgrounds can work together towards achieving their own common goals." />
      </Helmet>

      <main className="approach-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <h1>Our Approach</h1>
          </div>
        </section>

        {/* Heading Section */}
        <section className="approach-heading">
          <div className="container">
            <div className="text-center">
              <h3>Our <span className="text-thin">Approach</span></h3>
            </div>
          </div>
        </section>

        {/* Main Approach Image */}
        <section className="approach-image-section">
          <div className="approach-image-container">
            <img
              src="/images/OurApproach.PNG"
              alt="Our Approach Diagram"
              className="approach-diagram"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="approach-cta">
          <div className="container">
            <div className="cta-box">
              <h2>Ready to Work Together?</h2>
              <p>Contact us for a free consultation to discuss how we can help achieve your goals</p>
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

export default OurApproach;
