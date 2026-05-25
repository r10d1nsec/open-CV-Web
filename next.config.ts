import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
};

// Sentry envuelve la config. Sin SENTRY_AUTH_TOKEN no sube source maps (ok).
export default withSentryConfig(config, {
  silent: true,
});
