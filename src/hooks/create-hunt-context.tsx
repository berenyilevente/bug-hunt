'use client';

import { createContext, useContext, type ReactNode } from 'react';

type ProviderProps<P> = P & { children: ReactNode };

/**
 * The host's `createAppContext`, restated so this folder imports nothing from
 * the app it is dropped into: a hook that builds the value from the
 * provider's props, and a consumer that reads it.
 */
export function createHuntContext<T, P extends object>(
  useValue: (props: P) => T
): readonly [() => T, (props: ProviderProps<P>) => ReactNode] {
  const Context = createContext<T | null>(null);

  function Provider({ children, ...props }: ProviderProps<P>): ReactNode {
    return (
      <Context.Provider value={useValue(props as unknown as P)}>
        {children}
      </Context.Provider>
    );
  }

  function useHuntContext(): T {
    const value = useContext(Context);

    if (value === null) {
      throw new Error('bug hunt context used outside its provider');
    }

    return value;
  }

  return [useHuntContext, Provider] as const;
}
