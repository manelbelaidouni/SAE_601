import { defineConfig, defaultExclude } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        exclude: [...defaultExclude, 'tests/e2e.test.js'],
    },
});
