/** @type {import('next').NextConfig} */
const appBaseUrlPath = (process.env.APP_BASE_URL_PATH || "").replace(/\/+$/, "");

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  ...(appBaseUrlPath
    ? {
        basePath: appBaseUrlPath,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
