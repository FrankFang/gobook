import { defineConfig, presetAttributify, presetIcons, presetTypography, presetUno, transformerAttributifyJsx } from 'unocss'
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
  shortcuts: {
    'layout-wrapper': 'h-screen flex flex-nowrap',
    'layout-aside': 'w-20em h-screen shrink-0 flex flex-col',
    'layout-panels': 'grow-1 flex flex-col justify-start overflow-hidden',
    'layout-panel': 'overflow-hidden flex flex-col grow-0 shrink-0',
    'layout-footer': 'p-16px shrink-0 flex items-center gap-x-2',
    'layout-panel-header': 'lh-24px py-12px bg-gray-250 text-20px px-16px shrink-0',
    'layout-main': 'grow-1 bg-gray-250',
    'x-input': 'h-40px w-20em b-rounded-1 pl-2 pr-2',
    'x-form': 'flex flex-col',
    'x-form-label': 'h-40px lh-40px flex gap-x-1em',
    'input-error': 'text-red-500 b-1 b-red-500',
    'text-error': 'text-red-500',
  },
  safelist: 'grow-0 grow-1 shrink-0 shrink-1'.split(' '),
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: { 'display': 'inline-block', 'vertical-align': 'middle' },
    }),
    presetTypography(),
  ],
  transformers: [
    transformerAttributifyJsx()
  ],
})
