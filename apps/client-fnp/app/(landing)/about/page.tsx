export const metadata = {
  title: 'About Farmnport | Zimbabwe Agricultural Marketplace',
  description: 'Learn about Farmnport — Zimbabwe\'s agricultural marketplace connecting farmers and buyers. Built by BaRa in Marondera to strengthen local agriculture.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Farmnport | Zimbabwe Agricultural Marketplace',
    description: 'Learn about Farmnport — Zimbabwe\'s agricultural marketplace connecting farmers and buyers.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-[70lvh] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-3">About Farmnport</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Connecting farmers and buyers across Zimbabwe — making agricultural trade simpler, fairer, and more accessible for everyone.
          </p>
        </div>

        <div className="space-y-14">

          {/* Mission */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Our mission</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Farmnport was built to solve a real problem in Zimbabwean agriculture: the gap between farmers who grow quality produce and buyers who need it. Too often, farmers struggle to find reliable markets for their crops, while buyers spend time and money searching for consistent supply. We bridge that gap with a free, easy-to-use marketplace that brings both sides together.
            </p>
          </section>

          {/* What We Do */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What we do</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              Farmnport is an online agricultural marketplace where farmers, buyers, exporters, and importers across Zimbabwe can connect directly.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Farmer &amp; buyer directories</p>
                <p className="text-sm text-muted-foreground">Browse profiles of agricultural producers and buyers across horticulture, grain, livestock, poultry, dairy, aquaculture, and plantation crops.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Market price lists</p>
                <p className="text-sm text-muted-foreground">Access up-to-date producer price lists so you can compare market rates and make informed decisions about when and where to sell or buy.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Agrochemical guides</p>
                <p className="text-sm text-muted-foreground">Search our growing library of agrochemical product guides covering herbicides, fungicides, insecticides, and more with dosage rates and application instructions.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Direct connections</p>
                <p className="text-sm text-muted-foreground">Reach out to farmers and buyers directly through the platform. No middlemen, no hidden fees on produce transactions.</p>
              </div>
            </div>
          </section>

          {/* Who We Serve */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Who we serve</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              Whether you are a smallholder farmer in Mashonaland looking to sell your tomato harvest, a commercial grower in Manicaland supplying tobacco to international markets, or a buyer sourcing fresh vegetables for a supermarket chain — Farmnport is built for you.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>Smallholder and commercial farmers</li>
              <li>Produce buyers and wholesalers</li>
              <li>Agricultural exporters and importers</li>
              <li>Agrochemical suppliers and retailers</li>
              <li>Agricultural cooperatives and associations</li>
            </ul>
          </section>

          {/* Built in Zimbabwe */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Built in Zimbabwe, for Zimbabwe</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Farmnport is developed and operated by{' '}
              <a href="https://bara.co.zw" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">BaRa</a>,
              based in Marondera, Zimbabwe. We understand the unique challenges and opportunities in Zimbabwean agriculture because we live and work here. Our goal is to use technology to strengthen local agricultural value chains and help Zimbabwean farmers get better access to markets.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Our values</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Accessibility</p>
                <p className="text-sm text-muted-foreground">Our core marketplace features are free to use. Every farmer and buyer should have access to market information regardless of their size or resources.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Transparency</p>
                <p className="text-sm text-muted-foreground">We believe in open, honest pricing and clear information. Our price lists and agrochemical guides give you the data you need to make good decisions.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Community</p>
                <p className="text-sm text-muted-foreground">Agriculture thrives when people work together. Farmnport is a platform for the entire agricultural community — from the field to the market.</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Get in touch</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              We would love to hear from you. Whether you have a question, suggestion, or want to learn more about Farmnport, reach out to us:
            </p>
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <p><span className="font-semibold">Email:</span>{' '}<a href="mailto:sales@famnport.com" className="text-muted-foreground underline hover:text-foreground">sales@famnport.com</a></p>
              <p><span className="font-semibold">Location:</span>{' '}<span className="text-muted-foreground">Marondera, Zimbabwe</span></p>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
