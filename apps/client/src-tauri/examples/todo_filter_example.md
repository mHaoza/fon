# Todo列表筛选和分页功能使用示例

## 概述

新增的 `get_todo_list_with_filter` 功能支持以下特性：

- ✅ **分页查询**：支持 page 和 page_size 参数
- ✅ **标签筛选**：支持单个或多个标签过滤
- ✅ **分类筛选**：根据 category 字段过滤
- ✅ **完成状态筛选**：根据 is_done 状态过滤
- ✅ **多字段排序**：支持按 created_at、updated_at、title、date、is_done 排序
- ✅ **排序方向**：支持 asc 和 desc 排序

## API 接口

### Rust 端调用

```rust
use fon_lib::database::todo::{TodoListQuery, TodoListResult};

let query = TodoListQuery {
    page: Some(1),              // 第1页
    page_size: Some(20),        // 每页20条
    tags: Some(vec!["工作".to_string(), "重要".to_string()]),  // 标签筛选
    category: Some("项目".to_string()),  // 分类筛选
    is_done: Some(false),       // 只查询未完成的
    sort_by: Some("created_at".to_string()),    // 按创建时间排序
    sort_order: Some("desc".to_string()),       // 降序排列
};

let result: TodoListResult = repo.get_todo_list_with_filter(query).await?;

// 结果包含：
// result.data: Vec<Todo>      - 数据列表
// result.total: u32           - 总记录数
// result.page: u32            - 当前页码
// result.page_size: u32       - 每页大小
// result.total_pages: u32     - 总页数
```

### Tauri 命令调用

```typescript
import { invoke } from '@tauri-apps/api/tauri'

interface TodoListQuery {
  page?: number
  page_size?: number
  tags?: string[]
  category?: string
  is_done?: boolean
  sort_by?: string
  sort_order?: string
}

interface TodoListResult {
  data: Todo[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 方式1：不传参数，查询所有数据（不分页）
const allTodos = await invoke<TodoListResult>('get_todo_list_with_filter', {
  query: null // 或者不传query参数
})

// 方式2：传空对象，不分页
const defaultResult = await invoke<TodoListResult>('get_todo_list_with_filter', {
  query: {}
})

// 方式3：只设置筛选条件，不分页
const filteredAll = await invoke<TodoListResult>('get_todo_list_with_filter', {
  query: {
    tags: ['工作'],
    is_done: false
    // 没有 page 和 page_size，所以不分页
  }
})

// 基本分页查询
const result = await invoke<TodoListResult>('get_todo_list_with_filter', {
  query: {
    page: 1,
    page_size: 10
  }
})

// 标签筛选
const workTodos = await invoke<TodoListResult>('get_todo_list_with_filter', {
  query: {
    page: 1,
    page_size: 20,
    tags: ['工作', '重要']
  }
})

// 组合筛选
const personalCompletedTodos = await invoke<TodoListResult>('get_todo_list_with_filter', {
  query: {
    page: 1,
    page_size: 10,
    tags: ['个人'],
    category: '生活',
    is_done: true,
    sort_by: 'updated_at',
    sort_order: 'desc'
  }
})
```

## 使用场景示例

### 0. 查询所有数据（无分页）

```rust
// 使用默认参数查询所有数据（不分页）
let query = TodoListQuery::default();
let result = repo.get_todo_list_with_filter(query).await?;
// result.page_size 将等于 total，total_pages 为 1

// 或者不提供任何分页参数
let query = TodoListQuery {
    page: None,  // 不分页
    page_size: None,  // 不分页
    tags: Some(vec!["工作".to_string()]),
    // 其他筛选条件...
    ..Default::default()
};
let result = repo.get_todo_list_with_filter(query).await?;

// 前端调用：invoke('get_todo_list_with_filter', { query: null })
// 或者：invoke('get_todo_list_with_filter', { query: {} })
```

### 1. 基本分页

```rust
let query = TodoListQuery {
    page: Some(1),
    page_size: Some(10),
    ..Default::default()
};
```

### 2. 标签筛选

```rust
// 查询包含"工作"标签的所有任务
let query = TodoListQuery {
    tags: Some(vec!["工作".to_string()]),
    ..Default::default()
};

// 查询同时包含"工作"和"重要"标签的任务
let query = TodoListQuery {
    tags: Some(vec!["工作".to_string(), "重要".to_string()]),
    ..Default::default()
};
```

### 3. 分类和状态筛选

```rust
// 查询"项目"分类下的未完成任务
let query = TodoListQuery {
    category: Some("项目".to_string()),
    is_done: Some(false),
    ..Default::default()
};
```

### 4. 排序

```rust
// 按标题升序排列
let query = TodoListQuery {
    sort_by: Some("title".to_string()),
    sort_order: Some("asc".to_string()),
    ..Default::default()
};

// 按更新时间降序排列
let query = TodoListQuery {
    sort_by: Some("updated_at".to_string()),
    sort_order: Some("desc".to_string()),
    ..Default::default()
};
```

### 5. 高级组合查询

```rust
// 查询个人分类下，包含"紧急"标签，未完成的任务，按日期排序
let query = TodoListQuery {
    page: Some(1),
    page_size: Some(15),
    tags: Some(vec!["紧急".to_string()]),
    category: Some("个人".to_string()),
    is_done: Some(false),
    sort_by: Some("date".to_string()),
    sort_order: Some("asc".to_string()),
};
```

## 性能特性

### ORM 框架优势

1. **动态查询构建**：根据筛选条件动态构建SQL查询，避免不必要的全表扫描
2. **高效的JOIN查询**：标签筛选使用INNER JOIN和HAVING子句，确保精确匹配
3. **分页优化**：使用LIMIT和OFFSET进行数据库级分页，减少内存占用
4. **索引友好**：查询语句设计考虑了常用字段的索引优化

### 查询优化建议

建议为以下字段添加索引以提升查询性能：

```sql
-- 基础索引
CREATE INDEX IF NOT EXISTS idx_todos_is_deleted ON todos(is_deleted);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON todos(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_is_done ON todos(is_done);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);

-- 标签查询索引
CREATE INDEX IF NOT EXISTS idx_todo_tags_todo_id ON todo_tags(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_tags_tag_id ON todo_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
```

## 默认行为

当参数为空或不提供分页参数时，系统使用以下默认值：

### 分页行为

- **无分页参数**：当 `page` 和 `page_size` 都为 `None` 时，不进行分页，返回所有符合条件的数据
- **部分分页参数**：只要提供了 `page` 或 `page_size` 中的任意一个，就会启用分页
  - `page`: 默认1
  - `page_size`: 默认20（最大限制100）

### 其他默认值

- `sort_by`: "created_at"
- `sort_order`: "desc"
- `tags`: None（不筛选）
- `category`: None（不筛选）
- `is_done`: None（不筛选）

### 示例说明

```rust
// 情况1：不分页，返回所有数据
let query = TodoListQuery {
    page: None,
    page_size: None,
    // 其他筛选条件...
    ..Default::default()
};
// 结果：page=1, page_size=total, total_pages=1

// 情况2：使用分页
let query = TodoListQuery {
    page: Some(2),
    page_size: Some(5),
    // 其他筛选条件...
    ..Default::default()
};
// 结果：page=2, page_size=5, 正常分页逻辑

// 情况3：只提供 page_size，仍然启用分页
let query = TodoListQuery {
    page: None,  // 会使用默认值 1
    page_size: Some(10),
    ..Default::default()
};
// 结果：page=1, page_size=10, 正常分页逻辑
```

## 错误处理

- 页码小于1时自动设为1
- 页面大小超过100时自动限制为100
- 无效的排序字段会回退到"created_at"
- 无效的排序方向会回退到"desc"
