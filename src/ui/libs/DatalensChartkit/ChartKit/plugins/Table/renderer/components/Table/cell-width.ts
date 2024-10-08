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
    const baseMinWidth = cols.reduce((sum, col) => sum + col.min, 0) + 1;
    const k = Math.max(1, (tableMinWidth - fixedColsWidth) / (baseMinWidth - fixedColsWidth));

    return cols.map((col) => {
        if (!shouldIgnoreFixedWidth && col.fixed) {
            return Math.max(col.min, col.fixed);
        }

        return col.min * k;
    });
}
