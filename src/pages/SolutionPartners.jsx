import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './SolutionPartners.css';

const SolutionPartners = () => {
  const partners = [
    'Adaptive Insights',
    'Avalara',
    'Celigo',
    'Concur',
    'Dell Boomi',
    'Jitterbit',
    'SPS Commerce',
    'Expensify'
  ];

  return (
    <>
      <Helmet>
        <title>Solution Partners | CloudERP Suites</title>
        <meta name="description" content="Our solution partners help boost the functionality of your system to cater to your unique business needs." />
      </Helmet>

      <main className="partners-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <h1>Solution Partners</h1>
          </div>
        </section>

        {/* Main Content */}
        <section className="partners-content">
          <div className="container">
            <div className="partners-intro">
              <p className="intro-text">
                Each client is unique and you are no exception! Sometimes your business needs to push
                the limits of your unified solution.
              </p>
              <p className="intro-text">
                We provide a way to boost the functionality of your system in order to cater to your
                business needs.
              </p>
            </div>

            <div className="partners-grid">
              {partners.map((partner, index) => (
                <div key={index} className="partner-card">
                  <h3>{partner}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="partners-cta">
          <div className="container">
            <div className="cta-box">
              <h2>Need a Custom Integration?</h2>
              <p>Contact us to learn more about our solution partner ecosystem</p>
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

export default SolutionPartners;
