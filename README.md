# 滨海小外校园论坛

> 天津滨海外国语学校小外初中部校园论坛系统

## 🌐 在线访问

**https://klgh6n3cv3rj2.ok.kimi.link**

---

## ✨ 功能特性

### 用户系统
- ✅ 用户注册/登录
- ✅ 入学年份和班级选择（可配置）
- ✅ 头像上传功能
- ✅ 个人主页（可编辑资料）

### 帖子系统
- ✅ 发布帖子（支持图片）
- ✅ 帖子标签分类
- ✅ 可见范围设置（全校/年级/班级）
- ✅ 点赞、评论、分享
- ✅ 关键词搜索

### 权限管理
- ✅ **站主功能**
  - 任命/罢免管理员
  - 删除用户（连同其所有帖子和评论）
  - 设置年级班级选项
  - 标签管理
  - 发布公告
- ✅ **管理员功能**
  - 删帖
  - 禁言/解封用户

### 公告系统
- ✅ 顶部公告栏
- ✅ 自动轮播
- ✅ 可关闭

---

## 👑 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 站主 | `ZJCjonathan25` | `123456` |
| 管理员 | `admin01` | `123456` |
| 普通用户 | `xiaoming2022` | `123456` |

---

## 🛠 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI组件**: shadcn/ui
- **数据存储**: LocalStorage（演示用）

---

## 📁 项目结构

```
app/
├── src/
│   ├── components/          # 组件
│   │   ├── AdminPanel.tsx      # 管理后台
│   │   ├── AnnouncementBar.tsx # 公告栏
│   │   ├── AuthModal.tsx       # 登录注册弹窗
│   │   ├── CreatePostModal.tsx # 发帖弹窗
│   │   ├── Navbar.tsx          # 导航栏
│   │   ├── PostCard.tsx        # 帖子卡片
│   │   ├── PostDetailModal.tsx # 帖子详情
│   │   ├── ProfileModal.tsx    # 个人主页
│   │   └── Sidebar.tsx         # 侧边栏
│   ├── lib/
│   │   └── utils.ts         # 工具函数
│   ├── store/
│   │   └── index.ts         # 数据存储
│   ├── types/
│   │   └── index.ts         # 类型定义
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口
│   └── index.css            # 样式
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

---

## 📝 更新日志

### v2.0 (2024-12)
- 修复头像上传和个人主页功能
- 生日改为滚轮选择（年/月/日）
- 添加站主删除用户功能
- 添加顶部公告栏
- 修复数据同步刷新问题
- 所有用户发帖获赞数归零

### v1.0 (2024-12)
- 初始版本发布
- 用户系统、帖子系统
- 管理员功能
- 标签和权限管理

---

## 📄 开源协议

MIT License

---

**Made with ❤️ for 滨海小外**
