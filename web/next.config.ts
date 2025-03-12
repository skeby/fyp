import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/data-structures",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
