import type {AppContext} from '@gravity-ui/nodekit';

const getCurrentTimeMs = () => {
    const t = process.hrtime();
    return t[0] * 1e3 + t[1] / 1e6;
};

const getMemoryUsage = () => {
    const result: Record<string, string> = {};
    const memoryUsed = process.memoryUsage();

    Object.keys(memoryUsed).forEach((key) => {
        result[key] = `${
            Math.round((memoryUsed[key as keyof NodeJS.MemoryUsage] / 1024 / 1024) * 100) / 100
        } MB`;
    });

    return result;
};

export const startMonitoring = (timeoutMs: number, ctx: AppContext) => {
    ctx.log('START_MONITORING', {
        timeout: `${timeoutMs} ms`,
    });

    let startTimeMs = getCurrentTimeMs();

    let timeout = setTimeout(check, timeoutMs);
    timeout.unref();

    function check() {
        clearTimeout(timeout);

        const checkTimeMs = getCurrentTimeMs();

        const delay = Math.max(0, checkTimeMs - startTimeMs - timeoutMs);

        const memoryUsage = getMemoryUsage();

        startTimeMs = checkTimeMs;

        ctx.log('MONITORING_VALUE', {
            eventLoopLag: `${delay.toFixed(4)} ms`,
            memoryUsage,
        });

        timeout = setTimeout(check, timeoutMs);
        timeout.unref();
    }
};
