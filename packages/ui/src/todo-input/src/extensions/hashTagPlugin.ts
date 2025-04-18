import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view'

class TagWidget extends WidgetType {
  constructor(readonly tag: string) {
    super()
  }

  // 返回的 DOM 元素可以根据需要自定义样式，保证看起来与标签一致
  toDOM() {
    const span = document.createElement('span')
    span.textContent = this.tag
    span.className = 'cm-hashtag'
    return span
  }
}

class HashTagPlugin {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view)
    }
  }

  private buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()
    const doc = view.state.doc
    const text = doc.sliceString(0, doc.length)
    // 匹配 # 开头后面跟字母、中文、数字或下划线的单词，后面跟着空白
    const regex = /#[\p{L}\p{N}\p{P}]+(?=\s)/gu
    let match = regex.exec(text)
    while (match !== null) {
      const start = match.index
      const end = start + match[0].length
      // 用 replace 装饰器替换原来的文字
      const widget = Decoration.replace({
        widget: new TagWidget(match[0]),
        atomic: true,
        inclusiveLeft: true,
        inclusiveRight: true,
      })
      builder.add(start, end, widget)
      match = regex.exec(text)
    }
    return builder.finish()
  }
}

// 创建一个 ViewPlugin 类，实现对文档中 hashtag 的扫描与装饰
export const hashTagPlugin = ViewPlugin.fromClass(HashTagPlugin, {
  decorations: v => v.decorations,
  provide: plugin => EditorView.atomicRanges.of(view => view.plugin(plugin)?.decorations ?? Decoration.none),
})
