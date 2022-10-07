import { defineConfig, presetAttributify, presetIcons, presetUno, transformerAttributifyJsx } from 'unocss'
import colors from 'windicss/colors'

export default defineConfig({
  theme: {
    colors: {
      gray: {
        ...(colors.gray as Record<string, string>),
        250: '#efefef',
      },
    },
  },
  shortcuts: {},
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: { 'display': 'inline-block', 'vertical-align': 'middle' },
    }),
  ],
  transformers: [
    transformerAttributifyJsx()
  ],
})
