# NPL Asset Tracker — 不良资产投资管理平台

## 部署步骤（面向非技术人员）

### 第一步：上传代码到 GitHub

1. 打开 https://github.com 注册一个账号（如已有跳过）
2. 登录后，点击右上角 "+" 号 → 选择 "New repository"
3. Repository name 填写：`npl-asset-tracker`
4. 选择 "Public"
5. 点击 "Create repository"
6. 在新页面中，点击 "uploading an existing file" 链接
7. 把本压缩包里的 **所有文件和文件夹** 拖进去
8. 点击 "Commit changes"

### 第二步：连接 Vercel 部署

1. 打开 https://vercel.com 并登录
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"，找到你刚创建的 `npl-asset-tracker`
4. Framework Preset 选择 "Vite"
5. 其他保持默认，点击 "Deploy"
6. 等待 1-2 分钟，部署完成后会给你一个网址

### 第三步（可选）：绑定自定义域名

1. 在 Vercel 项目页面 → Settings → Domains
2. 输入你购买的域名
3. 按照提示去域名服务商（阿里云/腾讯云）添加 DNS 解析记录

## 登录信息

- 管理端密码：`admin888`
- 投资者密码：`zhang123` / `li123` / `wang123`
