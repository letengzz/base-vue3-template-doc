# 打包拆分 & 小图片转base64

官网：https://cn.vitejs.dev/config/build-options.html#build-assetsinlinelimit

vite.config.ts配置：

```typescript [vite.config.ts]
// https://vite.dev/config/
export default defineConfig({
  build: {
    // 10kb以下 转Base64
    assetsInlineLimit: 1024 * 10,
    // chunkSizeWarningLimit:1500, //配置文件大小提醒限制 默认为500
    rollupOptions: {
      output: {
        // 每个node_modules下的文件单独打包
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // return 'vendor' //第三方依赖合并在一起
            // 抽离第三方依赖
            // return id.toString().split('node_modules/.pnpm/')[1].split('/')[0].toString()
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
          return undefined
        },
        // 用于从入口点创建的块的打包输出格式[name]表示文件名，[hash]表示该文件hash值
        entryFileNames: 'assets/js/[name].[hash].js', // 用于命名代码拆分时创建的共享的输出命名
        chunkFileNames: 'assets/js/[name].[hash].js', // 用于输出静态资源的命名，[ext]表示文件拓展名
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
      },
    },
  },
  // ...
})
```