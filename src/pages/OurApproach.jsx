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

        {/* Main Content */}
        <section className="approach-content">
          <div className="container">
            <div className="approach-main">
              <h2>Our Philosophy</h2>

              <p className="approach-description">
                Cloud ERP Suites delivers an environment where firms from diverse backgrounds can work
                together towards achieving their own common goals.
              </p>

              <div className="approach-values">
                <div className="value-item">
                  <h3>Collaborative Environment</h3>
                  <p>
                    We focus on facilitating cross-organizational partnerships that enable businesses
                    to collaborate effectively.
                  </p>
                </div>

                <div className="value-item">
                  <h3>Inclusive Approach</h3>
                  <p>
                    Organizations from varying sectors can participate and benefit from our platform
                    and expertise.
                  </p>
                </div>

                <div className="value-item">
                  <h3>Goal Alignment</h3>
                  <p>
                    Our platform supports both individual and collective objectives, ensuring everyone
                    succeeds together.
                  </p>
                </div>
              </div>
            </div>
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
