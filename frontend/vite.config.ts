import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import unocss from '@unocss/vite'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import colors from 'windicss/colors'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    unocss({
      theme: {
        colors: {
          gray: {
            ...(colors.gray as Record<string | number, string>),
            250: '#efefef',
          },
        },
      },
      shortcuts: {},
      presets: [
        presetUno(),
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
    }),
    react(),
  ],
})
