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
    if (colorIndex) {
        return currentColors[colorIndex];
    }

    if (color) {
        return color;
    }

    return currentColors[fallbackIndex];
}
