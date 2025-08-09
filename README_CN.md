# 澜充小站

基于 uni-app + Vue3 的澜充小站小程序前端，支持微信小程序、H5、App等多端，界面简洁，体验流畅，代码结构清晰，易于维护和扩展。

---

## 语言切换

- [English](README.md)
- [中文版（当前）](README_CN.md)

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
- **充电记录管理**：
  - **统计页面**（/pages/records/index.vue）：月度统计、饼图、柱状图
  - **记录列表**（/pages/records/list.vue）：按月展示充电记录，支持查看详情
  - **记录详情**（/pages/records/detail.vue）：显示完整记录信息，支持编辑
  - **记录编辑**（/pages/records/edit.vue）：修改记录信息，支持重新上传图片
  - **记录创建**（/pages/records/create.vue）：上传新的充电记录
- **个人中心**（/pages/profile/index.vue 等）：用户信息、通知、隐私、协议、关于、退出登录
- **用户管理（仅管理员）**（/pages/profile/userManage.vue）：admin可查看所有用户，切换预约权限、编辑电价
- **月度对账（仅管理员）**（/pages/profile/monthlyReport.vue）：admin可查看所有用户指定月份总金额及上传状态，一键复制对账信息，格式适合微信群发
- **登录**（/pages/login/login.vue）：微信一键登录、协议勾选

---

## 主要组件

- **CommonNavBar**：自定义导航栏，支持返回/右侧按钮
- **CommonCard**：卡片容器，统一样式
- **SvgIcon**：SVG图标组件，支持 uni-icons 或自定义svg
- **BaseGroup/BaseGroupItem**：分组列表及项，常用于个人中心

---

## 核心功能特性

### 1. 充电记录管理系统

- **分层管理**：统计页面展示数据分析，记录列表展示详细记录
- **完整流程**：创建 → 列表 → 详情 → 编辑 → 保存
- **数据验证**：创建记录时验证预约ID，确保数据完整性
- **图片处理**：支持图片压缩、缩略图生成、本地缓存

### 2. 统一图片缓存机制

- **智能缓存**：头像和记录图片统一使用 `fetchAndCacheImage` 机制
- **性能优化**：优先使用本地缓存，网络请求作为备选
- **跨平台兼容**：支持小程序、H5、App 多端图片显示

### 3. 导航流程优化

- **首页功能简化**：预约充电→预约，上传记录→上传，充电记录→统计，个人中心→我的
- **新增记录入口**：首页增加"记录"卡片，直接进入记录列表
- **智能跳转**：上传完成后直接返回首页，编辑完成后返回详情页

### 4. 用户体验提升

- **头像缓存**：个人中心头像本地缓存，提升加载速度
- **数据刷新**：详情页编辑后自动刷新数据
- **金额计算**：编辑页面自动计算费用
- **权限控制**：只能编辑自己的记录

### 5. 管理员专属功能

- **权限入口**：仅admin用户在个人中心看到“用户管理”“月度对账”入口，单独分组展示
- **用户管理**：支持切换can_reserve状态、编辑unit_price，所有操作实时生效
- **月度对账**：可选择月份，展示所有用户本月总金额及是否已上传数据，一键复制内容为“姓名：金额元”或“姓名：未上传”，适合微信粘贴

---

## 全局样式

- **uni.scss**：定义了主色调、辅助色、字体、间距、圆角、阴影等变量和 mixin，页面和组件可直接使用，风格统一，易于主题切换。
- **样式 Token 化**：所有硬编码样式已转换为使用 `uni.scss` 中的 SCSS 变量，确保主题一致性和易于维护。组件和页面使用 `@import '@/uni.scss'` 并将十六进制颜色替换为预定义的 token。

---

## 接口与工具

- **api/**：所有后端接口均有独立文件封装，支持 token 自动注入、401 自动刷新、统一错误处理
- **utils/**：包含日期格式化、金额计算、全局跳转 goTo、认证管理 userAuth、图片缓存、压缩等常用工具函数
- **getPayload**：统一响应数据提取工具，确保不同 API 响应格式的一致数据处理
- **全局常量**：在 `config/index.js` 中定义的 `PRIMARY_COLOR` 和 `SUCCESS_COLOR`，用于模板中的集中主题色管理

### 新增API接口

- `getRecordsList(month)`：获取指定月份的记录列表
- `getRecordDetail(id)`：获取记录详情
- `updateRecord(id, data)`：更新记录信息
- `getAllUsers()`：获取所有用户列表（仅管理员）
- `updateUserReserve(userId, canReserve)`：修改用户预约权限（仅管理员）
- `updateUserPrice(userId, unitPrice)`：修改用户电价（仅管理员）
- `getMonthlyReport(month)`：获取月度对账数据（仅管理员）

### 图片处理工具

- `compressImage(path, quality)`：图片压缩
- `generateThumbnail(path)`：生成缩略图
- `fetchAndCacheImage(url, cacheKeyPrefix)`：统一图片缓存机制
- `getAvatarUrl(avatarPath)`：头像URL处理
- `getRecordImageUrl(imagePath)`：记录图片URL处理

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
- 图片缓存机制统一，避免重复代码
- 如有自定义模块，建议单独提交对应子目录

---

## 更新日志

### 最新版本

- ✅ 新增充电记录管理系统（列表、详情、编辑页面）
- ✅ 实现统一图片缓存机制，提升加载性能
- ✅ 优化首页功能命名，简化用户理解
- ✅ 完善导航流程，提升用户体验
- ✅ 新增数据验证，确保记录创建完整性
- ✅ 支持图片压缩和缩略图生成
- ✅ 新增管理员专属"用户管理""月度对账"页面，入口单独分组，功能详见上文
- ✅ 月度对账一键复制内容格式优化，适合微信群发
- ✅ 统一头像渲染逻辑，所有页面均通过getAvatarUrl处理
- ✅ **API 统一化**：将所有管理员API迁移到统一HTTP请求，支持401自动刷新和重试机制
- ✅ **样式 Token 化**：将所有硬编码样式转换为SCSS变量，确保所有组件和页面的主题一致性
- ✅ **响应标准化**：实现 `getPayload` 工具，用于从API响应中一致地提取数据
- ✅ **全局常量**：添加集中式主题色常量（`PRIMARY_COLOR`、`SUCCESS_COLOR`）供模板使用

---

## 贡献与反馈

如需二次开发、功能扩展或有任何问题，欢迎 issue 或联系维护者。

---
