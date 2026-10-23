import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
  ssr: true,
  presets: process.env.VERCEL === '1' ? [vercelPreset()] : [],
} satisfies Config;
