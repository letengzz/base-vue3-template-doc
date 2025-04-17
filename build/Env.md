# 配置环境变量

在根目录新建.env开头的文件

- .env 所有环境默认加载

  ```[.env]
  # 新增端口 防止默认端口5173被占用
  VITE_PORT = 3600
  
  VITE_APP_TITLE = 'base-vue3-template'
  ```

- .env.development 开发环境默认加载

  ```[.env.development]
  VITE_BASE_URL = ''
  
  # 本地开发代理，可以解决跨域及多地址代理
  # 如果接口地址匹配到，则会转发到http://localhost:8080，防止本地出现跨域问题
  # 可以有多个，注意多个不能换行，否则代理将会失效
  VITE_PROXY = [["/api","http://localhost:3000"]]
  # VITE_PROXY = [["/api","http://192.168.20.33:8090"]]
  ```

- .env.production 生产环境默认加载

  ```[.env.production]
  VITE_BASE_URL = '/api'
  
  # 部署线上 第三方库合并为vendor.js
  VITE_BUILD_VENDOR = true
  
  # 部署线上 压缩gzip
  VITE_BUILD_GZIP = true
  ```

  
