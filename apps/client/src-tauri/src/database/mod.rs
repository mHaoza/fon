use std::sync::Arc;
use anyhow::Result;
use rbatis::RBatis;
use rbdc_sqlite::driver::SqliteDriver;

pub mod todo;
pub mod commands;
pub mod response;

pub use commands::DatabaseState;
pub use response::ApiResponse;

/// 数据库管理器
pub struct Database {
    pub rb: Arc<RBatis>,
}

impl Database {
    /// 创建数据库实例并初始化表
    pub async fn new() -> Result<Self> {
        let rb = RBatis::new();
        
        // 获取数据库文件路径
        let db_path = Self::get_database_path();
        let db_url = format!("sqlite://{}", db_path);
        
        // 初始化数据库连接
        rb.init(SqliteDriver {}, &db_url)?;
        
        let database = Self {
            rb: Arc::new(rb),
        };
        
        // 初始化数据库表
        database.init_tables().await?;
        
        Ok(database)
    }
    
    /// 获取数据库文件路径
    fn get_database_path() -> String {
        let exe_dir = std::env::current_exe()
            .and_then(|path| Ok(path.parent().unwrap().to_path_buf()))
            .unwrap_or_else(|_| std::env::current_dir().unwrap());
            
        let data_dir = exe_dir.join("data");
        
        // 确保数据目录存在
        if !data_dir.exists() {
            std::fs::create_dir_all(&data_dir).unwrap();
        }
        
        data_dir.join("todo.db").to_string_lossy().to_string()
    }
    
    /// 初始化数据库表
    async fn init_tables(&self) -> Result<()> {
        todo::init_tables(&self.rb).await?;
        Ok(())
    }
    
    /// 获取Todo仓储实例
    pub fn todo_repository(&self) -> todo::TodoRepository {
        todo::TodoRepository::new(self.rb.clone())
    }
}