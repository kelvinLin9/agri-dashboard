# Google OAuth 設定指南

## 📋 前端環境變數設定

在 `dashboard/.env` 文件中添加：

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## 🔧 Google Cloud Console 設定步驟

### 1. 創建 Google Cloud 項目

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊「選擇項目」→「新增項目」
3. 輸入項目名稱（例如：日沐 SunBathe）
4. 點擊「建立」

### 2. 啟用 Google+ API

1. 在左側選單選擇「API 和服務」→「資料庫」
2. 搜尋「Google+ API」
3. 點擊「啟用」

### 3. 創建 OAuth 2.0 憑證

1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「OAuth 用戶端 ID」
3. 如果提示設定同意畫面，請先完成設定：
   - 用戶類型：外部
   - 應用程式名稱：日沐 SunBathe
   - 用戶支援電子郵件：你的 email
   - 開發人員聯絡資訊：你的 email
   - 儲存並繼續

4. 選擇應用程式類型：「網頁應用程式」
5. 名稱：日沐 SunBathe - Web Client
6. 已授權的 JavaScript 來源：
   ```
   http://localhost:5173
   http://localhost:3000
   ```
7. 已授權的重新導向 URI：
   ```
   http://localhost:5173/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```
8. 點擊「建立」
9. 複製「用戶端 ID」到 `.env` 文件

## 🔐 後端設定

### 1. 安裝依賴

```bash
cd backend
npm install @nestjs/passport passport passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

### 2. 環境變數設定

在 `backend/.env` 添加：

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 3. 創建 Google Strategy (範例)

創建 `backend/src/modules/auth/strategies/google.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    }

    done(null, user)
  }
}
```

### 4. 添加 Google 認證路由 (範例)

在 `auth.controller.ts` 添加：

```typescript
@Get('google')
@UseGuards(AuthGuard('google'))
googleAuth() {
  // 由 Passport 處理
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req, @Res() res) {
  const user = req.user;

  // 檢查用戶是否存在，不存在則創建
  // 生成 JWT token
  // 返回 token 給前端

  res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
}
```

## 🚀 使用方式

### 前端

1. 用戶點擊「使用 Google 帳號登入」
2. 跳轉到 Google 授權頁面
3. 用戶授權後，Google 重定向到 `/auth/google/callback`
4. 前端處理 callback，儲存 token
5. 跳轉到應用首頁

### 測試流程

1. 啟動後端：`cd backend && npm run start:dev`
2. 啟動前端：`cd dashboard && npm run dev`
3. 訪問 `http://localhost:5173/login`
4. 點擊「使用 Google 帳號登入」
5. 完成 Google 授權流程

## ⚠️ 注意事項

1. **開發環境**：確保 callback URL 與 Google Console 設定一致
2. **生產環境**：記得更新 redirect URLs 為實際域名
3. **安全性**：不要將 Client Secret 提交到版本控制
4. **HTTPS**：生產環境必須使用 HTTPS
5. **憑證管理**：定期輪換 OAuth 憑證

## 🔍 除錯

如果遇到問題：

1. 檢查 Console 錯誤訊息
2. 確認環境變數正確設定
3. 驗證 redirect URI 完全匹配
4. 檢查 Google Console 的配額和限制
5. 查看 Network 標籤的請求/響應

## 📚 參考資料

- [Google OAuth 2.0 文檔](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth20](http://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Passport](https://docs.nestjs.com/recipes/passport)
