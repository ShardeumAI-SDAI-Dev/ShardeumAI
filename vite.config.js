import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: ['@supabase/supabase-js']
  }
})
