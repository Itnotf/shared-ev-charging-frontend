# LanChong Station

A uni-app + Vue3 based mini-program frontend for LanChong Station, supporting WeChat Mini Program, H5, App and other platforms. Features clean interface, smooth experience, clear code structure, easy maintenance and extension.

---

## Language Switch

- [English (Current)](README.md)
- [中文版](README_CN.md)

---

## Directory Structure

```
.
├── api/                // Backend API encapsulation
├── components/         // Common components (navigation bar, cards, icons, etc.)
├── config/             // Configuration files (constants like TIMESLOTS)
├── pages/              // Business pages (home, reservations, records, profile, login, etc.)
├── static/             // Static resources (svg, png, etc., only keeping actually referenced)
├── uni_modules/        // Plugin market modules (ignored by .gitignore, see dependency declaration below)
├── utils/              // Utility functions (navigation, date, amount, etc.)
├── uni.scss            // Global style variables and mixins
├── manifest.json       // Project configuration, platform adaptation
├── pages.json          // Routing and tabBar configuration
├── package.json        // npm dependency declaration
├── uni_modules_list.md // uni_modules plugin dependency list
└── ...
```

---

## Main Pages

- **Home** (/pages/index/index.vue): Function entry, charging overview, current reservation, unsubmitted record popup
- **Reservation** (/pages/reservations/index.vue): Calendar date selection, shift selection, reservation/cancellation
- **Charging Record Management**:
  - **Statistics Page** (/pages/records/index.vue): Monthly statistics, pie chart, bar chart
  - **Record List** (/pages/records/list.vue): Display charging records by month, support detail view
  - **Record Detail** (/pages/records/detail.vue): Display complete record information, support editing
  - **Record Edit** (/pages/records/edit.vue): Modify record information, support re-uploading images
  - **Record Create** (/pages/records/create.vue): Upload new charging records
- **Profile** (/pages/profile/index.vue, etc.): User information, notifications, privacy, agreements, about, logout
- **User Management (Admin Only)** (/pages/profile/userManage.vue): Admin can view all users, toggle reservation permissions, edit electricity prices
- **Monthly Report (Admin Only)** (/pages/profile/monthlyReport.vue): Admin can view all users' total amounts for specified month and upload status, one-click copy reconciliation info, format suitable for WeChat group messaging
- **Login** (/pages/login/login.vue): WeChat one-click login, agreement checkbox

---

## Main Components


- **CommonCard**: Card container, unified styling
- **SvgIcon**: SVG icon component, supports uni-icons or custom svg
- **BaseGroup/BaseGroupItem**: Grouped list and items, commonly used in profile center

---

## Core Features

### 1. Charging Record Management System

- **Layered Management**: Statistics page shows data analysis, record list shows detailed records
- **Complete Workflow**: Create → List → Detail → Edit → Save
- **Data Validation**: Validate reservation ID when creating records, ensuring data integrity
- **Image Processing**: Support image compression, thumbnail generation, local caching

### 2. Unified Image Caching Mechanism

- **Smart Caching**: Avatars and record images uniformly use `fetchAndCacheImage` mechanism
- **Performance Optimization**: Prioritize local cache, network requests as fallback
- **Cross-platform Compatibility**: Support mini-program, H5, App multi-platform image display

### 3. Navigation Flow Optimization

- **Home Function Simplification**: Reservation charging → Reservation, Upload records → Upload, Charging records → Statistics, Profile center → My
- **New Record Entry**: Add "Records" card on home page, directly enter record list
- **Smart Navigation**: Return to home page after upload completion, return to detail page after edit completion

### 4. User Experience Enhancement

- **Avatar Caching**: Profile center avatar local caching, improve loading speed
- **Data Refresh**: Auto-refresh data after detail page editing
- **Amount Calculation**: Auto-calculate fees on edit page
- **Permission Control**: Can only edit own records

### 5. Admin-Only Features

- **Permission Entry**: Only admin users see "User Management" and "Monthly Report" entries in profile center, displayed in separate group
- **User Management**: Support toggling can_reserve status, editing unit_price, all operations take effect immediately
- **Monthly Report**: Can select month, display all users' total amounts for current month and whether data has been uploaded, one-click copy content as "Name: Amount" or "Name: Not uploaded", suitable for WeChat pasting

---

## Global Styles

- **uni.scss**: Defines primary colors, secondary colors, fonts, spacing, border radius, shadows and other variables and mixins, pages and components can use directly, unified style, easy theme switching.
- **Style Tokenization**: All hardcoded styles have been converted to use SCSS variables from `uni.scss`, ensuring consistent theming and easy maintenance. Components and pages use `@import '@/uni.scss'` and replace hex colors with predefined tokens.

---

## APIs and Utilities

- **api/**: All backend APIs have independent file encapsulation, support automatic token injection, 401 auto-refresh, unified error handling
- **utils/**: Contains date formatting, amount calculation, global navigation goTo, authentication management userAuth, image caching, compression and other common utility functions
- **getPayload**: Unified response data extraction utility that ensures consistent data handling across different API response formats
- **Global Constants**: `PRIMARY_COLOR` and `SUCCESS_COLOR` defined in `config/index.js` for centralized theme color management in templates

### New API Interfaces

- `getRecordsList(month)`: Get record list for specified month
- `getRecordDetail(id)`: Get record details
- `updateRecord(id, data)`: Update record information
- `getAllUsers()`: Get all users list (admin only)
- `updateUserReserve(userId, canReserve)`: Update user reservation permission (admin only)
- `updateUserPrice(userId, unitPrice)`: Update user electricity price (admin only)
- `getMonthlyReport(month)`: Get monthly reconciliation data (admin only)

### Image Processing Tools

- `compressImage(path, quality)`: Image compression
- `generateThumbnail(path)`: Generate thumbnails
- `fetchAndCacheImage(url, cacheKeyPrefix)`: Unified image caching mechanism
- `getAvatarUrl(avatarPath)`: Avatar URL processing
- `getRecordImageUrl(imagePath)`: Record image URL processing

---

## Plugin Dependencies (uni_modules)

The uni_modules plugins this project depends on **will not be submitted to git repository**. Please manually install required plugins according to [uni_modules_list.md](./uni_modules_list.md) file instructions. For example:

- qiun-data-charts (High-performance cross-platform chart component)

If there are new/deleted uni_modules, please update the list accordingly.

---

## Running and Development

### 1. Install Dependencies

```bash
# Install npm dependencies
npm install
```

### 2. Install uni_modules Plugins

Please refer to [uni_modules_list.md](./uni_modules_list.md) to manually install all required plugins.

### 3. Start Development

- Recommended to use HBuilderX to open the project, select corresponding platform (WeChat Mini Program/H5/App) to run or build.
- Can also use CLI method (need to install @dcloudio/uni-app globally):

```bash
# H5 preview
npm run dev:h5

# WeChat Mini Program preview
npm run dev:mp-weixin
```

---

## Code Style & Workflow

- Pre-commit runs Prettier and ESLint automatically (Husky + lint-staged)
- Commit messages follow Conventional Commits (commitlint)
- Use theme tokens and common classes from `uni.scss`

### Common Scripts

```bash
npm run lint      # ESLint
npm run format    # Prettier
npm run prepare   # Install Husky hooks
```

---

## Version and Platform

- Vue 3.x
- uni-app
- Support WeChat Mini Program, H5, App and other platforms
- See manifest.json for details

---

## Code Standards and Collaboration Suggestions

- Components, pages, utility functions, APIs are clearly layered, naming conventions
- Static resources only keep actually referenced, unused resources cleaned up promptly
- uni_modules directory not submitted, dependency list maintained separately
- Image caching mechanism unified, avoid duplicate code
- If there are custom modules, suggest submitting corresponding subdirectories separately

---

## Update Log

### Latest Version

- ✅ Added charging record management system (list, detail, edit pages)
- ✅ Implemented unified image caching mechanism, improve loading performance
- ✅ Optimized home page function naming, simplify user understanding
- ✅ Improved navigation flow, enhance user experience
- ✅ Added data validation, ensure record creation integrity
- ✅ Support image compression and thumbnail generation
- ✅ Added admin-only "User Management" and "Monthly Report" pages, separate entry group, see details above
- ✅ Optimized monthly report one-click copy content format, suitable for WeChat group messaging
- ✅ Unified avatar rendering logic, all pages use getAvatarUrl processing
- ✅ **API Unification**: Migrated all admin APIs to unified HTTP request with 401 auto-refresh and retry mechanisms
- ✅ **Style Tokenization**: Converted all hardcoded styles to SCSS variables, ensuring consistent theming across all components and pages
- ✅ **Response Standardization**: Implemented `getPayload` utility for consistent data extraction from API responses
- ✅ **Global Constants**: Added centralized theme color constants (`PRIMARY_COLOR`, `SUCCESS_COLOR`) for template usage

---

## Contribution and Feedback

For secondary development, feature extension or any questions, welcome to create issues or contact maintainers.
