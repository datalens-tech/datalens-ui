import {isEntryId, isSystemGradientPaletteId, isSystemPaletteId} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';

export const isCustomColorPaletteId = (value: string) => {
    const getAvailablePalettesMap = registry.common.functions.get('getAvailablePalettesMap');

    const isSystem =
        isSystemGradientPaletteId(value) || isSystemPaletteId(value, getAvailablePalettesMap());

    return !isSystem && isEntryId(value);
};
