# 🔍 後端 API 完整對照檢查表

根據後端文檔 [`API_OVERVIEW.md`](file:///Users/linyixiu/agri/agri-backend/docs/05-frontend-integration/API_OVERVIEW.md) 的完整檢查結果:

---

## ✅ 1. 認證 API (`/api/auth`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/auth/login` | POST | ✅ | `authApi.login()` |
| `/auth/register` | POST | ✅ | `authApi.register()` |
| `/auth/profile` | GET | ✅ | `authApi.getProfile()` |
| `/auth/logout` | POST | ✅ | `authApi.logout()` |
| `/auth/refresh` | POST | ✅ | 在 apiClient 攔截器中處理 |
| `/auth/change-password` | PUT | ✅ | `authApi.changePassword()` |

**覆蓋率**: 6/6 (100%) ✅

---

## ✅ 2. 產品 API (`/api/products`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/products` | GET | ✅ | `productsApi.getAll()` |
| `/products/:id` | GET | ✅ | `productsApi.getById()` |
| `/products/slug/:slug` | GET | ✅ | `productsApi.getBySlug()` |
| `/products` | POST | ✅ | `productsApi.create()` |
| `/products/:id` | PUT | ✅ | `productsApi.update()` |
| `/products/:id/stock` | PUT | ✅ | `productsApi.updateStock()` |
| `/products/:id` | DELETE | ✅ | `productsApi.delete()` |

**覆蓋率**: 7/7 (100%) ✅

---

## ✅ 3. 產品分類 API (`/api/product-categories`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/product-categories` | GET | ✅ | `categoriesApi.getAll()` |
| `/product-categories/tree` | GET | ✅ | `categoriesApi.getTree()` |
| `/product-categories/roots` | GET | ✅ | `categoriesApi.getRoots()` |
| `/product-categories/:id` | GET | ✅ | `categoriesApi.getById()` |
| `/product-categories/slug/:slug` | GET | ✅ | `categoriesApi.getBySlug()` |
| `/product-categories/:id/products` | GET | ✅ | `categoriesApi.getProducts()` |
| `/product-categories` | POST | ✅ | `categoriesApi.create()` |
| `/product-categories/:id` | PUT | ✅ | `categoriesApi.update()` |
| `/product-categories/:id` | DELETE | ✅ | `categoriesApi.delete()` |

**覆蓋率**: 9/9 (100%) ✅

---

## ✅ 4. 訂單 API (`/api/orders`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/orders` | POST | ✅ | `ordersApi.create()` |
| `/orders` | GET | ✅ | `ordersApi.getAll()` |
| `/orders/my-orders` | GET | ✅ | `ordersApi.getMyOrders()` |
| `/orders/:id` | GET | ✅ | `ordersApi.getById()` |
| `/orders/order-number/:orderNumber` | GET | ✅ | `ordersApi.getByOrderNumber()` |
| `/orders/:id` | PUT | ✅ | `ordersApi.update()` |
| `/orders/:id/cancel` | PUT | ✅ | `ordersApi.cancel()` |
| `/orders/:id` | DELETE | ✅ | `ordersApi.delete()` |

**覆蓋率**: 8/8 (100%) ✅

---

## ✅ 5. 會員 API (`/api/members`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/members` | POST | ✅ | `membersApi.create()` |
| `/members` | GET | ✅ | `membersApi.getAll()` |
| `/members/my-profile` | GET | ✅ | `membersApi.getMyProfile()` |
| `/members/my-profile` | PUT | ✅ | `membersApi.updateMyProfile()` |
| `/members/statistics` | GET | ✅ | `membersApi.getStatistics()` |
| `/members/level-benefits/:level` | GET | ✅ | `membersApi.getLevelBenefits()` |
| `/members/:id` | GET | ✅ | `membersApi.getById()` |
| `/members/:id` | PUT | ✅ | `membersApi.update()` |
| `/members/:id` | DELETE | ✅ | `membersApi.delete()` |
| `/members/:id/add-points` | POST | ✅ | `membersApi.addPoints()` |
| `/members/:id/deduct-points` | POST | ✅ | `membersApi.deductPoints()` |

**覆蓋率**: 11/11 (100%) ✅

---

## ✅ 6. 支付 API (`/api/payment`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/payment/create` | POST | ✅ | `paymentApi.create()` |
| `/payment/ecpay/callback` | POST | ⚠️ | 內部端點,不需前端實作 |
| `/payment/ecpay/order-result` | GET | ⚠️ | 公開頁面,通常由後端渲染 |
| `/payment/:id` | GET | ✅ | `paymentApi.getById()` |
| `/payment/order/:orderId` | GET | ✅ | `paymentApi.getByOrderId()` |

**覆蓋率**: 3/3 前端需要的端點 (100%) ✅  
**注**: ECPay 回調和結果頁由後端處理

---

## ✅ 7. 退款 API (`/api/refund`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/refund/create` | POST | ✅ | `refundApi.create()` |
| `/refund/:id/approve` | POST | ✅ | `refundApi.approve()` |
| `/refund/:id/reject` | POST | ✅ | `refundApi.reject()` |
| `/refund/:id` | GET | ✅ | `refundApi.getById()` |
| `/refund/order/:orderId` | GET | ✅ | `refundApi.getByOrderId()` |

**覆蓋率**: 5/5 (100%) ✅

---

## ✅ 8. 通知 API (`/api/notifications`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/notifications` | GET | ✅ | `notificationsApi.getAll()` |
| `/notifications/unread-count` | GET | ✅ | `notificationsApi.getUnreadCount()` |
| `/notifications/:id/read` | PATCH | ✅ | `notificationsApi.markAsRead()` |
| `/notifications/read-all` | PATCH | ✅ | `notificationsApi.markAllAsRead()` |
| `/notifications/:id` | DELETE | ✅ | `notificationsApi.delete()` |
| `/notifications` | POST | ✅ | `notificationsApi.create()` |
| `/notifications/send-by-template` | POST | ✅ | `notificationsApi.sendByTemplate()` |
| `/notifications/send-bulk` | POST | ✅ | `notificationsApi.sendBulk()` |
| `/notifications/:id/status` | PATCH | ✅ | `notificationsApi.updateStatus()` |
| `/notifications/broadcast` | POST | ✅ | `notificationsApi.broadcast()` |

**覆蓋率**: 10/10 (100%) ✅

---

## ✅ 9. 上傳 API (`/api/uploads`)

| 端點 | 方法 | 狀態 | 實作位置 |
|------|------|------|----------|
| `/uploads` | POST | ✅ | `uploadApi.upload()` |
| `/uploads/multiple` | POST | ✅ | `uploadApi.uploadMultiple()` |
| `/uploads` | GET | ✅ | `uploadApi.getAll()` |
| `/uploads/my-files` | GET | ✅ | `uploadApi.getMyFiles()` |
| `/uploads/statistics` | GET | ✅ | `uploadApi.getStatistics()` |
| `/uploads/:id` | GET | ✅ | `uploadApi.getById()` |
| `/uploads/:id` | PATCH | ✅ | `uploadApi.update()` |
| `/uploads/:id` | DELETE | ✅ | `uploadApi.delete()` |
| `/uploads/:id/download` | POST | ✅ | `uploadApi.incrementDownload()` |
| `/uploads/cleanup` | POST | ✅ | `uploadApi.cleanup()` |

**覆蓋率**: 10/10 (100%) ✅

---

## 🎯 總結

### 📊 統計

| API 模組 | 總端點數 | 已實作 | 覆蓋率 |
|----------|----------|--------|--------|
| 認證 (Auth) | 6 | 6 | 100% ✅ |
| 產品 (Products) | 7 | 7 | 100% ✅ |
| 分類 (Categories) | 9 | 9 | 100% ✅ |
| 訂單 (Orders) | 8 | 8 | 100% ✅ |
| 會員 (Members) | 11 | 11 | 100% ✅ |
| 支付 (Payment) | 3* | 3 | 100% ✅ |
| 退款 (Refund) | 5 | 5 | 100% ✅ |
| 通知 (Notifications) | 10 | 10 | 100% ✅ |
| 上傳 (Uploads) | 10 | 10 | 100% ✅ |

*支付 API 有 5 個端點,但其中 2 個為內部/後端處理端點

### ✅ 最終結論

**是的,後端的所有 API 都已經接上了!**

- 📦 **總計**: 69 個前端需要的 API 端點
- ✅ **已實作**: 69 個
- 🎯 **覆蓋率**: **100%**

所有模組的所有端點都已完成整合,包含:
- 核心業務功能 (產品、訂單、會員)
- 金流功能 (支付、退款)
- 輔助功能 (通知、上傳)
- 管理功能 (統計、批量操作)

---

**檢查完成時間**: 2025-12-05  
**文檔來源**: [API_OVERVIEW.md](file:///Users/linyixiu/agri/agri-backend/docs/05-frontend-integration/API_OVERVIEW.md)
