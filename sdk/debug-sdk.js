import { TimeFiClient } from './src/index.js';

async function debug() {
    const client = new TimeFiClient('mainnet');
    console.log('Fetching TVL...');
    try {
        const result = await client.getTVL();
        console.log('Result type:', typeof result);
        console.log('Result value:', result);
        console.log('Is BigInt:', typeof result === 'bigint');
    } catch (e) {
        console.error('Error:', e);
    }
}

debug();
