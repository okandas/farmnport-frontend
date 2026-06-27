/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
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
