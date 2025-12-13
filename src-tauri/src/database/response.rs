use serde::{Deserialize, Serialize};

/// 统一的API响应结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    /// 响应状态码：200表示成功，其他表示失败
    pub code: u16,
    /// 响应消息
    pub message: String,
    /// 响应数据，成功时包含实际数据，失败时为null
    pub data: Option<T>,
    /// 响应时间戳
    pub timestamp: i64,
}

impl<T> ApiResponse<T> {
    /// 创建成功响应
    pub fn success(data: T) -> Self {
        Self {
            code: 200,
            message: "success".to_string(),
            data: Some(data),
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
    
    /// 创建成功响应，带自定义消息
    pub fn success_with_message(data: T, message: String) -> Self {
        Self {
            code: 200,
            message,
            data: Some(data),
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
}

impl<T> ApiResponse<T> {
    /// 创建失败响应
    pub fn error(code: u16, message: String) -> Self {
        Self {
            code,
            message,
            data: None,
            timestamp: chrono::Utc::now().timestamp(),
        }
    }
    
    /// 创建内部服务器错误响应
    pub fn internal_error(message: String) -> Self {
        Self::error(500, message)
    }
    
    /// 创建参数错误响应
    pub fn bad_request(message: String) -> Self {
        Self::error(400, message)
    }
    
    /// 创建未找到响应
    pub fn not_found(message: String) -> Self {
        Self::error(404, message)
    }
}

/// 从Result类型转换为ApiResponse
impl<T, E> From<Result<T, E>> for ApiResponse<T>
where
    E: std::fmt::Display,
{
    fn from(result: Result<T, E>) -> Self {
        match result {
            Ok(data) => ApiResponse::success(data),
            Err(error) => ApiResponse::internal_error(error.to_string()),
        }
    }
}