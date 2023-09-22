export class StackTracePreparer {
    static prepare(trace: string) {
        const TRACE_STOP_LINES = [
            'ContextifyScript.Script.runInContext',
            'Object.exports.runInNewContext',
            'bluebird/js/release/debuggability.js',
            '/components/editor-engine/',
        ];
        const TRACE_SANDBOX_ENTRY_LINE = 'components/editor-engine/sandbox';

        const prepared = [];
        const lines = trace.trim().split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const containsStopLine = TRACE_STOP_LINES.some((stopLine) => line.includes(stopLine));
            if (containsStopLine) {
                break;
            }
            if (!line.includes(TRACE_SANDBOX_ENTRY_LINE)) {
                prepared.push(line);
            }
        }

        return prepared.join('\n');
    }
}
