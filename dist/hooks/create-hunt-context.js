'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
/**
 * The host's `createAppContext`, restated so this folder imports nothing from
 * the app it is dropped into: a hook that builds the value from the
 * provider's props, and a consumer that reads it.
 */
export function createHuntContext(useValue) {
    const Context = createContext(null);
    function Provider({ children, ...props }) {
        return (_jsx(Context.Provider, { value: useValue(props), children: children }));
    }
    function useHuntContext() {
        const value = useContext(Context);
        if (value === null) {
            throw new Error('bug hunt context used outside its provider');
        }
        return value;
    }
    return [useHuntContext, Provider];
}
