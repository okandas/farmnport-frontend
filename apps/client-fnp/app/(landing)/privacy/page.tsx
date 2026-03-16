export const metadata = {
  title: 'Privacy Policy | farmnport.com',
  description: 'Read the Farmnport privacy policy. Learn how we collect, use, and protect your personal information on our agricultural marketplace.',
  alternates: {
    canonical: '/privacy',
  },
}

const sections = [
  { id: 'information-we-collect', title: '1. Information we collect' },
  { id: 'how-we-use', title: '2. How we use your information' },
  { id: 'cookies', title: '3. Cookies and tracking technologies' },
  { id: 'third-party-advertising', title: '4. Third-party advertising' },
  { id: 'sharing', title: '5. How we share your information' },
  { id: 'data-security', title: '6. Data security' },
  { id: 'your-rights', title: '7. Your rights' },
  { id: 'childrens-privacy', title: '8. Children\u2019s privacy' },
  { id: 'changes', title: '9. Changes to this policy' },
  { id: 'contact', title: '10. Contact us' },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-[70lvh] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
        </div>

        {/* Intro */}
        <p className="text-base leading-7 text-muted-foreground mb-10">
          Farmnport (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is operated by BaRa, based in Marondera, Zimbabwe. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit farmnport.com and use our agricultural marketplace platform.
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
          <section id="information-we-collect">
            <h2 className="text-xl font-semibold mb-4">1. Information we collect</h2>

            <h3 className="text-base font-semibold mb-2">a. Personal information you provide</h3>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              When you register an account or use our services, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground mb-6">
              <li>Full name and contact details (email address, phone number)</li>
              <li>Business information (farm name, location, products you buy or sell)</li>
              <li>Account credentials (email and password)</li>
              <li>Profile information you choose to share publicly (produce listings, pricing)</li>
            </ul>

            <h3 className="text-base font-semibold mb-2">b. Information collected automatically</h3>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              When you access our website, we automatically collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>Device and browser type</li>
              <li>IP address and approximate location</li>
              <li>Pages visited, time spent on pages, and navigation paths</li>
              <li>Referring website or source</li>
            </ul>
          </section>

          {/* 2 */}
          <section id="how-we-use">
            <h2 className="text-xl font-semibold mb-4">2. How we use your information</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>Provide, operate, and maintain our marketplace platform</li>
              <li>Connect farmers with buyers across Zimbabwe</li>
              <li>Process your account registration and manage your profile</li>
              <li>Send you updates about the platform, market prices, and relevant agricultural information</li>
              <li>Improve our website, services, and user experience</li>
              <li>Respond to your enquiries and provide customer support</li>
              <li>Detect and prevent fraud or unauthorised access</li>
            </ul>
          </section>

          {/* 3 */}
          <section id="cookies">
            <h2 className="text-xl font-semibold mb-4">3. Cookies and tracking technologies</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our website.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Essential cookies</p>
                <p className="text-sm text-muted-foreground">Required for the website to function, such as authentication and session management.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Analytics cookies</p>
                <p className="text-sm text-muted-foreground">We use Google Analytics (GA4) to understand how visitors interact with our website. This helps us improve our content and services.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Advertising cookies</p>
                <p className="text-sm text-muted-foreground">
                  We use Google AdSense to display relevant advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalised advertising by visiting{' '}
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Ads Settings</a>.
                </p>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section id="third-party-advertising">
            <h2 className="text-xl font-semibold mb-4">4. Third-party advertising</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              We use Google AdSense to serve advertisements on our website. Third-party vendors, including Google, use cookies to serve ads based on your prior visits. Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              You may opt out of personalised advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Ads Settings</a> or{' '}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">www.aboutads.info</a>.
            </p>
          </section>

          {/* 5 */}
          <section id="sharing">
            <h2 className="text-xl font-semibold mb-4">5. How we share your information</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              We do not sell your personal information. We may share your information with:
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Other users</p>
                <p className="text-sm text-muted-foreground">Your public profile information (name, location, produce listings) is visible to other marketplace users to facilitate trade.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Service providers</p>
                <p className="text-sm text-muted-foreground">We work with trusted third parties who assist us in operating our website, including hosting, analytics, and email services.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold mb-1">Legal requirements</p>
                <p className="text-sm text-muted-foreground">We may disclose your information if required by law or in response to valid legal processes.</p>
              </div>
            </div>
          </section>

          {/* 6 */}
          <section id="data-security">
            <h2 className="text-xl font-semibold mb-4">6. Data security</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We implement appropriate technical and organisational security measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          {/* 7 */}
          <section id="your-rights">
            <h2 className="text-xl font-semibold mb-4">7. Your rights</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and personal data</li>
              <li>Withdraw consent for marketing communications at any time</li>
              <li>Object to the processing of your personal data</li>
            </ul>
          </section>

          {/* 8 */}
          <section id="childrens-privacy">
            <h2 className="text-xl font-semibold mb-4">8. Children&apos;s privacy</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us immediately.
            </p>
          </section>

          {/* 9 */}
          <section id="changes">
            <h2 className="text-xl font-semibold mb-4">9. Changes to this policy</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date. We encourage you to review this page periodically.
            </p>
          </section>

          {/* 10 */}
          <section id="contact">
            <h2 className="text-xl font-semibold mb-4">10. Contact us</h2>
            <p className="text-sm leading-6 text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
