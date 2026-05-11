import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * usePrevious - Stores the previous value of a variable.
 *
 * Returns `undefined` on the first render, then the value from the previous
 * render on all subsequent renders.
 *
 * @template T
 * @param {T} value - The value to track
 * @returns {T|undefined} The value from the previous render
 */
export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

/**
 * useHasChanged - Returns true when the tracked value differs from its previous render.
 *
 * @template T
 * @param {T} value - Value to monitor for changes
 * @returns {boolean} `true` if the value changed since the last render
 */
export function useHasChanged(value) {
    const prevValue = usePrevious(value);
    return prevValue !== undefined && prevValue !== value;
}

/**
 * useValueChange - Executes a callback whenever the tracked value changes.
 *
 * Does not fire on the initial render — only on subsequent changes.
 *
 * @template T
 * @param {T} value - Value to watch for changes
 * @param {Function} callback - Called with `(newValue, previousValue)` on change
 */
export function useValueChange(value, callback) {
    const prevValue = usePrevious(value);
    useEffect(() => {
        if (prevValue !== undefined && prevValue !== value) {
            callback(value, prevValue);
        }
    }, [value, prevValue, callback]);
}

/**
 * useUndoRedo - Manages a value with undo/redo history.
 *
 * Tracks a history stack and a pointer so callers can step backward
 * (undo) and forward (redo) through previous states.
 *
 * @template T
 * @param {T} initialState - Starting state value
 * @returns {{ state: T, set: Function, undo: Function, redo: Function, canUndo: boolean, canRedo: boolean }}
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

    return [state, { set, undo, redo, canUndo: pointer > 0, canRedo: pointer < history.length - 1 }];
}

/**
 * Mock for useHistory (often provided by react-router, but here as a utility)
 */
export function useHistory() {
    return {
        push: (path) => window.history.pushState({}, '', path),
        replace: (path) => window.history.replaceState({}, '', path),
        goBack: () => window.history.back(),
    };
}
