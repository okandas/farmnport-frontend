"use client"

import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselDots, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"

const SLIDES = [
  {
    label: "Pre-Order",
    title: "Bulk Eggs, Day-Old\nChicks & Harvests",
    description: "Order in bulk directly from verified suppliers — eggs, chicks, seeds and more.",
    cta: "BROWSE BOOKINGS",
    href: "/bookings",
  },
  {
    label: "Marketplace",
    title: "List Your Harvest\n& Get Bids",
    description: "Post a lot, set your price, receive bids from verified buyers across Zimbabwe.",
    cta: "LIST A LOT",
    href: "/lots/new",
  },
  {
    label: "Supply or Buy Regularly?",
    title: "Create a Booking\n& Secure Your Orders",
    description: "Farmers: list produce you supply regularly. Buyers: post what you need and let farmers come to you.",
    cta: "CREATE A BOOKING",
    href: "/bookings/new",
  },
]

export function HeroSection() {
  return (
    <section className="py-6">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main carousel — left 2/3 */}
          <div className="lg:col-span-2 relative">
            <Carousel
              opts={{ loop: true }}
              plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            >
              <CarouselContent>
                {SLIDES.map((slide) => (
                  <CarouselItem key={slide.href}>
                    <div className="aspect-[16/9] lg:aspect-auto lg:h-[420px] rounded-md bg-muted/30 overflow-hidden flex items-end p-8">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{slide.label}</p>
                        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-2 whitespace-pre-line">
                          {slide.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          {slide.description}
                        </p>
                        <a
                          href={slide.href}
                          className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                        >
                          {slide.cta}
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselDots className="absolute bottom-4 left-1/2 -translate-x-1/2" />
            </Carousel>
          </div>

          {/* Right side — 2 stacked revenue banners */}
          <div className="flex flex-col gap-4">
            {/* Documents — 100% margin */}
            <div className="flex-1 rounded-md bg-muted/30 overflow-hidden flex items-end p-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Farm Plans</p>
                <p className="text-base font-bold leading-snug mb-1">
                  Pig Sty Plans,<br />Poultry Houses & More
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Download ready-made building plans.
                </p>
                <a
                  href="/buy-documents"
                  className="inline-flex items-center gap-2 border border-foreground px-4 py-2 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  VIEW PLANS
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            {/* Plant Nutrition — highest engagement shop page */}
            <div className="flex-1 rounded-md bg-muted/30 overflow-hidden flex items-end p-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Shop</p>
                <p className="text-base font-bold leading-snug mb-1">
                  Fertilisers &<br />Foliar Feeds
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Boost your yields with quality plant nutrition.
                </p>
                <a
                  href="/buy-plant-nutrition"
                  className="inline-flex items-center gap-2 border border-foreground px-4 py-2 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  SHOP NOW
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
