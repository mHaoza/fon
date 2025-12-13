import { presetIcons, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'
import { defineConfig } from 'unocss/vite'
import presetCustom from './config/unocss'
// import { themeVars } from "./src/theme/vars";

export default defineConfig({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist'],
    },
  },
  theme: {
    // ...themeVars,
    fontSize: {
      'icon-xs': '0.875rem',
      'icon-small': '1rem',
      'icon': '1.125rem',
      'icon-large': '1.5rem',
      'icon-xl': '2rem',
    },
  },
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm',
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetWind4(),
    presetIcons({ prefix: 'i-', warn: true }),
    presetCustom(),
  ],
})
