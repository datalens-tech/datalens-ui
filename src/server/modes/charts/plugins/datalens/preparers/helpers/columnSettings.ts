import type {ColumnSettings} from '../../../../../../../shared';

export const getColumnWidthValue = (
    width: ColumnSettings['width'] | undefined,
): string | undefined => {
    switch (width?.mode) {
        case 'auto':
            return undefined;
        case 'percent':
            return `${width.value}%`;
        case 'pixel':
            return `${width.value}px`;
        default:
            return undefined;
    }
};
