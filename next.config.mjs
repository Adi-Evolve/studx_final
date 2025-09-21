/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers configuration
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://unpkg.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: http: https://maps.googleapis.com https://maps.gstatic.com",
              "connect-src 'self' https://vdpmumstdxgftaaxeacx.supabase.co https://api.razorpay.com https://api.imgbb.com https://maps.googleapis.com",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: 'StudX_Production_Ready',
  },

  // Image optimization for security
  images: {
    domains: [
      'i.ibb.co', // ImgBB image hosting
      'vdpmumstdxgftaaxeacx.supabase.co', // Supabase storage
      'ui-avatars.com' // Avatar service
    ],
    dangerouslyAllowSVG: false, // Security: Disable SVG for safety
  },

  // Security: Disable X-Powered-By header
  poweredByHeader: false,

  // Optimize for production
  swcMinify: true,
  compress: true,

  // Security: Force HTTPS in production
  async redirects() {
    return process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/(.*)',
            has: [
              {
                type: 'header',
                key: 'x-forwarded-proto',
                value: 'http',
              },
            ],
            destination: 'https://studxchange.vercel.app/:path*',
            permanent: true,
          },
        ]
      : [];
  },

  // Webpack configuration for security
  webpack: (config, { dev, isServer }) => {
    // Security: Remove source maps in production
    if (!dev) {
      config.devtool = false;
    }

    // Security: Add additional optimizations
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };

    return config;
  },

  // Experimental features for security
  experimental: {
    // Security: Enable app directory
    appDir: true,
    // Security: Strict mode
    strictMode: true,
  },

  // Output configuration
  output: 'standalone', // For containerized deployments

  // Security: Configure allowed external domains
  async rewrites() {
    return [
      // Block access to sensitive paths
      {
        source: '/admin/:path*',
        destination: '/login', // Redirect admin access to login
      },
    ];
  },
};

export default nextConfig;
