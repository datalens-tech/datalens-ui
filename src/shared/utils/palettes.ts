export function getColorByColorSettings({
    currentColors,
    colorIndex,
    color,
    fallbackIndex = 0,
}: {
    currentColors: string[];
    colorIndex?: number;
    color?: string;
    fallbackIndex?: number;
}) {
    if (typeof colorIndex === 'number') {
        return currentColors[colorIndex] || currentColors[fallbackIndex];
    }

    if (color) {
        return color;
    }

    return currentColors[fallbackIndex];
}
