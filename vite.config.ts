import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: './',
  plugins: [preact()],
  // Only set by automated tests: swaps the cloud service for an in-browser fake.
  define: { __FAKE_BACKEND__: JSON.stringify(process.env.VITE_BACKEND === 'fake') },
});
