import { defineConfig, presetIcons, presetUno, presetAttributify, transformerAttributifyJsx } from 'unocss'
import colors from 'windicss/colors'

export default defineConfig({
  theme: {
    colors: {
      gray: {
        ...colors.gray,
        250: '#efefef',
      },
    },
  },
  shortcuts: {},
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [
    transformerAttributifyJsx()
  ],
})
