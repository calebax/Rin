<div align="center">

<div style="margin: 20px 0;">
  <img src="./src-tauri/icons/icon.png" width="120" height="120" alt="Rin Logo" style="border-radius: 20px; box-shadow: 0 8px 32px rgba(0, 217, 255, 0.3);">
</div>

# 🚀 Rin Browser: 简单而快速的检索增强生成浏览器

</div>

---

# Rin Browser（实验性）

> 警告：这是一个实验性项目，主要用于学习与探索。当前版本不适合在生产环境使用，风险自负。

<p>
  <a href="README-zh.md">中文</a> |
  <a href="README.md">English</a>
</p>

---

## ⚠️ 警告

这是一个实验性项目，仅用于学习与探索。当前版本不适合在生产环境使用，风险自负。

---

## 项目简介

Rin Browser 是一个使用 React、TypeScript、Vite 与 Tauri 2 构建的极简桌面浏览器原型。

目标是提供简单、快速的浏览体验，将 UI 与原生 WebView（通过 Tauri）整合。

- 技术栈：`React`、`TypeScript`、`Vite`、`Tauri 2`

**主要目标**：

- 快速浏览网页
- 多标签管理
- 增强与实验性功能演示

---

## 🚀 功能（早期）

- 多标签管理
- 地址栏输入与导航

> 功能仍在快速迭代中，接口和体验可能随时变化

## 📁 目录结构

- `src/` — 前端 React 代码
- `src-tauri/` — Tauri 2（Rust）

## 🛠 环境要求

- Node.js `>= 18`
- 包管理器：`pnpm`
- Rust 工具链（通过 `rustup`）
- Tauri 2 依赖：https://tauri.app/start/prerequisites

## ⚡ 快速开始

### 安装依赖

使用 pnpm：

```bash
pnpm install
```

> 确保 Rust 工具链已安装并可使用 `rustc -V` 查看版本

### 开发运行（桌面应用）

```bash
pnpm tauri dev
```

### 构建（生成安装包）

```bash
pnpm tauri build
```

---

## ❓ 常见问题

- **环境确认**
- Node.js >= 18 (`node -v`)
- Rust 工具链 (`rustc -V`)
- **依赖报错**
- 确认 Tauri 依赖已按操作系统正确安装

---

## 🔒 安全与稳定性

- 尚未实现完整的生产安全措施
- 功能可能不完整，体验随时变化
- 不建议用于处理敏感数据或长期浏览

---

## 🤝 贡献与联系

- 欢迎 Fork 或提交 PR
- Bug / 建议请在 [GitHub Issues](https://github.com/calebax/Rin/issues) 提交
- 请注意：本项目仍处于实验阶段，体验不保证稳定

---

## 📖 参考链接

- [Tauri 官方文档](https://tauri.app/)
- [React 官方文档](https://reactjs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
