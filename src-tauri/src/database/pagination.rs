use serde::{Deserialize, Serialize};
use rbatis::RBatis;
use anyhow::Result;

/// 通用分页查询参数
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationQuery {
    /// 页码，从1开始
    pub page: Option<u32>,
    /// 每页大小
    pub page_size: Option<u32>,
    /// 排序字段
    pub sort_by: Option<String>,
    /// 排序方向，asc 或 desc
    pub sort_order: Option<String>,
}

impl Default for PaginationQuery {
    fn default() -> Self {
        Self {
            page: None,
            page_size: None,
            sort_by: None,
            sort_order: Some("desc".to_string()),
        }
    }
}

/// 通用分页结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationResult<T> {
    /// 数据列表
    pub data: Vec<T>,
    /// 总记录数
    pub total: u32,
    /// 当前页码
    pub page: u32,
    /// 每页大小
    pub page_size: u32,
    /// 总页数
    pub total_pages: u32,
}

impl<T> PaginationResult<T> {
    /// 创建分页结果
    pub fn new(data: Vec<T>, total: u32, page: u32, page_size: u32) -> Self {
        let total_pages = if page_size > 0 {
            (total + page_size - 1) / page_size
        } else {
            1
        };
        
        Self {
            data,
            total,
            page,
            page_size,
            total_pages,
        }
    }
    
    /// 创建无分页结果（返回所有数据）
    pub fn all(data: Vec<T>) -> Self {
        let total = data.len() as u32;
        Self {
            data,
            total,
            page: 1,
            page_size: total,
            total_pages: 1,
        }
    }
}

/// 筛选条件构建器
#[derive(Debug, Clone)]
pub struct FilterBuilder {
    conditions: Vec<String>,
    params: Vec<rbs::Value>,
}

impl FilterBuilder {
    /// 创建新的筛选构建器
    pub fn new() -> Self {
        Self {
            conditions: Vec::new(),
            params: Vec::new(),
        }
    }
    
    /// 添加等值条件
    pub fn eq(mut self, field: &str, value: impl Into<rbs::Value>) -> Self {
        self.conditions.push(format!("{} = ?", field));
        self.params.push(value.into());
        self
    }
    
    /// 添加不等值条件
    pub fn ne(mut self, field: &str, value: impl Into<rbs::Value>) -> Self {
        self.conditions.push(format!("{} != ?", field));
        self.params.push(value.into());
        self
    }
    
    /// 添加IN条件
    pub fn r#in(mut self, field: &str, values: Vec<impl Into<rbs::Value>>) -> Self {
        if !values.is_empty() {
            let placeholders = values.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            self.conditions.push(format!("{} IN ({})", field, placeholders));
            for value in values {
                self.params.push(value.into());
            }
        }
        self
    }
    
    /// 添加LIKE条件
    pub fn like(mut self, field: &str, pattern: impl Into<rbs::Value>) -> Self {
        self.conditions.push(format!("{} LIKE ?", field));
        self.params.push(pattern.into());
        self
    }
    
    /// 添加自定义条件
    pub fn custom(mut self, condition: String, params: Vec<impl Into<rbs::Value>>) -> Self {
        self.conditions.push(condition);
        for param in params {
            self.params.push(param.into());
        }
        self
    }
    
    /// 构建WHERE子句
    pub fn build_where_clause(&self) -> (String, Vec<rbs::Value>) {
        if self.conditions.is_empty() {
            (String::new(), Vec::new())
        } else {
            (format!(" WHERE {}", self.conditions.join(" AND ")), self.params.clone())
        }
    }
    
    /// 获取参数
    pub fn params(self) -> Vec<rbs::Value> {
        self.params
    }
}

impl Default for FilterBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// 分页筛选器trait
pub trait PaginationFilter {
    /// 获取基础表名
    fn table_name(&self) -> &str;
    
    /// 获取主键字段名
    fn primary_key(&self) -> &str {
        "id"
    }
    
    /// 构建筛选条件
    fn build_filter(&self) -> FilterBuilder;
    
    /// 获取有效的排序字段
    fn valid_sort_fields(&self) -> Vec<&str>;
    
    /// 获取默认排序字段
    fn default_sort_field(&self) -> &str {
        "created_at"
    }
}

/// 通用分页查询器
pub struct PaginationQueryBuilder<'a, T> {
    rb: &'a RBatis,
    filter: Box<dyn PaginationFilter + Send + Sync>,
    _phantom: std::marker::PhantomData<T>,
}

impl<'a, T> PaginationQueryBuilder<'a, T> 
where
    T: serde::de::DeserializeOwned + Send + Sync,
{
    /// 创建新的分页查询构建器
    pub fn new(rb: &'a RBatis, filter: Box<dyn PaginationFilter + Send + Sync>) -> Self {
        Self {
            rb,
            filter,
            _phantom: std::marker::PhantomData,
        }
    }
    
    /// 执行分页查询
    pub async fn execute(&self, query: PaginationQuery) -> Result<PaginationResult<T>> {
        let filter = self.filter.as_ref();
        let filter_builder = filter.build_filter();
        let (where_clause, params) = filter_builder.build_where_clause();
        
        // 构建排序
        let sort_by = query.sort_by.as_deref().unwrap_or(filter.default_sort_field());
        let sort_order = query.sort_order.as_deref().unwrap_or("desc");
        let valid_sort_fields = filter.valid_sort_fields();
        
        let sort_field = if valid_sort_fields.contains(&sort_by) {
            sort_by
        } else {
            filter.default_sort_field()
        };
        
        let order_direction = if sort_order == "asc" { "ASC" } else { "DESC" };
        let order_clause = format!(" ORDER BY {}.{} {}", filter.table_name(), sort_field, order_direction);
        
        // 检查是否需要分页
        if let (Some(page), Some(page_size)) = (query.page, query.page_size) {
            if page > 0 && page_size > 0 {
                let offset = (page - 1) * page_size;
                let limit_clause = format!(" LIMIT {} OFFSET {}", page_size, offset);
                
                // 构建查询SQL
                let select_sql = format!(
                    "SELECT * FROM {} {}{}{}",
                    filter.table_name(),
                    where_clause,
                    order_clause,
                    limit_clause
                );
                
                // 构建计数SQL
                let count_sql = format!(
                    "SELECT COUNT(*) as total FROM {} {}",
                    filter.table_name(),
                    where_clause
                );
                
                // 执行计数查询
                let count_rows: Vec<serde_json::Value> = self.rb.query_decode(&count_sql, params.clone()).await?;
                let total = count_rows.first()
                    .and_then(|row| row.get("total"))
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0) as u32;
                
                // 执行数据查询
                let data: Vec<T> = self.rb.query_decode(&select_sql, params).await?;
                
                Ok(PaginationResult::new(data, total, page, page_size))
            } else {
                // 分页参数无效，返回所有数据
                self.execute_all(where_clause, params, order_clause).await
            }
        } else {
            // 无分页参数，返回所有数据
            self.execute_all(where_clause, params, order_clause).await
        }
    }
    
    /// 执行无分页查询
    async fn execute_all(&self, where_clause: String, params: Vec<rbs::Value>, order_clause: String) -> Result<PaginationResult<T>> {
        let filter = self.filter.as_ref();
        let select_sql = format!(
            "SELECT * FROM {} {}{}",
            filter.table_name(),
            where_clause,
            order_clause
        );
        
        let data: Vec<T> = self.rb.query_decode(&select_sql, params).await?;
        Ok(PaginationResult::all(data))
    }
}

/// 便捷方法：执行分页查询
pub async fn execute_pagination_query<T, F>(
    rb: &RBatis,
    filter: F,
    query: PaginationQuery,
) -> Result<PaginationResult<T>>
where
    T: serde::de::DeserializeOwned + Send + Sync,
    F: PaginationFilter + Send + Sync + 'static,
{
    let builder = PaginationQueryBuilder::new(rb, Box::new(filter));
    builder.execute(query).await
}
