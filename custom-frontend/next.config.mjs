/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "via.placeholder.com" },
      { hostname: "cdn.worldvectorlogo.com" },
      { hostname: "seeklogo.com" },
      { hostname: "logos-world.net" },
      { hostname: "upload.wikimedia.org" },
      { hostname: process.env.IMAGE_HOSTNAME || "localhost" }
    ],
  },
  pageExtensions: ["ts", "tsx"],
  async redirects() {
    return [
      {
        source: '/:locale/dashboard/:path*',
        destination: `${process.env.DASHBOARD_URL || 'http://localhost:3001'}/dashboard/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: '/:locale/dashboard',
        destination: `${process.env.DASHBOARD_URL || 'http://localhost:3001'}/dashboard/default`,
        permanent: false,
        basePath: false,
      },
      {
        source: '/dashboard/:path*',
        destination: `${process.env.DASHBOARD_URL || 'http://localhost:3001'}/dashboard/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: '/dashboard',
        destination: `${process.env.DASHBOARD_URL || 'http://localhost:3001'}/dashboard/default`,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
