import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '@/api'
import type { Product, ProductQueryParams, PaginatedResponse } from '@/api/types'

/**
 * 商品 Store
 * 管理商品列表、篩選、分頁和商品詳情
 */
export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const filters = ref<ProductQueryParams>({
    status: 'active',
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasProducts = computed(() => products.value.length > 0)
  const hasMore = computed(() => pagination.value.page < pagination.value.totalPages)

  // Actions
  /**
   * 取得商品列表
   */
  const fetchProducts = async (params?: ProductQueryParams) => {
    isLoading.value = true
    error.value = null
    try {
      const queryParams = { ...filters.value, ...params }
      const response: PaginatedResponse<Product> = await productsApi.getAll(queryParams)

      products.value = response.data
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    }
    catch (err: any) {
      error.value = err.message || '載入商品失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 載入更多商品（分頁）
   */
  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return

    const nextPage = pagination.value.page + 1
    await fetchProducts({ ...filters.value, page: nextPage })
  }

  /**
   * 根據 ID 取得商品詳情
   */
  const fetchProductById = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentProduct.value = await productsApi.getById(id)
    }
    catch (err: any) {
      error.value = err.message || '載入商品詳情失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 根據 Slug 取得商品詳情
   */
  const fetchProductBySlug = async (slug: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentProduct.value = await productsApi.getBySlug(slug)
    }
    catch (err: any) {
      error.value = err.message || '載入商品詳情失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 設置篩選條件
   */
  const setFilters = (newFilters: ProductQueryParams) => {
    filters.value = { ...filters.value, ...newFilters }
    // 重置分頁
    pagination.value.page = 1
  }

  /**
   * 清除篩選條件
   */
  const clearFilters = () => {
    filters.value = { status: 'active' }
    pagination.value.page = 1
  }

  /**
   * 搜尋商品
   */
  const searchProducts = async (searchTerm: string) => {
    setFilters({ search: searchTerm, page: 1 })
    await fetchProducts()
  }

  /**
   * 清除當前商品
   */
  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  /**
   * 清除錯誤
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    products,
    currentProduct,
    pagination,
    filters,
    isLoading,
    error,
    // Getters
    hasProducts,
    hasMore,
    // Actions
    fetchProducts,
    loadMore,
    fetchProductById,
    fetchProductBySlug,
    setFilters,
    clearFilters,
    searchProducts,
    clearCurrentProduct,
    clearError,
  }
})
