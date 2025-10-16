import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MobileCategoryMarquee } from "@/components/mobile-category-marquee"
import { TrendingProducts } from "@/components/trending-products"
import { CategorySection } from "@/components/category-section"
import { ProductsSection } from "@/components/products-section"
import { PromoBanner } from "@/components/promo-banner"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"
import { TrendingMarquee } from "@/components/trending-marquee"
import { AnimatedCategories } from "@/components/animated-categories"
import { ProductSpotlight } from "@/components/product-spotlight"
import { HomeInfoCards } from "@/components/home-info-cards"
import { HomepageLoading } from "@/components/homepage-loading"

export default function HomePage() {
  return (
    <HomepageLoading>
      <div className="min-h-screen">
        <Header />
        <main>
          <MobileCategoryMarquee />
          <HeroSection />
          <TrendingProducts />
          {/* animated sections */}
          <TrendingMarquee />
          <AnimatedCategories />
          <ProductSpotlight />
          <HomeInfoCards />
          {/* original sections */}
          <CategorySection />
          <ProductsSection />
          <PromoBanner />
          <NewsletterSection />
        </main>
        <Footer />
      </div>
    </HomepageLoading>
  )
}
