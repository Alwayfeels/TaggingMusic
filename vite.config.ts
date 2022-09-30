import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false, //自动打开 
    base: "./", //生产环境路径
    proxy: { // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
      // 正则表达式写法
      '^/music': {
        target: 'http://43.143.12.132:8888/', // 后端服务实际地址
        // target: 'http://localhost:3000/', // 本地测试
        changeOrigin: true, //开启代理
        rewrite: (path) => path.replace(/^\/music/, '')
      },
      '^/store': {
        // target: 'http://43.143.12.132:8889/', // 后端服务实际地址
        target: 'http://127.0.0.1:8889/', // 本地测试
        changeOrigin: true, //开启代理  
        rewrite: (path) => path.replace(/^\/store/, '')
      }
    }
  }
  // test: {
  //   global: true,
  // }
})
