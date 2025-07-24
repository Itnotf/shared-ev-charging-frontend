# 充电共享小程序前端

基于 uni-app + Vue3 的充电共享小程序前端，支持微信小程序、H5、App等多端，界面简洁，体验流畅，代码结构清晰，易于维护和扩展。

---

## 目录结构

```
.
├── api/                // 后端接口封装
├── components/         // 公共组件（如导航栏、卡片、图标等）
├── config/             // 配置文件（如常量 TIMESLOTS）
├── pages/              // 业务页面（首页、预约、记录、个人中心、登录等）
├── static/             // 静态资源（svg、png等，仅保留实际引用）
├── uni_modules/        // 插件市场模块（已被 .gitignore 忽略，见下方依赖声明）
├── utils/              // 工具函数（如跳转、日期、金额等）
├── uni.scss            // 全局样式变量与 mixin
├── manifest.json       // 项目配置，平台适配
├── pages.json          // 路由与 tabBar 配置
├── package.json        // npm 依赖声明
├── uni_modules_list.md // uni_modules 插件依赖清单
└── ...
```

---

## 主要页面

- **首页**（/pages/index/index.vue）：功能入口、充电总览、当前预约、未上传记录弹窗
- **预约**（/pages/reservations/index.vue）：日历选日期、班次，预约/取消
- **充电记录**（/pages/records/index.vue, create.vue）：月度明细、饼图、柱状图、上传记录
- **个人中心**（/pages/profile/index.vue 等）：用户信息、通知、隐私、协议、关于、退出登录
- **登录**（/pages/login/login.vue）：微信一键登录、协议勾选

---

## 主要组件

- **CommonNavBar**：自定义导航栏，支持返回/右侧按钮
- **CommonCard**：卡片容器，统一样式
- **SvgIcon**：SVG图标组件，支持 uni-icons 或自定义svg
- **BaseGroup/BaseGroupItem**：分组列表及项，常用于个人中心

---

## 全局样式

- **uni.scss**：定义了主色调、辅助色、字体、间距、圆角、阴影等变量和 mixin，页面和组件可直接使用，风格统一，易于主题切换。

---

## 接口与工具

- **api/**：所有后端接口均有独立文件封装，支持 token 自动注入、401 自动刷新、统一错误处理。
- **utils/**：包含日期格式化、金额计算、全局跳转 goTo、认证管理 userAuth、未上传记录弹窗等常用工具函数。

---

## 插件依赖（uni_modules）

本项目依赖的 uni_modules 插件**不会提交到 git 仓库**，请根据 [uni_modules_list.md](./uni_modules_list.md) 文件说明，手动安装所需插件。例如：

- qiun-data-charts（高性能跨端图表组件）

如有新增/删除 uni_modules，请同步更新该清单。

---

## 运行与开发

### 1. 安装依赖

```bash
# 安装 npm 依赖
npm install
```

### 2. 安装 uni_modules 插件

请参考 [uni_modules_list.md](./uni_modules_list.md) 手动安装所有必需插件。

### 3. 启动开发

- 推荐使用 HBuilderX 打开项目，选择对应平台（微信小程序/H5/App）运行或发行。
- 也可使用 CLI 方式运行（需全局安装 @dcloudio/uni-app）：

```bash
# H5 预览
npm run dev:h5

# 微信小程序预览
npm run dev:mp-weixin
```

---

## 版本与平台

- Vue 3.x
- uni-app
- 支持微信小程序、H5、App等多端
- 详见 manifest.json

---

## 代码规范与协作建议

- 组件、页面、工具函数、接口分层清晰，命名规范
- 静态资源只保留实际引用，未用资源及时清理
- uni_modules 目录不提交，依赖清单单独维护
- 如有自定义模块，建议单独提交对应子目录

---

## 贡献与反馈

如需二次开发、功能扩展或有任何问题，欢迎 issue 或联系维护者。

---

如需英文版或更详细的开发文档，请告知！ 
