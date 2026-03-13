/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.farmnport.com',
        port: '',
        pathname: '/images/**'
      },
      {
        protocol: 'https',
        hostname: 'images.farmnport.com',
        port: '',
        pathname: '/logos/**'
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**'
      },
    ],
  },
}

module.exports = nextConfig

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs")

module.exports = withSentryConfig(module.exports, {
  org: "pajecha",
  project: "frontend-v3",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
})
