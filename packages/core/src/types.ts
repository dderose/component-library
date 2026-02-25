export type Listener<T> = (state: T) => void;
export type Unsubscribe = () => void;

export interface ComponentLogic<TState> {
  getState(): TState;
  subscribe(listener: Listener<TState>): Unsubscribe;
  destroy(): void;
}
