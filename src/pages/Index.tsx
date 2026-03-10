import EmergencyBanner from "@/components/landing/EmergencyBanner";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import ServicesGrid from "@/components/landing/ServicesGrid";
import PricingTable from "@/components/landing/PricingTable";
import HowItWorks from "@/components/landing/HowItWorks";
import BeforeAfterGallery from "@/components/landing/BeforeAfterGallery";
import ReviewsSection from "@/components/landing/ReviewsSection";
import CaseStudies from "@/components/landing/CaseStudies";
import TeamSection from "@/components/landing/TeamSection";
import LeadMagnet from "@/components/landing/LeadMagnet";
import ServiceArea from "@/components/landing/ServiceArea";
import FAQSection from "@/components/landing/FAQSection";
import BookingSection from "@/components/landing/BookingSection";
import BlogSection from "@/components/landing/BlogSection";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <EmergencyBanner />
    <Navbar />
    <main>
      <HeroSection />
      <TrustBar />
      <ServicesGrid />
      <PricingTable />
      <HowItWorks />
      <BeforeAfterGallery />
      <ReviewsSection />
      <CaseStudies />
      <TeamSection />
      <LeadMagnet />
      <ServiceArea />
      <FAQSection />
      <BookingSection />
      <BlogSection />
    </main>
    <Footer />
  </div>
);

export default Index;
