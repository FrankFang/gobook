import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>
export const Button: React.FC<ButtonProps> = props => {
  const { children, ...rest } = props
  return (
    <button type="button" h-40px bg-blue text-white pl-4 pr-4 b-rounded-1
      disabled-bg-gray
      {...rest}
    >
      {children}
    </button>
  )
}
