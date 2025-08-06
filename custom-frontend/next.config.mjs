/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "via.placeholder.com" },
      { hostname: process.env.IMAGE_HOSTNAME || "localhost" }
    ],
  },
  pageExtensions: ["ts", "tsx"],
  async redirects() {
    // Return empty array since we're no longer using API-based redirects
    return [];
  },
};

export default nextConfig;
