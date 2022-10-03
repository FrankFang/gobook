import { defineConfig, presetAttributify } from 'unocss'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'

export default defineConfig({
  presets: [
    presetAttributify()
  ],
  transformers: [
    transformerAttributifyJsx()
  ],
})
