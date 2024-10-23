module.exports = {
    validate: {
        // add webpack plugin with rules
        plugins: ['@statoscope/webpack'],
        reporters: [
            // console-reporter to output results into console (enabled by default)
            '@statoscope/console',
            // reporter that generates UI-report with validation-results
            ['@statoscope/stats-report', {saveReportTo: 'report/statoscope/index.html'}],
        ],
        // rules to validate your stats (use all of them or only specific rules)
        rules: {
            // ensures that bundle hasn't package duplicates
            '@statoscope/webpack/no-packages-dups': [
                'warn',
                {
                    exclude: [],
                },
            ],
            // ensure that the download size of entrypoints is not over the limit (10 mb)
            '@statoscope/webpack/entry-download-size-limits': [
                'error',
                {global: {maxSize: 20 * 1024 * 1024}},
            ],
            // diff download size of entrypoints between input and reference stats. Fails if size diff is over the limit (10 kb)
            '@statoscope/webpack/diff-entry-download-size-limits': [
                'warning',
                {global: {maxInitialSizeDiff: 10 * 1024}},
            ],
            // diff download time of entrypoints between input and reference stats. Fails if download time is over the limit (500 ms)
            '@statoscope/webpack/diff-entry-download-time-limits': [
                'warning',
                {global: {maxInitialDownloadTimeDiff: 500}},
            ],
            // compares usage of specified packages usage between input and reference stats.
            '@statoscope/webpack/diff-deprecated-packages': ['error', ['moment']],
        },
    },
};
