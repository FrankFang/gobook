export const Error: React.FC<{ value?: string[] }> = ({ value }) => {
  return value && value.length > 0
    ? <span text-error>{value.join(' ')}</span>
    : null
}
