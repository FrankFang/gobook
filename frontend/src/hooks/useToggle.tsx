import { useState, useCallback } from 'react'

export const useToggle = (initialValue: boolean) => {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback((value: boolean) => {
    setValue(v => (value === undefined ? !v : value))
  }, [])
  return [value, toggle] as const
}
