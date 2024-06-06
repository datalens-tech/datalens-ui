import type {Field, Shared} from 'shared';

export function filterVisualizationColors(colors: Field[], visualization: Shared['visualization']) {
    let updatedColors = [...colors];
    if (visualization?.checkAllowedDesignItems) {
        updatedColors = updatedColors.filter((color, index, list) =>
            visualization?.checkAllowedDesignItems?.({
                item: color,
                designItems: list.slice(0, index),
                visualization,
            }),
        );
    }

    return updatedColors;
}
