# 抽离组件

官网：https://cn.vitejs.dev/config/#conditional-config

vite.config.ts 抽离出插件，打包配置 server 配置等复杂配置。

调整 tsconfig.node.json：

```json [tsconfig.node.json]
{
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",

    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"],
    "noEmit": true
  },
  "include": [
    "vite.config.*",
    "vitest.config.*",
    "cypress.config.*",
    "nightwatch.conf.*",
    "playwright.config.*",
    "eslint.config.*",
    "types",
    "build" // [!code highlight]
  ]
}
```

调整 tsconfig.app.json：

```json [tsconfig.app.json]
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "#/*": ["./types/*"]
    },
    "noUnusedParameters": true
  },
  "include": ["build", "types", "src/**/*", "src/**/*.vue"],  // [!code highlight]
  "exclude": ["src/**/__tests__/*"]
}
```

```typescript [types/import-meta.d.ts]
interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ViteEnv {
  VITE_APP_THEME_COLOR: string
  VITE_BASE_URL: string
  VITE_BASE_TARGET_URL: string
  VITE_VISUALIZER_OPEN: boolean
  VITE_BUILD_GZIP: boolean
  VITE_BUILD_VENDOR: boolean
  VITE_PROXY: any
  VITE_PORT: number
}

interface ImportMetaEnv extends ViteEnv {
  __: unknown
}
```

```typescript [build/utils.ts]
/* eslint-disable */
// Read all environment variable configuration files to process.env
export function wrapperEnv(envConf: any) {
  const ret: any = {}

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n')
    realName =
      realName === 'true' ? true : realName === 'false' ? false : realName

    if (envName === 'VITE_PORT') {
      realName = Number(realName)
    }
    if (envName === 'VITE_PROXY' && realName) {
      try {
        realName = JSON.parse(realName.replace(/'/g, '"'))
      } catch (error) {
        realName = ''
      }
    }
    ret[envName] = realName
    if (typeof realName === 'string') {
      process.env[envName] = realName
    } else if (typeof realName === 'object') {
      process.env[envName] = JSON.stringify(realName)
    }
  }
  return ret
}
```

```typescript [build/build.ts]
const useViteBuild = (viteEnv: ViteEnv) => {
  const { VITE_BUILD_VENDOR } = viteEnv

  return {
    // 10kb以下，转Base64
    assetsInlineLimit: 1024 * 10,
    // chunkSizeWarningLimit: 1500,//配置文件大小提醒限制，默认500
    rollupOptions: {
      output: {
        // 每个node_modules模块分成一个js文件
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // return 'vendor'
            return VITE_BUILD_VENDOR
              ? 'vendor'
              : id.toString().split('node_modules/')[2].split('/')[0].toString()
          }
          // return 'vendor'
        },
        // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
        entryFileNames: 'assets/js/[name].[hash].js', // 用于命名代码拆分时创建的共享块的输出命名
        chunkFileNames: 'assets/js/[name].[hash].js', // 用于输出静态资源的命名，[ext]表示文件扩展名
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]'
      }
    }
  }
}

export default useViteBuild
```

```typescript [build/server.ts]
// 服务器选项
import useProxy from './proxy'

export function useServer(viteEnv: ViteEnv) {
  return {
    // 监听所有公共ip
    host: '0.0.0.0',
    // cors: true,
    hmr: true,
    port: viteEnv.VITE_PORT,
    proxy: useProxy(viteEnv.VITE_PROXY),
    // 提前转换和缓存文件以进行预热。可以在服务器启动时提高初始页面加载速度，并防止转换瀑布。
    warmup: {
      // 请注意，只应该预热频繁使用的文件，以免在启动时过载 Vite 开发服务器
      // 可以通过运行 npx vite --debug transform 并检查日志来找到频繁使用的文件
      clientFiles: ['./index.html', './src/{components,api}/*']
    }
  }
}
```

```typescript [build/proxy.ts]
/**
 * Used to parse the .env.development proxy configuration
 */
import type { ProxyOptions } from 'vite'

type ProxyItem = [string, string]

type ProxyList = ProxyItem[]

type ProxyTargetList = Record<string, ProxyOptions>

const httpsRE = /^https:\/\//

/**
 * Generate proxy
 * @param list
 */
export default function useProxy(list: ProxyList = []) {
  const ret: ProxyTargetList = {}
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target)
    // https://github.com/http-party/node-http-proxy#options
    ret[prefix] = {
      target,
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(new RegExp(`^${prefix}`), '/api'),
      // https is require secure=false
      ...(isHttps ? { secure: false } : {})
    }
  }
  return ret
}
```

在 build 下新建 plugins 文件夹，新建文件：

- 抽离自动导入：

  ```typescript [build/plugins/autoImport.ts]
  // 此插件用于自动导入API和组件
  // 可以减少手动import语句，提高开发效率，并提供类型提示
  import AutoImport from 'unplugin-auto-import/vite'
  // import { ElementPlusResolver, AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
  // import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
  
  /**
   * 配置自动导入功能
   * 支持Vue、Vue Router、Pinia等框架API的自动导入
   * 支持Ant Design Vue组件的自动导入
   * 自动导入src/api和src/utils目录下的函数
   * @returns Vite插件配置
   */
  const useAutoImport = () => {
    return AutoImport({
      resolvers: [
        //   ElementPlusResolver(), // 自动导入Element Plus组件
        //   AntDesignVueResolver(), // 自动导入Ant Design Vue组件
        //   TDesignResolver({
        //     library: 'vue-next',
        //   }),
      ],
      imports: [
        'vue', // 自动导入Vue核心API
        'vue-router', // 自动导入Vue Router API
        'pinia' // 自动导入Pinia API
        //   '@vueuse/core', // 自动导入VueUse工具函数
        //   {
        //     'vue-request': ['useRequest', 'usePagination'], // 自动导入vue-request的特定函数
        //     // 'dayjs': [['default', 'dayjs']],
        //   },
      ],
      dts: './types/auto-imports.d.ts', // 生成类型声明文件的路径
      dirs: ['src/api/backend/**/*.ts', 'src/utils/**/*.ts'] // 自动导入项目中自定义的API和工具函数
    })
  }
  
  export default useAutoImport
  ```
  
- 抽离代码检查：

  ```typescript [build/plugins/checker.ts]
  // vite.config.ts
  import checker from 'vite-plugin-checker'
  /**
   * vite-plugin-checker 配置
   * 用于在开发环境下进行代码检查
   *
   * @returns {import('vite-plugin-checker').default} checker插件实例
   *
   * 配置说明:
   * - eslint: ESLint配置
   *   - useFlatConfig: 使用扁平配置
   *   - lintCommand: 检查命令
   *   - dev.logLevel: 开发环境日志级别
   * - overlay: 错误覆盖层配置
   *   - initialIsOpen: 初始是否打开
   */
  
  export default function configChecker() {
    return checker({
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx,vue}"',
        dev: {
          logLevel: ['error']
        }
      },
      overlay: {
        initialIsOpen: true
      }
    })
  }
  ```
  
- 抽离组件：

  ```typescript [build/plugins/component.ts]
  // import { ElementPlusResolver, AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
  // import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
  import Components from 'unplugin-vue-components/vite'
  
  /**
   * 自动注册Vue组件的插件配置
   * 该插件可以自动导入组件，无需手动import
   * 提高开发效率并减少样板代码
   */
  const useComponents = () => {
    return Components({
      resolvers: [
        //   ElementPlusResolver(), // Element Plus组件库解析器（已禁用）
        //   AntDesignVueResolver({
        //     resolveIcons: true, // 自动导入图标组件
        //     importStyle: false, // 不导入CSS，使用CSS-in-JS方式
        //   }),
      ],
      dts: './types/components.d.ts' // 生成组件类型声明文件的路径
    })
  }
  
  export default useComponents
  ```
  
- 抽离压缩：

  ```typescript [build/plugins/compress.ts]
  import viteCompression from 'vite-plugin-compression'
  /**
   *  开启gzip压缩
   */
  const useCompress = () => {
    return viteCompression({
      verbose: true, // 默认即可
      disable: false, // 开启压缩(不禁用)，默认即可
      deleteOriginFile: false, // 删除源文件
      threshold: 10240, // 压缩前最小文件大小
      algorithm: 'gzip', // 压缩算法
      ext: '.gz' // 文件类型
    })
  }
  
  export default useCompress
  ```
  
- 抽离 DevTools：

  ```typescript [build/plugins/devTools.ts]
  import VueDevTools from 'vite-plugin-vue-devtools'
  /**
   *  开启DevTools
   */
  const useVueDevTools = () => {
    return VueDevTools({
      componentInspector: {
        // 如果是windows 'control-shift' , 如果是macOS 'meta-shift'
        toggleComboKey: 'control-shift'
      }
    })
  }
  
  export default useVueDevTools
  ```

```typescript [vite.config.ts]
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// 自动引入样式
import useViteBuild from './build/build'
import useVitePlugins from './build/plugins'
import { useServer } from './build/server'
import { wrapperEnv } from './build/utils'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 模式
  const isBuild = command === 'build'
  // 获取当前文件夹地址 current working directory
  const root = process.cwd()
  // 读取包含VITE_开头的环境变量
  const env = loadEnv(mode, root)
  // 环境变量值转换
  const viteEnv = wrapperEnv(env)
  return {
    base: env.VITE_BUILD_URL || '/',
    plugins: useVitePlugins(isBuild, viteEnv),
    build: useViteBuild(viteEnv),
    server: useServer(viteEnv),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '#': fileURLToPath(new URL('./types', import.meta.url))
      }
    },
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
            'split-line': '#ECEFF8'
          }
        }
      }
    }
  }
})
```

