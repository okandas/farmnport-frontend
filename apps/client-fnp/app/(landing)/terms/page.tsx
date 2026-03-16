export const metadata = {
  title: 'Terms of Service | farmnport.com',
  description: 'Read the Farmnport terms of service. Understand the rules and guidelines for using our agricultural marketplace in Zimbabwe.',
  alternates: {
    canonical: '/terms',
  },
}

const sections = [
  { id: 'acceptance', title: '1. Acceptance of terms' },
  { id: 'about-platform', title: '2. About our platform' },
  { id: 'user-accounts', title: '3. User accounts' },
  { id: 'user-conduct', title: '4. User conduct' },
  { id: 'marketplace-listings', title: '5. Marketplace listings' },
  { id: 'intellectual-property', title: '6. Intellectual property' },
  { id: 'third-party', title: '7. Third-party services' },
  { id: 'liability', title: '8. Limitation of liability' },
  { id: 'indemnification', title: '9. Indemnification' },
  { id: 'modifications', title: '10. Modifications to terms' },
  { id: 'governing-law', title: '11. Governing law' },
  { id: 'contact', title: '12. Contact us' },
]

export default function TermsOfServicePage() {
  return (
    <main className="min-h-[70lvh] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
        </div>

        {/* Intro */}
        <p className="text-base leading-7 text-muted-foreground mb-10">
          Welcome to Farmnport. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Farmnport website at farmnport.com and our agricultural marketplace platform, operated by BaRa, based in Marondera, Zimbabwe. By accessing or using our services, you agree to be bound by these Terms.
        </p>

        {/* Table of Contents */}
        <nav className="mb-14 rounded-lg border p-6">
          <p className="text-sm font-semibold mb-3">Contents</p>
          <ol className="space-y-1.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-14">

          {/* 1 */}
          <section id="acceptance">
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of terms</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              By creating an account, accessing, or using Farmnport, you confirm that you are at least 18 years old and agree to comply with these Terms. If you do not agree, you must not use our services.
            </p>
          </section>

          {/* 2 */}
          <section id="about-platform">
            <h2 className="text-xl font-semibold mb-4">2. About our platform</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              Farmnport is an online agricultural marketplace that connects farmers, buyers, exporters, and importers across Zimbabwe. Our platform enables users to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground mb-4">
              <li>List and discover agricultural produce for sale</li>
              <li>Browse current market prices from producers and buyers</li>
              <li>Access agrochemical product guides and information</li>
              <li>Connect directly with farmers and buyers</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              Farmnport acts solely as a platform to facilitate connections between agricultural market participants. We are not a party to any transactions between users.
            </p>
          </section>

          {/* 3 */}
          <section id="user-accounts">
            <h2 className="text-xl font-semibold mb-4">3. User accounts</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              To access certain features, you must register for an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorised use of your account</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in fraudulent activity.
            </p>
          </section>

          {/* 4 */}
          <section id="user-conduct">
            <h2 className="text-xl font-semibold mb-4">4. User conduct</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              When using Farmnport, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>Post false, misleading, or fraudulent information about produce, prices, or your identity</li>
              <li>Use the platform for any unlawful purpose</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Scrape, crawl, or use automated tools to extract data from our platform without permission</li>
              <li>Attempt to gain unauthorised access to our systems or other user accounts</li>
              <li>Interfere with the proper functioning of the website</li>
            </ul>
          </section>

          {/* 5 */}
          <section id="marketplace-listings">
            <h2 className="text-xl font-semibold mb-4">5. Marketplace listings</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              Users who list products or publish price lists on Farmnport are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground mb-4">
              <li>Ensuring all information is accurate and up to date</li>
              <li>Complying with all applicable Zimbabwean laws regarding the sale of agricultural produce and agrochemicals</li>
              <li>Honouring commitments made to other users through the platform</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              Farmnport does not verify, endorse, or guarantee the accuracy of any user-submitted listings, profiles, or price information.
            </p>
          </section>

          {/* 6 */}
          <section id="intellectual-property">
            <h2 className="text-xl font-semibold mb-4">6. Intellectual property</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              All content on Farmnport, including text, graphics, logos, images, and software, is the property of BaRa or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without prior written consent.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              By submitting content to Farmnport (such as listings, profile information, or reviews), you grant us a non-exclusive, royalty-free licence to use, display, and distribute that content on our platform.
            </p>
          </section>

          {/* 7 */}
          <section id="third-party">
            <h2 className="text-xl font-semibold mb-4">7. Third-party services</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Our website may contain links to third-party websites or services. We do not control and are not responsible for the content, privacy policies, or practices of any third-party sites. This includes advertisements served through Google AdSense.
            </p>
          </section>

          {/* 8 */}
          <section id="liability">
            <h2 className="text-xl font-semibold mb-4">8. Limitation of liability</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              To the fullest extent permitted by law, Farmnport and BaRa shall not be liable for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground mb-4">
              <li>Any indirect, incidental, special, or consequential damages arising from your use of the platform</li>
              <li>Any loss or damage resulting from transactions between users</li>
              <li>Any inaccuracies in user-submitted content, including produce listings, prices, or agrochemical information</li>
              <li>Any interruption, suspension, or termination of our services</li>
            </ul>
            <p className="text-sm leading-6 text-muted-foreground">
              Farmnport is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We make no warranties, express or implied, regarding the reliability, accuracy, or availability of our services.
            </p>
          </section>

          {/* 9 */}
          <section id="indemnification">
            <h2 className="text-xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              You agree to indemnify and hold harmless BaRa, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of Farmnport or violation of these Terms.
            </p>
          </section>

          {/* 10 */}
          <section id="modifications">
            <h2 className="text-xl font-semibold mb-4">10. Modifications to terms</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of Farmnport after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 11 */}
          <section id="governing-law">
            <h2 className="text-xl font-semibold mb-4">11. Governing law</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              These Terms are governed by and construed in accordance with the laws of Zimbabwe. Any disputes arising from these Terms or your use of Farmnport shall be subject to the jurisdiction of the courts of Zimbabwe.
            </p>
          </section>

          {/* 12 */}
          <section id="contact">
            <h2 className="text-xl font-semibold mb-4">12. Contact us</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <p><span className="font-semibold">Email:</span>{' '}<a href="mailto:sales@famnport.com" className="text-muted-foreground underline hover:text-foreground">sales@famnport.com</a></p>
              <p><span className="font-semibold">Location:</span>{' '}<span className="text-muted-foreground">Marondera, Zimbabwe</span></p>
              <p><span className="font-semibold">Operated by:</span>{' '}<span className="text-muted-foreground">BaRa</span></p>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
