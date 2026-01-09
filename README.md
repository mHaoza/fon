# Fon - Focus On Now

Fon 是一个自用的待办事项(Todo List)应用程序，基于 Tauri2 + Vue 3 + TypeScript 开发。应用名称 "Fon" 代表 "Focus On Now"。

## 功能特点

- [x] 🚀 轻量级桌面应用
- [x] 💡 简洁直观的用户界面
- [x] 💾 本地数据存储
- [x] 📅 基于Tag的分类管理

## TODO

- [x] scrollbar样式调整
- [x] 完成图片上传功能，图片现在未base64，参考原本上传方法，修改当前图片上传
- [x] 双击可调用系统图片功能打开图片
- [ ] 完成附件上传功能
  - [ ] 根据渲染成成附件样式
    - 鼠标右键出现菜单，可选择打开文件（调用系统api），打开文件所在目录、
- [ ] 图片/附件支持拖拽，附件应当为本地文件地址，如果是远程地址，应正常渲染成链接
- [x] markdown taskList 样式调整
- [x] markdown table支持
- [x] link手动输入的，不会渲染，刷新才渲染
- [x] emoji插入时渲染，但刷新之后，显示为字符，而不是表情包（同理手动输入不生效）
- [ ] 快捷键 esc隐藏窗口

## 技术栈

- [Rust](https://www.rust-lang.org/) - 系统级编程语言，用于开发桌面应用后端
- [Tauri2](https://tauri.app/) - 构建轻量级、安全的跨平台桌面应用
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架

## 开发环境要求

- Node.js (推荐 v20 或更高版本)
- Rust (最新稳定版)
- 系统要求参考 [Tauri 先决条件](https://tauri.app/v1/guides/getting-started/prerequisites)
