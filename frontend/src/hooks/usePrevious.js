import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to store previous value of a variable
 */
export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

/**
 * Hook to detect if a value has changed
 */
export function useHasChanged(value) {
    const prevValue = usePrevious(value);
    return prevValue !== undefined && prevValue !== value;
}

/**
 * Hook to execute a callback when a value changes
 */
export function useValueChange(value, callback) {
    const prevValue = usePrevious(value);
    useEffect(() => {
        if (prevValue !== undefined && prevValue !== value) {
            if (typeof callback === 'function') {
                callback(value, prevValue);
            }
        }
    }, [value, prevValue, callback]);
}

/**
 * Hook for managing history (undo/redo)
 */
export function useUndoRedo(initialState) {
    const [state, setState] = useState(initialState);
    const [history, setHistory] = useState([initialState]);
    const [pointer, setPointer] = useState(0);

    const set = useCallback((newState) => {
        const value = typeof newState === 'function' ? newState(state) : newState;
        const newHistory = history.slice(0, pointer + 1);
        newHistory.push(value);
        setHistory(newHistory);
        setPointer(newHistory.length - 1);
        setState(value);
    }, [history, pointer, state]);

    const undo = useCallback(() => {
        if (pointer > 0) {
            const newPointer = pointer - 1;
            setPointer(newPointer);
            setState(history[newPointer]);
        }
    }, [history, pointer]);

    const redo = useCallback(() => {
        if (pointer < history.length - 1) {
            const newPointer = pointer + 1;
            setPointer(newPointer);
            setState(history[newPointer]);
        }
    }, [history, pointer]);

    const reset = useCallback(() => {
        setState(initialState);
        setHistory([initialState]);
        setPointer(0);
    }, [initialState]);

    const jumpTo = useCallback((index) => {
        const targetIndex = Number(index);
        if (!Number.isInteger(targetIndex)) return;
        if (targetIndex < 0 || targetIndex >= history.length) return;
        setPointer(targetIndex);
        setState(history[targetIndex]);
    }, [history]);

    return [state, { set, undo, redo, reset, jumpTo, canUndo: pointer > 0, canRedo: pointer < history.length - 1 }];
}

/**
 * Mock for useHistory (often provided by react-router, but here as a utility)
 */
export function useHistory() {
    if (typeof window === 'undefined') {
      return { push: () => {}, replace: () => {}, goBack: () => {}, goForward: () => {} };
    }
    return {
        push: (path) => window.history.pushState({}, null, path),
        replace: (path) => window.history.replaceState({}, null, path),
        goBack: () => window.history.back(),
      goForward: () => window.history.forward(),
    };
}
