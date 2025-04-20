import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "base-vue3-template",
  description: "免费、开源、快速",
  base:'/base-vue3-template-doc/',
  head: [
    ['link', { rel: 'icon', href: `/logo.svg` }],
  ],
  lang: 'zh-CN',
  lastUpdated: true,
  themeConfig: {
    lastUpdated: {
      text: '更新时间',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    logo: "/logo.svg", // 配置logo位置，public目录
    outline: [2, 6],
    outlineTitle: '目录',
    // 设置搜索框的样式
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    // search: {
    //   provider: 'local'
    // },
    nav: [
      { text: '首页', link: '/' },
      { text: '搭建指南', link: '/build' },
      { text: '操作/部署', link: '/operation' }
    ],
    sidebar: {
      "/build":[{
        text: '搭建指南',
        link: '/build/index.md',
        items: [
          { text: '创建项目', link: '/build/Create' },
          { text: '调整项目', link: '/build/Update' },
          { text: '配置 UnoCSS', link: '/build/UnoCSS' },
          { text: '配置代码规范', link: '/build/Specification' },
          { text: 'gzip 压缩', link: '/build/Gzip' },
          { text: '打包拆分 & 小图片转base64', link: '/build/BuildAssetsinlinelimit' },
          { text: '配置样式', link: '/build/Style' },
          { text: '自动引入', link: '/build/AutoImport' },
          { text: '配置环境变量', link: '/build/Env' },
          { text: '抽离组件', link: '/build/Extractions' },
          { text: '集成Axios', link: '/build/Axios' },
          { text: '代码提交检查', link: '/build/CodeCheck' },
        ]
      }],
      "/operation":[{
        text: '操作/部署',
        link: '/operation/index.md',
        items: [
          { text: '基础操作', link: '/operation/Basic' },
          { text: '部署', link: '/operation/Deployment' },
          { text: '更新', link: '/operation/Update' },
          { text: '环境变量', link: '/operation/Environment' },
          { text: '代码规范', link: '/operation/Specification' },
          { text: '代码提交检查', link: '/operation/CodeCheck'}
        ]
      }]
    },
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/letengzz' }
    ],
    footer: {
      message: '开发者笔记仓库',
      copyright: 'Copyright © 2024 Hjc'
    },
    docFooter: {
      prev: false,
      next: false
    },
  },
  markdown: {
    lineNumbers: true, //显示行号
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息',
    },
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  }
})
