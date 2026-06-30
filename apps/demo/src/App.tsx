import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="app">
      <div className="ambient-background"></div>
      <div className="ambient-glow"></div>
      
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
