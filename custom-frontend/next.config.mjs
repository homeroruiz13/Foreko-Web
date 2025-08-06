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
    // Return empty array since we're no longer using API-based redirects
    return [];
  },
};

export default nextConfig;
