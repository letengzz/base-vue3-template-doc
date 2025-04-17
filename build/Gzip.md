# gzip 压缩

安装：

```[pnpm]
pnpm i vite-plugin-compression -D
```

vite.config.ts 配置：

```typescript [vite.config.ts]
// gzip压缩
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // ...
    viteCompression({
      verbose: true, // 默认即可
      disable: false, // 开启压缩(不禁用)，默认即可
      deleteOriginFile: false, // 删除源文件
      threshold: 10240, // 压缩阈值，以字节为单位。如果一个资源比这个值小，它就不会被压缩。默认是 10240
      algorithm: 'gzip', // 压缩算法，默认是 gzip
      ext: '.gz' // 文件类型，默认是 .gz
    })
  ]
})
```

