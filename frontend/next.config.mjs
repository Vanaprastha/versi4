/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Abaikan error TypeScript saat build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Abaikan error ESLint saat build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
