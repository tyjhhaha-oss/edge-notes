/** @type {import('next').NextConfig} */
const nextConfig = {
  // 解决本地 Wrangler 代理的跨域问题
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // 配置用于 Cloudflare Pages
  output: 'standalone',
}

export default nextConfig