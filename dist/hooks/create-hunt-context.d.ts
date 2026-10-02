import { type ReactNode } from 'react';
type ProviderProps<P> = P & {
    children: ReactNode;
};
/**
 * The host's `createAppContext`, restated so this folder imports nothing from
 * the app it is dropped into: a hook that builds the value from the
 * provider's props, and a consumer that reads it.
 */
export declare function createHuntContext<T, P extends object>(useValue: (props: P) => T): readonly [() => T, (props: ProviderProps<P>) => ReactNode];
export {};
