export const confirmable
  = (fn: (...args: any[]) => any) =>
    (...args: any[]) =>
      (window.confirm('确定要执行此操作吗？'))
        && fn(...args)

