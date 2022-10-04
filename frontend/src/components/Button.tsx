import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
} & ButtonHTMLAttributes<HTMLButtonElement>
export const Button: React.FC<ButtonProps> = props => {
  const { children, size, ...rest } = props
  switch (size) {
    case 'small':
      return (
        <button type="button" h-24px bg-blue text-white pl-2 pr-2 b-rounded-1 disabled-bg-gray {...rest}>
          {children}
        </button>
      )
    case 'medium':
      return (
        <button type="button" h-40px bg-blue text-white pl-4 pr-4 b-rounded-1 disabled-bg-gray {...rest}>
          {children}
        </button>
      )
    case 'large':
      return (
        <button type="button" h-64px bg-blue text-white pl-4 pr-4 b-rounded-1 disabled-bg-gray {...rest}>
          {children}
        </button>
      )
    default:
      return null
  }
}

Button.defaultProps = {
  size: 'medium',
}
