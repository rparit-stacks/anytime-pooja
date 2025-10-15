import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Shield, Truck, Users, Award } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60 z-10" />
          <img 
            src="/large-banner-for-anytime-pooja.jpg" 
            alt="Anytime Pooja" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">
                  About Anytime Pooja
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-8 text-pretty">
                  Your trusted spiritual companion for authentic pooja items, crystals, and astrology essentials
                </p>
                <Link href="/products">
                  <Button size="lg" className="text-base px-8">
                    Explore Our Collection
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                At Anytime Pooja, we believe that spirituality should be accessible to everyone, anytime, anywhere. 
                We curate authentic and high-quality spiritual products to help you connect with your inner self 
                and create meaningful rituals in your daily life.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Authentic Products</h3>
                  <p className="text-muted-foreground">Carefully sourced from trusted suppliers and spiritual centers</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                  <p className="text-muted-foreground">Every product is tested for purity and spiritual significance</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Expert Guidance</h3>
                  <p className="text-muted-foreground">Spiritual guidance from experienced practitioners</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance mb-6">
                  Our Story
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Founded with a deep respect for spiritual traditions, Anytime Pooja began as a small initiative 
                  to make authentic spiritual products accessible to modern practitioners. Our journey started 
                  when we realized the difficulty people face in finding genuine, high-quality spiritual items.
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Today, we serve thousands of customers worldwide, offering everything from traditional pooja 
                  items to modern crystals and astrology tools. Our commitment remains the same: to provide 
                  authentic products that enhance your spiritual journey.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <Award className="h-4 w-4 mr-2" />
                    Trusted by 10,000+ Customers
                  </Badge>
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    <Star className="h-4 w-4 mr-2" />
                    4.9/5 Rating
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="/luxury-home-decor.jpg" 
                  alt="Spiritual products" 
                  className="w-full h-[400px] object-cover rounded-lg shadow-lg" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance mb-4">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at Anytime Pooja
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Authenticity</h3>
                  <p className="text-sm text-muted-foreground">Genuine products sourced from traditional centers</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Quality</h3>
                  <p className="text-sm text-muted-foreground">Rigorous quality checks for every product</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Service</h3>
                  <p className="text-sm text-muted-foreground">Dedicated support for your spiritual journey</p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Reliability</h3>
                  <p className="text-sm text-muted-foreground">Fast and secure delivery worldwide</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance mb-6">
              Start Your Spiritual Journey Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore our curated collection of authentic spiritual products and find what resonates with your soul.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="text-base px-8">
                  Shop Now
                </Button>
              </Link>
              <Link href="/products?category=crystals">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Browse Crystals
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
