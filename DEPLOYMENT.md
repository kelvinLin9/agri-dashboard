# 前端部署指南

## 📋 部署前準備

### 1. 環境變數設定

在部署前，請確認以下環境變數：

```env
VITE_API_URL=https://agri-backend-660672910950.asia-east1.run.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2. Google OAuth 設定

前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 設定 OAuth 2.0：

#### 已授權的 JavaScript 來源
```
https://your-frontend-url.run.app
https://agri-backend-660672910950.asia-east1.run.app
```

#### 已授權的重新導向 URI
```
https://your-frontend-url.run.app/auth/callback
https://agri-backend-660672910950.asia-east1.run.app/api/auth/google/callback
```

---

## 🚀 部署到 Google Cloud Run

### 方法一：使用部署腳本（推薦）

1. 編輯 `deploy-to-gcloud.ps1`，設定環境變數：
   ```powershell
   $VITE_GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
   ```

2. 執行部署腳本：
   ```powershell
   .\deploy-to-gcloud.ps1
   ```

### 方法二：手動部署

```bash
# 設定專案
gcloud config set project agri-backend

# 部署到 Cloud Run
gcloud run deploy agri-dashboard \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-build-env-vars="VITE_API_URL=https://agri-backend-660672910950.europe-west1.run.app/api,VITE_GOOGLE_CLIENT_ID=your-client-id"
```

---

## 📁 部署檔案說明

### Dockerfile
多階段建置：
- **Builder Stage**: 使用 Node.js 20 Alpine 建置應用
- **Production Stage**: 使用 Nginx Alpine 提供靜態檔案

### nginx.conf
- SPA 路由支援（所有路徑重導向至 index.html）
- 靜態資源快取（1 年）
- index.html 不快取
- 安全標頭設定
- Gzip 壓縮

### .dockerignore
排除不必要的檔案以減少建置時間和映像大小

---

## 🔧 本地測試 Docker

### 建置 Docker 映像
```bash
docker build \
  --build-arg VITE_API_URL=https://agri-backend-660672910950.asia-east1.run.app/api \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id \
  -t agri-dashboard .
```

### 執行容器
```bash
docker run -p 8080:8080 agri-dashboard
```

訪問: http://localhost:8080

---

## ✅ 部署後檢查清單

- [ ] 前端可以正常訪問
- [ ] API 請求正常（檢查 Network 標籤）
- [ ] 一般登入功能正常
- [ ] Google OAuth 登入功能正常
- [ ] 靜態資源正確載入（圖片、CSS、JS）
- [ ] 路由導航正常
- [ ] 在 Google Console 更新前端 URL 到 OAuth 設定

---

## 🔄 更新後端設定

部署完成後，需要更新後端的 `FRONTEND_URL`：

1. 取得前端 URL：
   ```bash
   gcloud run services describe agri-dashboard --region=europe-west1 --format="value(status.url)"
   ```

2. 更新後端環境變數：
   ```bash
   gcloud run services update agri-backend \
     --region=europe-west1 \
     --set-env-vars="FRONTEND_URL=https://your-frontend-url.run.app"
   ```

---

## 🐛 常見問題

### 1. 建置失敗：找不到 Dockerfile
確認 `Dockerfile` 存在於專案根目錄

### 2. 部署後頁面空白
檢查瀏覽器 Console 是否有錯誤，可能是 API URL 設定錯誤

### 3. API 請求失敗（CORS 錯誤）
確認後端 `FRONTEND_URL` 已更新為前端部署 URL

### 4. Google 登入失敗
- 檢查 `VITE_GOOGLE_CLIENT_ID` 是否正確
- 確認 Google Console OAuth 設定包含前端 URL
- 檢查後端的 Google OAuth 設定

### 5. 靜態資源 404
檢查 `dist` 目錄是否正確建置，執行 `npm run build` 測試

---

## 📊 監控與日誌

### 查看服務狀態
```bash
gcloud run services describe agri-dashboard --region=europe-west1
```

### 查看日誌
```bash
gcloud run services logs read agri-dashboard --region=europe-west1
```

### 在 Console 查看
[Cloud Run Console](https://console.cloud.google.com/run/detail/europe-west1/agri-dashboard)

---

## 🔐 安全性建議

1. **環境變數**: 不要在程式碼中硬編碼敏感資訊
2. **HTTPS**: Cloud Run 自動提供 HTTPS
3. **OAuth**: 定期輪換 OAuth 憑證
4. **更新**: 定期更新依賴套件

---

## 📚 參考資料

- [Cloud Run 文檔](https://cloud.google.com/run/docs)
- [Vite 環境變數](https://vitejs.dev/guide/env-and-mode.html)
- [Nginx 配置](https://nginx.org/en/docs/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
