import classic from './common/classic-20';
import datalens from './common/datalens';
import default20 from './common/default-20';
import emerald from './common/emerald-20';
import golden from './common/golden-20';
import neutral from './common/neutral-20';
import oceanic from './common/oceanic-20';
import trafficLight from './common/traffic-light-9';
import {type Palette} from './types';

export * from './types';

export interface Palettes {
    color: string[];
    gradient: string[];
}

export const PALETTES = {
    default20,
    classic,
    neutral,
    golden,
    emerald,
    oceanic,
    trafficLight,
    datalens,
};

export const BASE_PALETTES_MAP: Record<string, Palette> = {
    [default20.id]: default20,
    [classic.id]: classic,
    [emerald.id]: emerald,
    [neutral.id]: neutral,
    [golden.id]: golden,
    [oceanic.id]: oceanic,
    [trafficLight.id]: trafficLight,
    [datalens.id]: datalens,
};

const sortPalettes = (palettes: string[], defaultPaletteId?: string) =>
    palettes.sort((a, b) => {
        if (a === defaultPaletteId) {
            return -1;
        }

        if (b === defaultPaletteId) {
            return 1;
        }

        return a.localeCompare(b);
    });

export const selectAvailablePalettes = ({
    palettes,
    defaultPaletteId,
}: {
    palettes: Record<string, Palette>;
    defaultPaletteId?: string;
}): Palettes => {
    const gradientPalettes: string[] = [];
    const colorPalettes: string[] = [];
    const datalensPalettes: string[] = [];

    const palettesIds = Object.keys(palettes);

    palettesIds.forEach((id: string) => {
        if (palettes[id].datalens) {
            datalensPalettes.push(id);
        } else if (palettes[id].gradient) {
            gradientPalettes.push(id);
        } else {
            colorPalettes.push(id);
        }
    });

    return {
        color: [
            ...sortPalettes(datalensPalettes, defaultPaletteId),
            ...sortPalettes(colorPalettes, defaultPaletteId),
        ],
        gradient: sortPalettes(gradientPalettes, defaultPaletteId),
    };
};

export const getAvailablePalettesMap = () => {
    return BASE_PALETTES_MAP;
};

export const getPalettesOrder = (): (keyof Palettes)[] => {
    return ['color', 'gradient'];
};

export const isSystemPaletteId = (paletteId: string, palettes: Record<string, Palette>) => {
    return Boolean(palettes[paletteId]);
};
