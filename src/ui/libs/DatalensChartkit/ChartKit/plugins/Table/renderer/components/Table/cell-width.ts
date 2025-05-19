export function getCellsWidth(args: {
    cols: {min: number; fixed?: number}[];
    tableMinWidth: number;
}): number[] {
    const {tableMinWidth, cols} = args;
    const shouldIgnoreFixedWidth = cols.every((col) => col.fixed);
    const fixedCols = shouldIgnoreFixedWidth ? [] : cols.filter((col) => col.fixed);

    const fixedColsWidth = fixedCols.reduce(
        (sum, col) => sum + Math.max(col.min, col.fixed ?? 0),
        0,
    );
    const baseMinWidth = cols.reduce((sum, col) => sum + col.min, 0);
    // subtract 1 pixel for the right border of the table and an additional one for compatibility with the old widget
    // (for some reason, it was not drawn to the full width, but one pixel less)
    const colsWithoutFixedWidth = Math.max(baseMinWidth - fixedColsWidth, 1);
    const k = Math.max(1, (tableMinWidth - fixedColsWidth - 2) / colsWithoutFixedWidth);

    return cols.map((col) => {
        if (!shouldIgnoreFixedWidth && col.fixed) {
            return Math.max(col.min, col.fixed);
        }

        return col.min * k;
    });
}
