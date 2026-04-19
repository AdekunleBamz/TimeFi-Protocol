import { useState, useEffect, useCallback } from 'react';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

/**
 * ACTIVE_NETWORK - Current network configuration from environment.
 * Determines which Stacks network API to query for block data.
 * @type {string}
 */
const ACTIVE_NETWORK =
    String(import.meta.env.VITE_NETWORK || 'mainnet').trim().toLowerCase() === 'mainnet'
        ? 'mainnet'
        : 'testnet';

/** How often to poll for new block data (in milliseconds). */
const BLOCK_POLL_INTERVAL_MS = 60_000;

/**
 * useBlockHeight - Fetch and poll current Stacks blockchain height.
 *
 * Provides real-time block height updates by polling the Hiro API
 * every 60 seconds. Used for lock timing calculations and display.
 *
 * @returns {{ blockHeight: number|null, loading: boolean, error: string|null, refetch: Function }}
 * @example
 * const { blockHeight, loading, error } = useBlockHeight();
 * if (loading) return <Spinner />;
 * return <div>Current block: #{blockHeight}</div>;
 */
export function useBlockHeight() {
    const [blockHeight, setBlockHeight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBlockHeight = useCallback(async () => {
        try {
            const network = ACTIVE_NETWORK === 'mainnet'
                ? new StacksMainnet()
                : new StacksTestnet();

            const response = await fetch(`${network.coreApiUrl}/extended/v1/block?limit=1`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

        // Poll every minute
        const interval = setInterval(fetchBlockHeight, BLOCK_POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchBlockHeight]);

    return { blockHeight, loading, error, refetch: fetchBlockHeight };
}

export default useBlockHeight;
