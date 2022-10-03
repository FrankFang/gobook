import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const createStore = <T extends unknown>(fn: Parameters<typeof immer<T>>[0]) => create(immer<T>(fn))
