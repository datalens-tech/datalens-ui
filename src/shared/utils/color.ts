import chroma from 'chroma-js';

export function getColorBrightness(hex: string) {
    return chroma(hex).luminance();
}
