/** @type {import('next').NextConfig} */
const nextConfig = {
    // strict mode is usually good
    // strict mode is usually good
    reactStrictMode: true,
    // Disable SWC minification to save memory on shared hosting
    swcMinify: false,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
