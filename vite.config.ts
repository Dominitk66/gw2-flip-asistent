import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `base` je dôležité pre GitHub Pages: stránka tam beží na adrese
// https://<uzivatel>.github.io/<repo>/, takže build musí poznať podpriečinok.
// Lokálne (dev) aj v testoch je '/'. Pri nasadení na Pages nastaví workflow
// premennú VITE_BASE=/gw2-flip-asistent/.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
