import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `base` je dôležité pre GitHub Pages: stránka tam beží na adrese
// https://<uzivatel>.github.io/<repo>/, takže build musí poznať podpriečinok.
// Lokálne (dev) aj v testoch necháme '/'. Skutočnú hodnotu pre Pages nastavíme
// vo Fáze 2 cez build prostredie. Default '/' aby build fungoval všade.
export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
