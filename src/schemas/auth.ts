/**
 * 認證相關驗證 Schema
 * 使用 Valibot 進行表單驗證
 */

import * as v from 'valibot'

/**
 * 用戶名驗證正則：3-20個字符，只能包含字母、數字、底線
 */
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

/**
 * 密碼強度驗證正則
 */
const passwordStrengthRegex = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  digit: /[0-9]/,
  special: /[!@#$%^&*]/,
}

// ========================================
// 登入表單 Schema
// ========================================

/**
 * 登入表單驗證 Schema
 */
export const LoginFormSchema = v.object({
  usernameOrEmail: v.pipe(
    v.string('帳號或 Email 必須是文字'),
    v.nonEmpty('請輸入帳號或 Email'),
    v.minLength(3, '帳號或 Email 至少 3 個字元'),
    v.maxLength(50, '帳號或 Email 最多 50 個字元')
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
// 註冊表單 Schema
// ========================================

/**
 * 註冊表單驗證 Schema
 */
export const RegisterFormSchema = v.pipe(
  v.object({
    username: v.pipe(
      v.string('用戶名必須是文字'),
      v.nonEmpty('請輸入用戶名'),
      v.minLength(3, '用戶名至少 3 個字元'),
      v.maxLength(20, '用戶名最多 20 個字元'),
      v.regex(usernameRegex, '用戶名只能包含字母、數字和底線')
    ),

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
