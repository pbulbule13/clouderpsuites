import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AIServices from './pages/AIServices';
import About from './pages/About';
import OurApproach from './pages/OurApproach';
import Contact from './pages/Contact';
import './styles/global.css';

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-services" element={<AIServices />} />
          <Route path="/about" element={<About />} />
          <Route path="/our-approach" element={<OurApproach />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </HelmetProvider>
  );
}

export default App;
