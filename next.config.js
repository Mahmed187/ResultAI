/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@tabler/icons-react', 'lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
  typescript: {
    // Skip type checking during build for faster builds (optional)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Skip ESLint during build for faster builds (optional)
    ignoreDuringBuilds: false,
  },
  // Modern bundling optimizations
  modularizeImports: {
    '@tabler/icons-react': {
      transform: '@tabler/icons-react/dist/esm/icons/{{member}}',
    },
  },
  // Transpile packages for better performance
  transpilePackages: ['@tabler/icons-react'],
}

module.exports = nextConfig 