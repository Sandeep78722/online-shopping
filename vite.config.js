import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/online-shopping/',  // <-- This is important! Use your repo name here.
  plugins: [react()],
})
