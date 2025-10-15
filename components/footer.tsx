"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"
import { LoadingButton } from "@/components/ui/loading-button"

export function Footer() {
  const { data: footerData, error } = useSWR("/api/footer", swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000 // 5 minutes
  })

  const footer = footerData?.footer || {}

  // Fallback data if API fails
  const fallbackFooter = {
    footer_about_title: "About Anytime Pooja",
    footer_about_text: "Your trusted destination for authentic spiritual products, pooja essentials, and sacred collections. We are committed to providing high-quality items for your spiritual journey.",
    footer_quick_links_title: "Quick Links",
    footer_quick_links: [
      { title: "Home", url: "/" },
      { title: "About Us", url: "/about" },
      { title: "Products", url: "/products" },
      { title: "Contact", url: "/contact" }
    ],
    footer_categories_title: "Categories",
    footer_categories: [
      { title: "Pooja Items", url: "/products?category=pooja-items" },
      { title: "Rudraksha", url: "/products?category=rudraksha" },
      { title: "Crystals", url: "/products?category=crystals" },
      { title: "Mandir Items", url: "/products?category=mandir" }
    ],
    footer_contact_title: "Contact Info",
    footer_contact_address: "123 Spiritual Street, Divine City, India - 110001",
    footer_contact_phone: "+91-9876543210",
    footer_contact_email: "support@anytimepooja.com",
    footer_social_title: "Follow Us",
    footer_social_links: [
      { platform: "Facebook", url: "https://facebook.com/anytimepooja", icon: "fa-facebook" },
      { platform: "Instagram", url: "https://instagram.com/anytimepooja", icon: "fa-instagram" },
      { platform: "Twitter", url: "https://twitter.com/anytimepooja", icon: "fa-twitter" },
      { platform: "YouTube", url: "https://youtube.com/anytimepooja", icon: "fa-youtube" }
    ],
    footer_newsletter_title: "Subscribe to Newsletter",
    footer_newsletter_text: "Get updates on new products and spiritual insights.",
    footer_newsletter_placeholder: "Enter your email address",
    footer_copyright: "© 2024 Anytime Pooja. All rights reserved."
  }

  // Use API data or fallback
  const footerContent = error ? fallbackFooter : { ...fallbackFooter, ...footer }

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4" aria-label="Anytime Pooja home">
              <img src="/images/logo.png" alt="Anytime Pooja logo" className="h-14 md:h-16 w-auto" />
              <span className="text-xl md:text-2xl font-serif font-bold">Anytime Pooja</span>
            </Link>
            <h3 className="font-semibold mb-2">{footerContent.footer_about_title}</h3>
            <p className="text-muted-foreground text-sm mb-4 text-pretty">
              {footerContent.footer_about_text}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {footerContent.footer_social_links?.map((social: any, index: number) => (
                <Link
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label={social.platform}
                >
                  {social.platform === 'Facebook' && <Facebook className="h-4 w-4" />}
                  {social.platform === 'Instagram' && <Instagram className="h-4 w-4" />}
                  {social.platform === 'Twitter' && <Twitter className="h-4 w-4" />}
                  {social.platform === 'YouTube' && <Youtube className="h-4 w-4" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{footerContent.footer_quick_links_title}</h3>
            <ul className="space-y-2 text-sm">
              {footerContent.footer_quick_links?.map((link: any, index: number) => (
                <li key={index}>
                  <Link 
                    href={link.url} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{footerContent.footer_categories_title}</h3>
            <ul className="space-y-2 text-sm">
              {footerContent.footer_categories?.map((category: any, index: number) => (
                <li key={index}>
                  <Link 
                    href={category.url} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">{footerContent.footer_contact_title}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-muted-foreground">{footerContent.footer_contact_address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Link 
                  href={`tel:${footerContent.footer_contact_phone}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerContent.footer_contact_phone}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Link 
                  href={`mailto:${footerContent.footer_contact_email}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerContent.footer_contact_email}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="pt-8 border-t border-border">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold mb-2">{footerContent.footer_newsletter_title}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {footerContent.footer_newsletter_text}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={footerContent.footer_newsletter_placeholder}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <LoadingButton 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                loadingText="Subscribing..."
                onClick={async () => {
                  // Newsletter subscription logic here
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }}
              >
                Subscribe
              </LoadingButton>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{footerContent.footer_copyright}</p>
        </div>
      </div>
    </footer>
  )
}
