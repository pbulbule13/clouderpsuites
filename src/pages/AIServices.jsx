import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Brain, Database, Sparkles, Shield, Zap, CheckCircle,
  FileText, RefreshCw, TrendingUp, Users, Clock, Target
} from 'lucide-react';
import './AIServices.css';

const AIServices = () => {
  const whyCloudERP = [
    { icon: <Target />, text: 'AI tailored to your actual workflows—not generic "AI transformation" hype' },
    { icon: <Shield />, text: 'Security-first design aligned to ITSM, ERP, and audit requirements' },
    { icon: <Zap />, text: 'Quick pilots that prove ROI within weeks' },
    { icon: <Users />, text: 'Expertise across finance, IT, operations, procurement, and engineering' }
  ];

  const erpServices = [
    'AI-Assisted Journal Entry Creation',
    'Automated Invoice Coding & Vendor Bill Categorization',
    'Anomaly Detection in Transactions & Revenue',
    'Natural-Language Queries ("Show me all transactions missing department codes")',
    'AI-Powered Reconciliations'
  ];

  const erpBenefits = [
    'Faster, cleaner month-end close',
    'Reduced manual entry and spreadsheet dependencies',
    'Fewer errors reaching the GL',
    'Real-time financial insights without custom reports'
  ];

  const supportServices = [
    'Automatic Ticket Categorization & Assignment',
    'Duplicate & Related Issue Detection',
    'Thread & Comment Summaries',
    'Cycle Time & Workload Insights',
    'Intent & Priority Detection'
  ];

  const supportBenefits = [
    'Less time grooming and triaging',
    'Improved SLA performance',
    'Clearer sprints and fewer workflow bottlenecks',
    'Better visibility for engineering leaders'
  ];

  const itsmServices = [
    'AI-Driven Incident Classification & Assignment',
    'Virtual Agent Knowledge Suggestions',
    'Predictive SLA Breach Alerts',
    'Automated Resolution for Repetitive Requests',
    'Volume Prediction & Staffing Insights'
  ];

  const itsmBenefits = [
    'Higher first-contact resolution',
    'Smaller ticket backlog',
    'Better ITSM forecasting',
    'Lower support cost per ticket'
  ];

  const translationExamples = [
    { from: 'Ariba', to: 'NetSuite or Oracle', desc: 'Convert procurement output XML/CSV into ERP-ready vendor bill or PO formats' },
    { from: 'Workday', to: 'NetSuite', desc: 'Format employee/department structures for finance operations' },
    { from: 'Metronome', to: 'NetSuite', desc: 'Transform metered-billing entries into invoice-ready data' },
    { from: 'Salesforce', to: 'ServiceNow', desc: 'Convert cases into incident-ready formats with mappings applied automatically' },
    { from: 'Vendor Portals', to: 'ERP', desc: 'Convert vendor invoice PDFs/emails into structured transactions' }
  ];

  const normalizationCapabilities = [
    {
      title: 'Field Mapping & AI Schema Matching',
      description: 'AI identifies correct fields automatically (e.g., vendor name, PO number, invoice amount)'
    },
    {
      title: 'Unit, Currency, and Code Standardization',
      description: 'Fix mismatched currency symbols, units, and formatting differences'
    },
    {
      title: 'Enforce System-Specific Required Fields',
      description: 'Required fields for NetSuite, Jira, or ServiceNow are filled or flagged'
    },
    {
      title: 'AI Cleansing & Deduplication',
      description: 'Ensure clean and accurate master data'
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Services - AI Automation for ERP, CRM, ITSM | CloudERP Suites</title>
        <meta name="description" content="AI-driven automation across ERP, CRM, ITSM and business systems. Transform operations with intelligent workflows, data translation, and cross-system automation." />
        <meta name="keywords" content="AI automation, AI for ERP, AI for ITSM, business automation, data translation, NetSuite AI, intelligent automation" />
      </Helmet>

      <main className="ai-services">
        {/* Hero Section */}
        <section className="ai-hero">
          <div className="container">
            <div className="ai-hero-content">
              <h1 className="fade-in-up">AI-Driven Automation Services</h1>
              <p className="ai-hero-subtitle fade-in-up">
                AI is redefining how modern organizations manage finance, operations, engineering, procurement, and IT service delivery.
                Cloud ERP Suites delivers practical, secure, enterprise-grade AI solutions that enhance accuracy, reduce manual work, and accelerate decision-making across the systems your business uses daily.
              </p>
            </div>
          </div>
        </section>

        {/* Why Cloud ERP Suites */}
        <section className="why-clouderpsuites">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Cloud ERP Suites for AI</h2>
            </div>
            <div className="grid grid-2">
              {whyCloudERP.map((item, index) => (
                <div key={index} className="why-card">
                  <div className="why-icon">{item.icon}</div>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Services Overview */}
        <section className="services-overview bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">AI Services by Platform</h2>
              <p className="section-subtitle">
                Comprehensive AI solutions across your entire technology stack
              </p>
            </div>

            {/* AI for ERP and CRM */}
            <div className="service-block">
              <div className="service-header">
                <div className="service-icon">
                  <Database />
                </div>
                <div>
                  <h3>AI for ERP and CRM</h3>
                  <p className="service-tagline">Automate Finance, Billing, and Operations with Intelligence</p>
                </div>
              </div>
              <p className="service-intro">
                We bring AI into ERP to streamline financial processes, support decision-making, and eliminate repetitive work.
              </p>

              <div className="service-details">
                <div className="detail-section">
                  <h4>Capabilities</h4>
                  <ul className="capability-list">
                    {erpServices.map((service, index) => (
                      <li key={index}>
                        <CheckCircle size={18} />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Value Add</h4>
                  <ul className="benefit-list">
                    {erpBenefits.map((benefit, index) => (
                      <li key={index}>
                        <Sparkles size={18} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI for Support */}
            <div className="service-block">
              <div className="service-header">
                <div className="service-icon">
                  <Users />
                </div>
                <div>
                  <h3>AI for Support</h3>
                  <p className="service-tagline">Reduce Manual Ticket Work & Improve Engineering Velocity</p>
                </div>
              </div>
              <p className="service-intro">
                AI makes support smarter, helping engineering, product, and business teams move faster.
              </p>

              <div className="service-details">
                <div className="detail-section">
                  <h4>Capabilities</h4>
                  <ul className="capability-list">
                    {supportServices.map((service, index) => (
                      <li key={index}>
                        <CheckCircle size={18} />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Value Add</h4>
                  <ul className="benefit-list">
                    {supportBenefits.map((benefit, index) => (
                      <li key={index}>
                        <Sparkles size={18} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI for Services (ITSM) */}
            <div className="service-block">
              <div className="service-header">
                <div className="service-icon">
                  <Shield />
                </div>
                <div>
                  <h3>AI for Services</h3>
                  <p className="service-tagline">Intelligent ITSM, Faster Resolutions, and Better Self-Service</p>
                </div>
              </div>
              <p className="service-intro">
                AI supercharges Services for IT, HR, Facilities, and enterprise service teams.
              </p>

              <div className="service-details">
                <div className="detail-section">
                  <h4>Capabilities</h4>
                  <ul className="capability-list">
                    {itsmServices.map((service, index) => (
                      <li key={index}>
                        <CheckCircle size={18} />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Value Add</h4>
                  <ul className="benefit-list">
                    {itsmBenefits.map((benefit, index) => (
                      <li key={index}>
                        <Sparkles size={18} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Translation */}
        <section className="data-services">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">AI-Powered Data Translation & Format Normalization</h2>
              <p className="section-subtitle">
                Convert Data Into Any Target-Ready Structure
              </p>
            </div>

            <p className="intro-text">
              Modern enterprises exchange data with dozens of external systems—procurement networks, banks, vendors,
              billing systems, and integration partners. AI can automatically translate, convert, and reformat data
              so it is accepted by your downstream systems without manual intervention.
            </p>

            <h3 className="subsection-title">Translation Examples</h3>
            <div className="translation-grid">
              {translationExamples.map((example, index) => (
                <div key={index} className="translation-card">
                  <div className="translation-route">
                    <span className="from">{example.from}</span>
                    <RefreshCw size={20} className="arrow" />
                    <span className="to">{example.to}</span>
                  </div>
                  <p>{example.desc}</p>
                </div>
              ))}
            </div>

            <div className="value-section">
              <h4>Value Add</h4>
              <ul className="value-list">
                <li><Sparkles /> Eliminates manual data formatting work</li>
                <li><Sparkles /> Reduces integration mapping complexity</li>
                <li><Sparkles /> Prevents downstream errors by enforcing required formats</li>
                <li><Sparkles /> Speeds up data ingestion into ERP, billing, or IT systems</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Normalization */}
        <section className="normalization-section bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">AI-Driven Data Input Normalization & Structuring</h2>
              <p className="section-subtitle">
                Convert Any Data Source Into a Clean, System-Ready Format
              </p>
            </div>

            <p className="intro-text">
              AI processes data from a wide range of inputs—including PDFs, emails, Excel files, CSV exports, API feeds, or screenshots—and restructures it to match the exact requirements of the target system.
            </p>

            <div className="grid grid-2">
              {normalizationCapabilities.map((cap, index) => (
                <div key={index} className="capability-card">
                  <h4>{cap.title}</h4>
                  <p>{cap.description}</p>
                </div>
              ))}
            </div>

            <div className="value-section">
              <h4>Value Add</h4>
              <ul className="value-list">
                <li><Sparkles /> Near-zero manual pre-processing before uploads</li>
                <li><Sparkles /> Clean, validated data entering downstream systems</li>
                <li><Sparkles /> Reduced risk of failed imports or integration errors</li>
                <li><Sparkles /> Faster onboarding of vendors, customers, and new business lines</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cross-System Verification */}
        <section className="verification-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Cross-System Data Verification & Consistency Enforcement</h2>
              <p className="section-subtitle">Stop Errors Before They Spread Across Systems</p>
            </div>

            <p className="intro-text">
              AI automatically performs field-by-field comparisons across systems to ensure consistency.
            </p>

            <div className="verification-examples">
              <div className="verification-item">
                <div className="verification-icon"><Brain /></div>
                <p>Customer name in CRM ≠ customer name in ERP</p>
              </div>
              <div className="verification-item">
                <div className="verification-icon"><Brain /></div>
                <p>Item code in P2P system ≠ item code in inventory dataset</p>
              </div>
              <div className="verification-item">
                <div className="verification-icon"><Brain /></div>
                <p>Project or case data in Jira ≠ project structure in NetSuite</p>
              </div>
              <div className="verification-item">
                <div className="verification-icon"><Brain /></div>
                <p>Incident category in ServiceNow ≠ classification rules in Jira</p>
              </div>
            </div>

            <p className="highlight-text">
              AI flags mismatches before they propagate, reducing reconciliation work for finance, operations, and IT.
            </p>

            <div className="value-section">
              <h4>Value Add</h4>
              <ul className="value-list">
                <li><Sparkles /> Prevents downstream rework</li>
                <li><Sparkles /> Reduces month-end exceptions</li>
                <li><Sparkles /> Ensures master data integrity across systems</li>
                <li><Sparkles /> Improves accuracy of billing, rev rec, and reporting</li>
              </ul>
            </div>
          </div>
        </section>

        {/* End-to-End Automation */}
        <section className="automation-section bg-light">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">End-to-End Enterprise Automation</h2>
              <p className="section-subtitle">
                AI can orchestrate workflows across all major systems
              </p>
            </div>

            <div className="automation-examples">
              <div className="automation-flow">
                <div className="flow-step">Jira tasks</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">ServiceNow incidents</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">NetSuite project & billing entries</div>
              </div>

              <div className="automation-flow">
                <div className="flow-step">Ariba supplier invoices</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">AI formatting</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">NetSuite vendor bills</div>
              </div>

              <div className="automation-flow">
                <div className="flow-step">ServiceNow change tasks</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">Jira engineering tasks</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">NetSuite cost center impacts</div>
              </div>

              <div className="automation-flow">
                <div className="flow-step">Metered usage from billing</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">AI restructuring</div>
                <div className="flow-arrow">→</div>
                <div className="flow-step">ERP revenue schedules</div>
              </div>
            </div>

            <p className="highlight-text">
              Your data becomes consistent, validated, formatted, and synchronized across the entire enterprise stack.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="ai-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Modernize Your Systems with AI?</h2>
              <p>We'll help you identify:</p>
              <ul className="cta-list">
                <li><CheckCircle /> High-ROI AI use cases</li>
                <li><CheckCircle /> Data formatting and translation gaps</li>
                <li><CheckCircle /> Automation opportunities across your tech stack</li>
                <li><CheckCircle /> A 3–6 month AI roadmap</li>
              </ul>
              <Link to="/contact" className="btn btn-accent btn-large">
                Contact us to begin your AI Assessment
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AIServices;
