import type { ButtonHTMLAttributes, ReactNode } from 'react'
import s from './Button.module.scss'

type ButtonProps = {
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
} & ButtonHTMLAttributes<HTMLButtonElement>
export const Button: React.FC<ButtonProps> = props => {
  const { children, size, ...rest } = props
  const cls = [s.button, s[size || 'medium']].join(' ')
  return (
    <button type="button" className={cls} {...rest}
      bg-blue text-white b-rounded-1 disabled-bg-gray>
      {children}
    </button>
  )
}

Button.defaultProps = {
  size: 'medium',
}
