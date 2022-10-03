import create from 'zustand'
import produce from 'immer'

type Store = {
  user: User
  increaseAge: () => void
  decreaseAge: () => void
}

export const useMe = create<Store>(set => ({
  user: {
    age: 0,
    name: 'frank',
  },
  increaseAge() {
    set(
      produce(state => {
        state.user.age += 1
      })
    )
  },
  decreaseAge() {
    set(
      produce(state => {
        state.user.age -= 1
      })
    )
  },
}))
