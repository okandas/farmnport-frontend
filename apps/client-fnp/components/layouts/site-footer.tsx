import Link from "next/link"

export function SiteFooter() {

    const currentYear = new Date().getFullYear();

    return (
        <footer className="">
            <div className="mx-auto max-w-7xl sm:px-6 py-12 md:flex md:items-center md:justify-between">
                <nav className="flex justify-center space-x-6 md:order-2">
                    <Link href="/about" className="text-xs leading-5 text-muted-foreground hover:text-foreground">
                        About
                    </Link>
                    <Link href="/contact" className="text-xs leading-5 text-muted-foreground hover:text-foreground">
                        Contact
                    </Link>
                    <Link href="/privacy" className="text-xs leading-5 text-muted-foreground hover:text-foreground">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-xs leading-5 text-muted-foreground hover:text-foreground">
                        Terms of Service
                    </Link>
                </nav>
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-xs leading-5 text-muted-foreground">
                        &copy; {currentYear} <Link href="https://bara.co.zw">BaRa</Link>, Made In Marondera - Zimbabwe. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
