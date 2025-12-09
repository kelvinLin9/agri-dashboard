/**
 * 認證相關驗證 Schema
 * 使用 Valibot 進行表單驗證
 */

import * as v from 'valibot'

/**
 * 密碼強度驗證正則（統一前後端規則）
 */
const passwordStrengthRegex = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  digit: /[0-9]/,
  special: /[!@#$%^&*]/,
}

// ========================================
// 登入表單 Schema（改為純 Email 登入）
// ========================================

/**
 * 登入表單驗證 Schema
 */
export const LoginFormSchema = v.object({
  email: v.pipe(
    v.string('Email 必須是文字'),
    v.nonEmpty('請輸入 Email'),
    v.email('請輸入正確的 Email 格式')
  ),

  password: v.pipe(
    v.string('密碼必須是文字'),
    v.nonEmpty('請輸入密碼'),
    v.minLength(6, '密碼至少 6 個字元')
  ),
})

/**
 * 登入表單型別
 */
export type LoginFormData = v.InferOutput<typeof LoginFormSchema>
export type LoginFormInput = v.InferInput<typeof LoginFormSchema>

// ========================================
// 註冊表單 Schema（移除 username）
// ========================================

/**
 * 註冊表單驗證 Schema
 */
export const RegisterFormSchema = v.pipe(
  v.object({
    email: v.pipe(
      v.string('Email 必須是文字'),
      v.nonEmpty('請輸入 Email'),
      v.email('請輸入正確的 Email 格式')
    ),

    nickname: v.optional(
      v.pipe(
        v.string(),
        v.maxLength(50, '暱稱最多 50 個字元')
      )
    ),

    password: v.pipe(
      v.string('密碼必須是文字'),
      v.nonEmpty('請輸入密碼'),
      v.minLength(8, '密碼至少 8 個字元'),
      v.regex(passwordStrengthRegex.lowercase, '密碼必須包含小寫字母'),
      v.regex(passwordStrengthRegex.uppercase, '密碼必須包含大寫字母'),
      v.regex(passwordStrengthRegex.digit, '密碼必須包含數字'),
      v.regex(passwordStrengthRegex.special, '密碼必須包含特殊符號 (!@#$%^&*)')
    ),

    confirmPassword: v.pipe(
      v.string('確認密碼必須是文字'),
      v.nonEmpty('請確認密碼')
    ),

    agreedToTerms: v.pipe(
      v.boolean(),
      v.literal(true, '請同意服務條款和隱私政策')
    ),
  }),
  // 自訂驗證：確認密碼必須與密碼一致
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      '兩次輸入的密碼不一致'
    ),
    ['confirmPassword']
  )
)

/**
 * 註冊表單型別
 */
export type RegisterFormData = v.InferOutput<typeof RegisterFormSchema>
export type RegisterFormInput = v.InferInput<typeof RegisterFormSchema>

// ========================================
// 重發驗證信 Schema
// ========================================

export const ResendVerificationSchema = v.object({
  email: v.pipe(
    v.string('Email 必須是文字'),
    v.nonEmpty('請輸入 Email'),
    v.email('請輸入正確的 Email 格式')
  ),
})

export type ResendVerificationInput = v.InferInput<typeof ResendVerificationSchema>
