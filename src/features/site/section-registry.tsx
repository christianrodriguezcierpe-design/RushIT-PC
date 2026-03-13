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
import type { FixedSectionKey, ManagedSectionKey, SiteDefinition } from "@/types/site";
import { getFooterQuickLinks } from "@/features/site/site-runtime";

export const renderFixedSection = (site: SiteDefinition, key: FixedSectionKey) => {
  switch (key) {
    case "emergencyBanner":
      return <EmergencyBanner business={site.business} content={site.landing.fixedContent.emergencyBanner} />;
    case "navbar":
      return <Navbar business={site.business} content={site.landing.fixedContent.navbar} />;
    case "hero":
      return <HeroSection content={site.landing.fixedContent.hero} />;
    case "footer":
      return <Footer business={site.business} quickLinks={getFooterQuickLinks(site)} />;
    default:
      return null;
  }
};

export const renderManagedSection = (site: SiteDefinition, key: ManagedSectionKey) => {
  switch (key) {
    case "trustBar":
      return <TrustBar content={site.landing.managedContent.trustBar} />;
    case "services":
      return <ServicesGrid content={site.landing.managedContent.services} />;
    case "pricing":
      return <PricingTable content={site.landing.managedContent.pricing} />;
    case "howItWorks":
      return <HowItWorks content={site.landing.managedContent.howItWorks} />;
    case "beforeAfterGallery":
      return <BeforeAfterGallery content={site.landing.managedContent.beforeAfterGallery} />;
    case "reviews":
      return <ReviewsSection content={site.landing.managedContent.reviews} />;
    case "caseStudies":
      return <CaseStudies content={site.landing.managedContent.caseStudies} />;
    case "team":
      return <TeamSection content={site.landing.managedContent.team} />;
    case "leadMagnet":
      return <LeadMagnet content={site.landing.managedContent.leadMagnet} />;
    case "serviceArea":
      return <ServiceArea business={site.business} content={site.landing.managedContent.serviceArea} />;
    case "faq":
      return <FAQSection content={site.landing.managedContent.faq} />;
    case "booking":
      return <BookingSection content={site.landing.managedContent.booking} />;
    case "blogPreview":
      return <BlogSection content={site.landing.managedContent.blogPreview} />;
    default:
      return null;
  }
};
