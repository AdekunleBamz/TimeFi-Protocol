import { useState, useEffect, useCallback } from 'react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

/**
 * Hook for fetching the current Stacks block height.
 *
 * Polls the Hiro API every 60 seconds and exposes the latest block height,
 * loading state, error, and a manual refetch function.
 *
 * @returns {{ blockHeight: number|null, loading: boolean, error: string|null, refetch: Function }}
 */
export function useBlockHeight() {
    const [blockHeight, setBlockHeight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBlockHeight = useCallback(async () => {
        try {
            const network = import.meta.env.VITE_NETWORK === 'mainnet'
                ? new StacksMainnet()
                : new StacksTestnet();

            const response = await fetch(`${network.coreApiUrl}/extended/v1/block?limit=1`);
            if (!response.ok) {
                throw new Error(`Block height fetch failed: ${response.status}`);
            }
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                setBlockHeight(data.results[0].height);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch block height:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlockHeight();

        // Poll every 60 s to keep block height reasonably current
        const interval = setInterval(fetchBlockHeight, 60000);
        return () => clearInterval(interval);
    }, [fetchBlockHeight]);

    return { blockHeight, loading, error, refetch: fetchBlockHeight };
}

export default useBlockHeight;
