/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: ['slide.smkn1abang.sch.id', 'www.slide.smkn1abang.sch.id'],
    },
  },
};

export default nextConfig;
