import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

const PORT= process.env.PORT||5000;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{ //to avoid course errors! so just redirect to the given target if given "/api"
    proxy:{
      "/api":{
        target:`http://localhost:${PORT}`,
      }
    }
  }
})

