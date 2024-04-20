/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["shiki", "vscode-oniguruma"],
  },
};

export default nextConfig;
