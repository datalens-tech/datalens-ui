class Performance {
    static mark(name: string) {
        window.performance.mark(`${name}-mark`);
    }

    static getDuration(name: string) {
        const measureName = `${name}-measure`;

        window.performance.measure(measureName, `${name}-mark`);

        const entry = window.performance.getEntriesByName(measureName)[0];

        if (entry) {
            return entry.duration;
        }

        console.warn(
            'ChartKit',
            'Performance',
            'getDuration',
            `Measure name '${measureName}' does not exist`,
        );

        return null;
    }
}

export default Performance;
