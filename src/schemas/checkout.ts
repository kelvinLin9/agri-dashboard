/**
 * 結帳表單驗證 Schema
 * 使用 Valibot 進行表單驗證
 */

import * as v from 'valibot'

/**
 * 台灣手機號碼驗證
 */
const taiwanPhoneRegex = /^09\d{8}$/

/**
 * 結帳表單驗證 Schema
 */
export const CheckoutFormSchema = v.object({
  // 收件人資訊
  recipientName: v.pipe(
    v.string('收件人姓名必須是文字'),
    v.nonEmpty('請輸入收件人姓名'),
    v.minLength(2, '收件人姓名至少 2 個字'),
    v.maxLength(50, '收件人姓名最多 50 個字')
  ),

  recipientPhone: v.pipe(
    v.string('聯絡電話必須是文字'),
    v.nonEmpty('請輸入聯絡電話'),
    v.regex(taiwanPhoneRegex, '請輸入正確的手機號碼格式 (09xxxxxxxx)')
  ),

  recipientEmail: v.optional(
    v.pipe(
      v.string(),
      v.email('請輸入正確的 Email 格式')
    )
  ),

  // 配送地址
  recipientPostalCode: v.pipe(
    v.string('郵遞區號必須是文字'),
    v.nonEmpty('請輸入郵遞區號'),
    v.regex(/^\d{3,6}$/, '請輸入正確的郵遞區號')
  ),

  recipientCity: v.pipe(
    v.string('縣市必須是文字'),
    v.nonEmpty('請選擇縣市'),
    v.minLength(2, '請選擇縣市')
  ),

  recipientDistrict: v.pipe(
    v.string('區域必須是文字'),
    v.nonEmpty('請選擇區域'),
    v.minLength(2, '請選擇區域')
  ),

  recipientAddress: v.pipe(
    v.string('地址必須是文字'),
    v.nonEmpty('請輸入詳細地址'),
    v.minLength(5, '地址至少 5 個字'),
    v.maxLength(200, '地址最多 200 個字')
  ),

  // 配送與付款
  shippingMethod: v.pipe(
    v.string('請選擇配送方式'),
    v.picklist(['home_delivery', 'cvs_pickup'], '請選擇有效的配送方式')
  ),

  paymentMethod: v.pipe(
    v.string('請選擇付款方式'),
    v.picklist(['credit_card', 'atm', 'cvs'], '請選擇有效的付款方式')
  ),

  // 備註
  customerNote: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, '備註最多 500 個字')
    )
  ),
})

/**
 * 結帳表單型別 (從 Schema 推導)
 */
export type CheckoutFormData = v.InferOutput<typeof CheckoutFormSchema>

/**
 * 結帳表單輸入型別
 */
export type CheckoutFormInput = v.InferInput<typeof CheckoutFormSchema>
