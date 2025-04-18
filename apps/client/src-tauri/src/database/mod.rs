pub mod todo;

use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};
use tauri::AppHandle;

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(_app_handle: &AppHandle) -> Result<Self> {
        // 获取应用程序可执行文件所在目录
        let exe_dir = std::env::current_exe()
            .expect("Failed to get executable path")
            .parent()
            .expect("Failed to get executable directory")
            .to_path_buf();

        // 在应用程序目录下创建data目录
        let data_dir = exe_dir.join("data");
        std::fs::create_dir_all(&data_dir).expect("Failed to create data directory");

        let db_path = data_dir.join("todo.db");
        let conn = Connection::open(db_path)?;

        // 初始化数据库表
        Self::init_tables(&conn)?;

        Ok(Database {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    fn init_tables(conn: &Connection) -> Result<()> {
        // 初始化各个领域模块的表
        todo::init_tables(conn)?;

        Ok(())
    }

    pub fn get_connection(&self) -> std::sync::MutexGuard<Connection> {
        self.conn.lock().unwrap()
    }
}
