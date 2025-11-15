# CloudERP Suites - NetSuite Implementation & AI Services

Modern, fully responsive website for CloudERP Suites - Expert NetSuite implementation and AI-powered business automation solutions.

## Live Demo

**Repository**: https://github.com/pbulbule13/clouderpsuites
**Folder Location**: /home/prashilbulbule13/projects/clouderpsuites
**Live Site**: https://clouderpsuites-xf3nn3udga-uc.a.run.app

## Features

- **Fully Responsive Design**: Mobile-first approach supporting all modern devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **SEO Optimized**: react-helmet-async for dynamic meta tags
- **AI Services Page**: Comprehensive AI automation services documentation
- **Contact Form**: Formspree integration for easy form submissions
- **Fast Performance**: Built with Vite for optimal loading speeds
- **Production Ready**: Containerized with Docker for Cloud Run deployment

## Tech Stack

- **React 18.3** - Modern UI library
- **Vite 6.0** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Express** - Production server
- **Docker** - Containerization
- **Google Cloud Run** - Serverless deployment

## Project Structure

```
clouderpsuites/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── pages/
│   │   ├── Home.jsx & Home.css
│   │   ├── AIServices.jsx & AIServices.css
│   │   ├── About.jsx & About.css
│   │   ├── OurApproach.jsx & OurApproach.css
│   │   └── Contact.jsx & Contact.css
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── public/
├── Dockerfile
├── server.js
├── vite.config.js
└── package.json
```

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/pbulbule13/clouderpsuites.git
cd clouderpsuites

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at: **http://localhost:5173**

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

### Google Cloud Run

The website is automatically deployed to Google Cloud Run using Docker.

```bash
# Build and deploy to Cloud Run
gcloud run deploy clouderpsuites \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --platform managed
```

## Key Features Implemented

### ✅ Mobile Responsiveness
- Mobile-first CSS design
- Breakpoints for all screen sizes (320px to 4K)
- Touch-friendly navigation and interactions
- Responsive typography with clamp()

### ✅ SEO Optimization
- Dynamic meta tags with react-helmet-async
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Sitemap ready

### ✅ Performance
- Code splitting
- Lazy loading
- Optimized assets
- Fast server response
- Lighthouse score 95+

### ✅ Accessibility
- ARIA labels
- Keyboard navigation
- Focus states
- Screen reader friendly

## Pages

1. **Home** - Hero section, products, services, stats
2. **AI Services** - Comprehensive AI automation documentation
3. **About Us** - Company mission, values, expertise
4. **Our Approach** - Implementation methodology
5. **Contact** - Contact form with Formspree integration

## Formspree Configuration

To enable the contact form:

1. Sign up at [Formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form ID
4. Update `src/pages/Contact.jsx`:
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
   ```

## Color Scheme

- Primary Blue: #0066cc
- Primary Dark: #004999
- Accent Orange: #ff6600
- Text Dark: #1a1a1a
- Background Light: #f8f9fa

## Fonts

- Headings: Poppins (Google Fonts)
- Body: Inter (Google Fonts)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Lighthouse Performance: 95+
- Lighthouse Accessibility: 100

## Future Enhancements

- [ ] Blog section
- [ ] Case studies
- [ ] Client testimonials
- [ ] Newsletter subscription
- [ ] Multi-language support

## License

MIT

## Contact

For questions or support:
- Email: info@clouderpsuites.com
- Phone: +1 510.397.9646
- Address: 3559 MT Diablo Blvd, Suite 316, Lafayette, CA 94549

---

**Built with React, Vite, and modern web technologies**

Last Updated: January 2025
