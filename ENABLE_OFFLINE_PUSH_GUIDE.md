# 📲 啟用離線推送通知完整指南

## 🎯 目標

讓您即使**關閉應用**或**手機螢幕鎖定**時,也能收到即時推送通知!

## ✅ 系統狀態確認

您的系統**已經完整實現** Push Notification 功能:
- ✅ 前端: `usePushNotification.ts` composable
- ✅ 前端: `PushNotificationPrompt.vue` 提示組件  
- ✅ 後端: Push Notification Service
- ✅ Service Worker: 已配置

## 📋 啟用步驟

### 步驟 1: 確認後端 VAPID Keys 配置

VAPID keys 用於識別推送通知的發送者。

**檢查 `backend/.env` 文件:**

```env
# VAPID Keys (用於 Web Push)
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

**如果沒有,生成 VAPID keys:**

```bash
cd backend
npx web-push generate-vapid-keys
```

會顯示類似:
```
Public Key: BNxw7p...
Private Key: 5kQ3r...
```

**複製到 `.env`:**
```env
VAPID_PUBLIC_KEY=BNxw7p...
VAPID_PRIVATE_KEY=5kQ3r...
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

**重啟後端服務!**

### 步驟 2: 在手機上啟用通知權限

#### iPhone (iOS 16.4+):

1. **使用 Safari 瀏覽器**打開 PWA
2. 安裝 PWA 到主畫面
3. 從主畫面打開 PWA (不是從 Safari)
4. 等待 5 秒,會看到**推送通知提示**
5. 點擊「開啟通知」
6. 在彈出的權限對話框點擊「允許」

#### Android:

1. 使用 **Chrome** 打開 PWA
2. 安裝 PWA 到主畫面
3. 從主畫面打開 PWA
4. 等待 5 秒,會看到推送通知提示
5. 點擊「開啟通知」
6. 在系統權限對話框選擇「允許」

### 步驟 3: 驗證訂閱成功

**在瀏覽器開發者工具控制台查看:**

應該會看到:
```
✅ 推送通知訂閱成功
```

**檢查後端日誌:**

後端會記錄新的推送訂閱:
```
[PushNotificationService] 新的推送訂閱已儲存
```

### 步驟 4: 測試離線推送

1. **關閉 PWA 應用** (完全關閉,不只是切換到背景)
2. **鎖定手機螢幕** 
3. **從後台發送廣播通知**:
   - 登入管理後台
   - 進入「通知中心」
   - 點擊「建立通知」 → 「廣播給所有會員」
   - 填寫標題和內容
   - 點擊「建立」

4. **手機應該會彈出通知!** 🎉

## 🔧 故障排除

### 問題 1: 沒有看到「開啟推送通知」提示

**原因:**
- 已經點擊過「不要再顯示」
- 通知權限已被拒絕

**解決:**

**iPhone:**
1. 設定 → Safari → 進階 → 網站資料
2. 找到您的網站,清除資料
3. 或: 設定 → 通知 → 找到您的 PWA → 開啟「允許通知」

**Android:**
1. 長按 PWA 圖示 → 應用程式資訊
2. 通知 → 開啟「允許通知」
3. 或清除瀏覽器快取和網站資料

### 問題 2: 訂閱失敗

**檢查瀏覽器控制台錯誤:**

```javascript
// 打開 PWA,按 F12 (或長按頁面 → 檢查元素)
// 查看 Console 標籤的錯誤訊息
```

**常見錯誤:**

1. **"VAPID public key not found"**
   - 後端 `.env` 沒有設定 VAPID keys
   - 解決: 執行步驟 1

2. **"ServiceWorker registration not found"**
   - Service Worker 沒有註冊
   - 解決: 清除快取,重新載入

3. **"Notification permission denied"**
   - 用戶拒絕了通知權限
   - 解決: 到系統設定開啟通知權限

### 問題 3: 只在應用打開時收到通知

**檢查項目:**

1. **確認已訂閱推送**
   ```javascript
   // 在 PWA 中執行:
   navigator.serviceWorker.ready.then(reg => 
     reg.pushManager.getSubscription().then(sub => 
       console.log('訂閱狀態:', sub ? '已訂閱' : '未訂閱')
     )
   )
   ```

2. **確認後端使用 Push API**
   - 後端在用戶離線時應該使用 `PushNotificationService`
   - 檢查 `notification.service.ts` 的 `sendWebSocketNotification` 方法

3. **檢查手機省電模式**
   - 省電模式可能禁止背景通知
   - 將 PWA 加入「不受限制」清單

## 📱 各平台支援狀況

| 平台 | 瀏覽器 | 離線推送 | 備註 |
|------|--------|----------|------|
| Android | Chrome | ✅ 完全支援 | 最佳體驗 |
| Android | Firefox | ✅ 完全支援 | - |
| Android | Samsung Internet | ✅ 完全支援 | - |
| iOS | Safari | ✅ iOS 16.4+ | 必須安裝為 PWA |
| iOS | Chrome | ❌ 不支援 | 使用 Safari |
| Desktop | Chrome | ✅ 完全支援 | - |
| Desktop | Firefox | ✅ 完全支援 | - |
| Desktop | Edge | ✅ 完全支援 | - |

## 🎯 最佳實踐

### 1. 漸進式啟用

不要在用戶第一次打開應用就要求通知權限,而是:
- ✅ 等待 5 秒 (已實現)
- ✅ 在用戶完成某個操作後提示
- ✅ 說明推送通知的好處

### 2. 通知內容優化

**好的通知:**
```javascript
{
  title: "訂單已出貨 📦",
  body: "您的訂單 #12345 已經出貨,預計 3 天送達",
  icon: "/icon-192x192.png",
  badge: "/icon-192x192.png",
  data: {
    url: "/orders/12345"
  }
}
```

**避免:**
- ❌ 過於頻繁的通知
- ❌ 不重要的訊息
- ❌ 沒有操作連結

### 3. 允許用戶管理

提供設定頁面讓用戶:
- ✅ 開啟/關閉推送通知
- ✅ 選擇接收哪些類型的通知
- ✅ 查看訂閱狀態

## 🔍 檢查清單

在生產環境部署前,確認:

- [ ] VAPID keys 已設定在生產環境的 `.env`
- [ ] 網站使用 **HTTPS** (Push 需要)
- [ ] Service Worker 正確註冊
- [ ] 推送通知提示正常顯示
- [ ] 能成功訂閱推送
- [ ] 離線時能收到通知
- [ ] 點擊通知能打開正確頁面
- [ ] 通知圖示和樣式正確

## 💡 進階功能

### 推送通知類型

系統已支援多種通知場景:

1. **訂單通知**: 訂單狀態更新
2. **支付通知**: 支付成功/失敗
3. **系統通知**: 維護公告
4. **促銷通知**: 優惠活動
5. **會員通知**: 點數、等級變更

### 通知優先級

高優先級通知會:
- 🔔 有聲音提示
- 📳 震動
- 🔴 在通知列表頂部

### 通知分組

相同類型的通知會自動分組,避免通知轟炸。

## 📞 需要幫助?

如果遇到問題:

1. 檢查瀏覽器控制台錯誤訊息
2. 查看後端日誌  
3. 確認 VAPID keys 配置正確
4. 測試在不同瀏覽器/設備

---

**享受即時推送通知帶來的便利! 🎉**
