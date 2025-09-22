# Fon - Focus On Now

Fon 是一个自用的待办事项(Todo List)应用程序，基于 Tauri2 + Vue 3 + TypeScript 开发。应用名称 "Fon" 代表 "Focus On Now"。

## 功能特点

- [ ] 🚀 轻量级桌面应用，性能出众
- [ ] 💡 简洁直观的用户界面
- [ ] 📝 待办事项管理
- [ ] 🎯 任务优先级设置
- [ ] 🔔 任务提醒功能
- [x] 💾 本地数据存储
- [ ] 📅 基于Tag的分类管理

## 技术栈
- [Rust](https://www.rust-lang.org/) - 系统级编程语言，用于开发桌面应用后端
- [Tauri2](https://tauri.app/) - 构建轻量级、安全的跨平台桌面应用
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加静态类型
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

## 开发环境要求

- Node.js (推荐 v16 或更高版本)
- Rust (最新稳定版)
- 系统要求参考 [Tauri 先决条件](https://tauri.app/v1/guides/getting-started/prerequisites)

## filter功能
**1. 全局状态**
根据`router path`来显示不同的列表
如：
`/main/task/#all`: 显示所有任务列表（不包含已删除）
`/main/task/#today`: 显示今天的任务列表
`/main/task/#tomorrow`: 显示明天的任务列表
`/main/task/#week`: 显示本周的任务列表
`/main/task/#tag/tagName`: 显示标签列表
`/main/task/#deleted`: 显示已删除的任务列表

根据对应path，匹配对应的参数 template 和 query，进行渲染
正则匹配path，根据参数渲染对应模板
```js
const list = [
  {
    title: '所有',
    reg: /^#all$/,
    template: ViewTemplateNormal,
    query: route => ({})
  },
  {
    title: route => `#${route.hash.split('/')[1]}`,
    reg: /^#tag\/(.*)$/,
    template: ViewTemplateNormal,
    query: (route) => { tags: [`#${route.hash.split('/')[1]}`] }
  },
]
```
**2. 列表模板**
`ViewTemplateNormal` 显示普通任务列表， 提供正常todo的增删改查功能
`ViewTemplateDeleted` 显示已删除列表 提供恢复/永久删除功能

**3. 列表**
- undone: 未完成的任务
- done: 已完成的任务
- deleted: 已删除的任务
``` js
// 通过useTodoList获取，数据结构如下, 默认不刷新，监听到activeTab变化时刷新
// const { list, refresh, loadMore } = useTodoList(...)
const todos = {
  undone: useTodoList(),
  done: useTodoList(),
  deleted: useTodoList()
}
```
