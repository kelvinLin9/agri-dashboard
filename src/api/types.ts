/**
 * API 通用類型定義
 */

// 排序方向
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// 分頁查詢參數
export interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
}

// 可搜尋查詢參數
export interface SearchableQueryParams extends QueryParams {
  search?: string
}

// 分頁響應metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 分頁響應格式（實際後端回應結構）
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 標準 API 響應
export interface ApiResponse<T> {
  data: T
  message?: string
}

// API 錯誤響應
export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
  timestamp?: string
  path?: string
}

// 用戶相關類型
export interface User {
  id: string
  username: string
  email: string
  nickname?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface LoginDto {
  usernameOrEmail: string
  password: string
}

// 產品相關類型
export interface Product {
  id: string
  categoryId: string
  name: string
  sku: string
  slug: string
  shortDescription?: string
  description?: string
  imageUrl?: string
  gallery?: string[]
  originalPrice: number
  salePrice?: number
  stockQuantity: number
  lowStockThreshold?: number
  trackInventory: boolean
  weight?: number
  status: 'active' | 'inactive' | 'out_of_stock'
  isFeatured: boolean
  isNew: boolean
  origin?: string
  shelfLife?: number
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface ProductQueryParams extends SearchableQueryParams {
  status?: 'active' | 'inactive' | 'out_of_stock'
  categoryId?: string
  isFeatured?: boolean
  isNew?: boolean
}

export interface CreateProductDto {
  categoryId: string
  name: string
  sku: string
  slug: string
  shortDescription?: string
  description?: string
  imageUrl?: string
  gallery?: string[]
  originalPrice: number
  salePrice?: number
  stockQuantity: number
  lowStockThreshold?: number
  trackInventory?: boolean
  weight?: number
  status?: 'active' | 'inactive'
  isFeatured?: boolean
  isNew?: boolean
  origin?: string
  shelfLife?: number
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

// 分類相關類型
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> { }

// 訂單相關類型
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
  note?: string
  product?: Product
}

export interface Order {
  id: string
  orderNumber: string
  memberId: string
  status: OrderStatus
  paymentMethod: string
  shippingMethod: string
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  recipientPostalCode: string
  recipientCity: string
  recipientDistrict: string
  recipientAddress: string
  subtotal: number
  shippingFee: number
  discountAmount: number
  pointsUsed: number
  pointsEarned: number
  totalAmount: number
  trackingNumber?: string
  customerNote?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
  orderItems?: OrderItem[]
}

export interface OrderQueryParams extends SearchableQueryParams {
  status?: OrderStatus
  memberId?: string
  paymentMethod?: string
  shippingMethod?: string
}

export interface CreateOrderDto {
  orderItems: {
    productId: string
    quantity: number
    note?: string
  }[]
  paymentMethod: string
  shippingMethod: string
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  recipientPostalCode: string
  recipientCity: string
  recipientDistrict: string
  recipientAddress: string
  pointsUsed?: number
  customerNote?: string
}

export interface UpdateOrderDto {
  status?: OrderStatus
  trackingNumber?: string
  shippingFee?: number
  discountAmount?: number
  adminNote?: string
}

// 會員相關類型
export enum MemberLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export interface Member {
  id: string
  userId: string
  realName?: string
  phone?: string
  birthday?: string
  gender?: 'male' | 'female' | 'other'
  postalCode?: string
  city?: string
  district?: string
  address?: string
  level: MemberLevel
  points: number
  totalSpent: number
  orderCount: number
  newsletterSubscribed: boolean
  preferredLanguage?: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  user?: User
}

export interface MemberQueryParams extends SearchableQueryParams {
  level?: MemberLevel
}

export interface CreateMemberDto {
  realName?: string
  phone?: string
  birthday?: string
  gender?: 'male' | 'female' | 'other'
  postalCode?: string
  city?: string
  district?: string
  address?: string
  newsletterSubscribed?: boolean
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {
  level?: MemberLevel
  points?: number
  status?: 'active' | 'inactive'
}

// 通知相關類型

// 通知類型枚舉
export enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  PAYMENT = 'payment',
  MEMBER = 'member',
  PRODUCT = 'product',
  PROMOTION = 'promotion',
  REFUND = 'refund',
}

// 通知渠道
export enum NotificationChannel {
  WEBSOCKET = 'websocket',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

// 通知狀態
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  status: NotificationStatus
  title: string
  content: string
  data?: Record<string, any>
  actionUrl?: string
  recipientEmail?: string
  recipientPhone?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  errorMessage?: string
  retryCount: number
  priority: number
  expiresAt?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationQueryParams extends SearchableQueryParams {
  type?: NotificationType
  status?: NotificationStatus
  priority?: number
}

export interface CreateNotificationDto {
  userId: string
  type: NotificationType
  title: string
  content: string
  channel: NotificationChannel
  data?: Record<string, any>
  actionUrl?: string
  priority?: number
}


// 上傳相關類型
export interface Upload {
  id: string
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  type: 'image' | 'video' | 'document'
  createdAt: string
}

export interface UploadResponse {
  id: string
  url: string
  filename: string
  size: number
}
