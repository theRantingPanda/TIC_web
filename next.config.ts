import type { NextConfig } from 'next'

/**
 * Static export. This deploys to Render as a Static Site, which means a number of
 * Next features are unavailable by design:
 *
 *   - `redirects()` / `rewrites()` / `headers()` silently do nothing (build warning
 *     only). Every redirect lives in `render.yaml` instead — see that file.
 *   - No route handlers, no middleware, no Server Actions.
 *   - The default image loader throws, so `images.unoptimized` is required. Intrinsic
 *     dimensions are recorded during the asset pull (`scripts/pull-assets.ts`) and
 *     carried in the capture JSON so images can be pre-sized and avoid layout shift.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  typedRoutes: false,
}

export default nextConfig
