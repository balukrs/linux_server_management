import { create } from 'zustand'

type State = {
  isConnected: boolean
}

type Action = {
  updateConnection: (data: State['isConnected']) => void
}

const useSocketStore = create<State & Action>((set) => ({
  isConnected: false,
  updateConnection: (data: boolean) => set(() => ({ isConnected: data })),
}))

export default useSocketStore
