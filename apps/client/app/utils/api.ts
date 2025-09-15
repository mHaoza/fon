import type { ApiResponse } from '~/types'

/**
 * API响应处理工具类
 */
export class ApiResponseHandler {
  /**
   * 处理API响应，提取数据或抛出错误
   * @param response API响应
   * @returns 响应数据
   * @throws 当响应失败时抛出错误
   */
  static unwrap<T>(response: ApiResponse<T>): T {
    if (response.code === 200) {
      return response.data
    }

    throw new Error(response.message || '请求失败')
  }

  /**
   * 检查响应是否成功
   * @param response API响应
   * @returns 是否成功
   */
  static isSuccess<T>(response: ApiResponse<T>): boolean {
    return response.code === 200
  }

  /**
   * 获取响应消息
   * @param response API响应
   * @returns 响应消息
   */
  static getMessage<T>(response: ApiResponse<T>): string {
    return response.message || '未知错误'
  }

  /**
   * 安全地获取响应数据，失败时返回默认值
   * @param response API响应
   * @param defaultValue 默认值
   * @returns 响应数据或默认值
   */
  static safeUnwrap<T>(response: ApiResponse<T>, defaultValue: T): T {
    if (this.isSuccess(response)) {
      return response.data!
    }
    return defaultValue
  }
}

/**
 * 异步处理API响应的辅助函数
 * @param responsePromise API响应Promise
 * @returns 解包后的数据Promise
 */
export async function unwrapResponse<T>(responsePromise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await responsePromise
  return ApiResponseHandler.unwrap(response)
}
