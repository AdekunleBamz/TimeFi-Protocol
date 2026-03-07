import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'TimeFiSDK',
            fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'js'}`,
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ['@stacks/transactions', '@stacks/network'],
            output: {
                globals: {
                    '@stacks/transactions': 'StacksTransactions',
                    '@stacks/network': 'StacksNetwork',
                },
            },
        },
    },
});
