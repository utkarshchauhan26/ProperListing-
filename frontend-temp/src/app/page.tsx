import Navbar from "../components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import ListingsPreview from "./components/ListingsPreview";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";
import FloatingChat from "./components/FloatingChat";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <ListingsPreview />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <Footer />
      <FloatingChat />
    </main>
  );
}
