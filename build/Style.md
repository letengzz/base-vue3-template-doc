# 配置样式

添加全局变量样式：

```scss [src/styles/variables.scss]
// 全局变量样式
// 定义变量
$primary-color: #409eff;
$danger-color: #f56c6c;
$text-color: #333;
$background-color: #fff;
$border-color: #ebeef5;
$shadow-color: rgb(0 0 0 / 10%);
```

添加全局scss函数：

```scss [src/styles/mixin.scss]
// 全局scss函数

@mixin wh($w, $h) {
  width: $w + px;
  height: $h + px;
}

@mixin border-radius($radius) {
  border-radius: $radius;
}

@mixin box-shadow($x, $y, $blur, $color) {
  box-shadow: $x $y $blur $color;
}
```

添加全局样式：

```scss [src/styles/index.scss]
// 全局样式
html,
body {
  padding: 0;
  margin: 0;
}

#app {
  height: 100vh;
}
```

在vite.config.ts配置全局：

```typescript [vite.config.ts]
// https://vite.dev/config/
export default defineConfig({
  // ...
  css: {
      // 预加载
      preprocessorOptions: {
        // 全局样式变量预注入
        scss: {
          api: 'modern-compiler', // or "modern", "legacy"
          additionalData: `
            @use "@/styles/variables.scss" as *;
            @use "@/styles/mixin.scss" as *;
          `,
          globalVars: {
            'theme-color': env.VITE_APP_THEME_COLOR,
            'split-line': '#ECEFF8',
          },
        },
      },
    },
})
```

在main.ts中配置：

```typescript [main.ts]
// 引入全局样式
import '@/styles/index.scss'
```

