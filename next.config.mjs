/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  headers: [
    {
      key: 'Access-Control-Allow-Origin',
      value: '*',
    },
  ],
};

export default nextConfig;
