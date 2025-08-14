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
  // Remove external redirects to prevent CORS preflight issues
  // External redirects will be handled client-side to avoid prefetch problems
};

export default nextConfig;
