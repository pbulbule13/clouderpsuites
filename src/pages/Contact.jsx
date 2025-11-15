import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service: 'netsuite',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: false,
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: false, message: '' });

    try {
      // Formspree endpoint - Replace with your actual Formspree form ID
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({
          submitting: false,
          submitted: true,
          error: false,
          message: 'Thank you! We\'ll be in touch within 24 hours.'
        });
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          service: 'netsuite',
          message: ''
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      setStatus({
        submitting: false,
        submitted: false,
        error: true,
        message: 'Something went wrong. Please try again or email us directly.'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Schedule a Consultation | CloudERP Suites</title>
        <meta name="description" content="Get in touch with CloudERP Suites for NetSuite implementation, AI automation consulting, or schedule a free consultation. We're here to help transform your business." />
      </Helmet>

      <main className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="container">
            <div className="contact-hero-content">
              <h1 className="fade-in-up">Let's Talk About Your Project</h1>
              <p className="contact-hero-subtitle fade-in-up">
                Schedule a free consultation to discuss how we can help transform your business
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content">
          <div className="container">
            <div className="contact-grid">
              {/* Contact Form */}
              <div className="contact-form-section">
                <h2>Send Us a Message</h2>
                <p className="form-intro">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                {status.submitted && (
                  <div className="alert alert-success">
                    <CheckCircle size={20} />
                    <span>{status.message}</span>
                  </div>
                )}

                {status.error && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <span>{status.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company">Company Name</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="service">I'm Interested In *</label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                    >
                      <option value="netsuite">NetSuite Implementation</option>
                      <option value="ai-automation">AI Automation</option>
                      <option value="optimization">NetSuite Optimization</option>
                      <option value="integration">System Integration</option>
                      <option value="consulting">General Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Tell us about your project and requirements..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-large btn-full"
                    disabled={status.submitting}
                  >
                    {status.submitting ? (
                      <>
                        <span className="loading"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="form-privacy">
                    By submitting this form, you agree to our privacy policy. We'll never share your information.
                  </p>
                </form>
              </div>

              {/* Contact Information */}
              <div className="contact-info-section">
                <h2>Get In Touch</h2>
                <p>
                  Prefer to reach out directly? We're here to help.
                </p>

                <div className="contact-info-cards">
                  <div className="info-card">
                    <div className="info-icon">
                      <Phone />
                    </div>
                    <h3>Phone</h3>
                    <a href="tel:+15103979646">+1 510.397.9646</a>
                    <p>Mon-Fri, 9am-6pm PST</p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <Mail />
                    </div>
                    <h3>Email</h3>
                    <a href="mailto:info@clouderpsuites.com">info@clouderpsuites.com</a>
                    <p>We respond within 24 hours</p>
                  </div>

                  <div className="info-card">
                    <div className="info-icon">
                      <MapPin />
                    </div>
                    <h3>Office</h3>
                    <p>3559 MT Diablo Blvd, Suite 316<br />Lafayette, CA 94549</p>
                  </div>
                </div>

                <div className="business-hours">
                  <h3>Business Hours</h3>
                  <ul>
                    <li><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM PST</li>
                    <li><strong>Saturday:</strong> By Appointment</li>
                    <li><strong>Sunday:</strong> Closed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
