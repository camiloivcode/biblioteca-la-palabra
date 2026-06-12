import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(
        process.env.PUBLIC_API_URL || 'http://localhost:4000/api'
      ),
    },
  },
});
