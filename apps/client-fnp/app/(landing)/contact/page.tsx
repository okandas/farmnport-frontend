export const metadata = {
  title: 'Contact Us | farmnport.com',
  description: 'Get in touch with the Farmnport team. We are based in Marondera, Zimbabwe and ready to help with any questions about our agricultural marketplace.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <main className="min-h-[70lvh] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-3">Contact Us</h1>
          <p className="text-base leading-7 text-muted-foreground">
            Have a question, suggestion, or need help? We are here for you. Reach out to the Farmnport team using any of the methods below.
          </p>
        </div>

        <div className="space-y-14">

          {/* Email */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Email us</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              For general enquiries, support, partnership opportunities, or feedback about our agricultural marketplace:
            </p>
            <div className="rounded-lg border p-4">
              <a href="mailto:sales@famnport.com" className="text-sm font-semibold underline hover:text-foreground">sales@famnport.com</a>
              <p className="text-sm text-muted-foreground mt-1">We aim to respond within 24–48 hours during business days.</p>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Our location</h2>
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <p><span className="font-semibold">Operated by:</span>{' '}<a href="https://bara.co.zw" target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline hover:text-foreground">BaRa</a></p>
              <p><span className="font-semibold">Location:</span>{' '}<span className="text-muted-foreground">Marondera, Zimbabwe</span></p>
            </div>
          </section>

          {/* How Can We Help */}
          <section>
            <h2 className="text-xl font-semibold mb-4">How can we help?</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">Our team can assist you with:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Account issues</p>
                <p className="text-sm text-muted-foreground">Trouble signing up, logging in, or managing your profile.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Marketplace questions</p>
                <p className="text-sm text-muted-foreground">How to list produce, find buyers, or browse market prices.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Agrochemical guides</p>
                <p className="text-sm text-muted-foreground">Questions about product information, dosage guides, or application instructions.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Technical support</p>
                <p className="text-sm text-muted-foreground">Reporting bugs or issues with the website.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Partnerships</p>
                <p className="text-sm text-muted-foreground">We welcome collaborations with agricultural organisations, cooperatives, and agribusinesses across Zimbabwe.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Feedback</p>
                <p className="text-sm text-muted-foreground">Suggestions on how we can improve the platform for farmers and buyers.</p>
              </div>
            </div>
          </section>

          {/* For Farmers and Buyers */}
          <section>
            <h2 className="text-xl font-semibold mb-4">For farmers and buyers</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              If you are a farmer looking to sell your produce or a buyer searching for reliable agricultural suppliers in Zimbabwe, Farmnport is free to join.{' '}
              <a href="/signup" className="underline hover:text-foreground">Create your account</a> to get started, or browse our{' '}
              <a href="/farmers" className="underline hover:text-foreground">farmer directory</a> and{' '}
              <a href="/buyers" className="underline hover:text-foreground">buyer directory</a> to see what is available.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
