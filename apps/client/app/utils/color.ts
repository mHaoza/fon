// 根据文字hash计算颜色
export function getTagColor(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 生成柔和的颜色
  const hue = Math.abs(hash) % 360
  const saturation = 45 + (Math.abs(hash) % 30) // 45-75%
  const lightness = 85 + (Math.abs(hash) % 10) // 85-95%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
