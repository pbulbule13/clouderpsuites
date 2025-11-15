import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Cloud, Server, ShoppingCart, Briefcase, Globe, Users,
  Package, DollarSign, Factory
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const products = [
    {
      icon: <Cloud />,
      title: 'NetSuite SuiteSuccess',
      description: 'NetSuite offers in one neat package the experience gained from tens of thousands of deployments gathered worldwide over two decades into a set of leading business practices. These practices are designed to pave a pathway to success and deliver fast business growth and value. To achieve a seamless flow from sales to services to support, CloudERP Suites ensures intelligent implementation beginning at the initial sales contact, and then maintains it throughout the client-customer relationship.'
    },
    {
      icon: <Server />,
      title: 'NetSuite ERP',
      description: 'NetSuite is the world\'s most deployed cloud Enterprise Resource Planning (ERP) solution, with more than 24,000 organizations across 100+ countries. NetSuite ERP delivers the proven, comprehensive financial management capabilities required to grow a changing, complex business. NetSuite ERP takes your business beyond traditional accounting software by streamlining operations across your entire organization and providing you with the real-time visibility you need to make better, faster decisions.'
    },
    {
      icon: <ShoppingCart />,
      title: 'NetSuite SuiteCommerce',
      description: 'As a pioneer in the commerce industry since 1998, NetSuite was the first to provide an eCommerce solution that unified eCommerce with your back office systems. Today, SuiteCommerce powers thousands of online businesses helping them grow and expand to new heights. Backed by professional services, an extensive partner ecosystem and dedicated support, SuiteCommerce provides your business everything it needs to succeed.'
    },
    {
      icon: <Briefcase />,
      title: 'NetSuite PSA & SRP',
      description: 'NetSuite Professional Services Automation (PSA) and NetSuite Services Resource Planning (SRP) solution, helps you accurately plan, track and execute projects. It increases visibility into your professional services organization, improves resource utilization, streamlines invoicing and billing, elevates on-time project delivery and drives profitability.'
    },
    {
      icon: <Globe />,
      title: 'NetSuite OneWorld',
      description: 'Seamlessly handles multiple currencies, taxation rules and reporting requirements across geographies and subsidiaries, providing real-time global business management and financial consolidation in a unified, cloud-based system.'
    },
    {
      icon: <Users />,
      title: 'NetSuite CRM+',
      description: 'NetSuite CRM+ software delivers powerful customer relationship management (CRM) capabilities, including sales force automation (SFA), marketing automation, customer support and service, and flexible customization, all in a web-based CRM solution.'
    },
    {
      icon: <Package />,
      title: 'NetSuite WMS',
      description: 'NetSuite WMS is a robust and scalable warehouse management solution native to the NetSuite platform. With industry-leading features such as mobile RF barcode scanning, wave planning, cartonization, kitting, space management and more, NetSuite WMS increases efficiency, improves operational excellence and lowers cost for warehouses of any size and complexity.'
    },
    {
      icon: <DollarSign />,
      title: 'NetSuite Fixed Assets',
      description: 'NetSuite Fixed Asset Management provides you with the power to eliminate spreadsheets and manual effort from your company\'s asset management processes. NetSuite\'s complete and integrated solution gives you an easy-to-manage single version of truth for your assets, a flexible fixed asset calculation engine, complete asset reporting and seamless integration with NetSuite\'s core accounting functionality.'
    },
    {
      icon: <Factory />,
      title: 'NetSuite Manufacturing',
      description: 'NetSuite\'s cloud-based financials/ERP and omni-channel commerce software suite is the best choice for manufacturers wanting a complete business solution. Its comprehensive functionality, which includes CRM, HCM and eCommerce, provides manufacturers with the software needed to run a modern business. A best-in-class architecture enables extended, yet seamlessly-integrated, global networks of suppliers and partners. These networks perform maximally because information is available in real-time everywhere.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Home | CloudERP Suites - NetSuite Implementation & AI Services</title>
        <meta name="description" content="CloudERP Suites delivers expert NetSuite ERP implementation, CRM solutions, and AI-powered business automation. Transform your business with cloud-based enterprise solutions." />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slide hero-slide-1">
          <div className="hero-content">
            <h1 className="hero-title">
              Upgrade <span className="text-thin">your business</span>
            </h1>
            <p className="hero-subtitle">
              We provide extensive assistance for Oracle NetSuite ERP for Modern Businesses
            </p>
            <Link to="/contact" className="btn btn-primary btn-large">
              Make An Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">PRIMARY PRODUCTS</h2>
          </div>

          <div className="products-grid">
            {products.map((product, index) => (
              <article key={index} className="product-card">
                <div className="product-icon">
                  {product.icon}
                </div>
                <h5 className="product-title">{product.title}</h5>
                <p className="product-description">{product.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              <span className="text-thin">Transition to the</span> CLOUD
            </h2>
            <p className="cta-subtitle">
              Optimize Oracle NetSuite ERP costs using our years of experience
            </p>
            <Link to="/contact" className="btn btn-primary btn-large">
              Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
