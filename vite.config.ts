import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.AIzaSyD5Y4X2ewqADYFvArr9YObtLQQTssEEZuc),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.AIzaSyD5Y4X2ewqADYFvArr9YObtLQQTssEEZuc)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      base: './'
    };
});
