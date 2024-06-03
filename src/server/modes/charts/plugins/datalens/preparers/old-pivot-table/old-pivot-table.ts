import type {CommonNumberFormattingOptions} from '../../../../../../../shared';
import {
    DATASET_FIELD_TYPES,
    MINIMUM_FRACTION_DIGITS,
    isDateField,
    isMarkupField,
    markupToRawString,
} from '../../../../../../../shared';
import {mapAndColorizeHashTableByGradient} from '../../utils/color-helpers';
import {
    chartKitFormatNumberWrapper,
    collator,
    findIndexInOrder,
    formatDate,
    getTimezoneOffsettedTime,
    isFloatDataType,
    isNumericalDataType,
    log,
    logTiming,
} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

// A secure delimiter that connects keys
const SPECIAL_DELIMITER = '#$#';

function sorter(a: string | null, b: string | null) {
    if (a === null) {
        return 1;
    } else if (b === null) {
        return -1;
    }

    return collator.compare(a, b);
}

// The function that generates the structure,
// by which the pivot table is rendered in ChartKit
// eslint-disable-next-line
function preparePivotTable({
    placeholders,
    resultData,
    colors,
    sort,
    colorsConfig,
    idToTitle,
    idToDataType,
    ChartEditor,
}: PrepareFunctionArgs) {
    const {data, order} = resultData;

    // Fields dragged into "columns"
    const c: any[] = placeholders[0].items;

    // Types of fields dragged into "columns"
    const cTypes = c.map((item) => idToDataType[item.guid] || item.data_type);

    // Fields dragged into "rows"
    const r: any[] = placeholders[1].items;

    // Types of fields dragged into "rows"
    const rTypes = r.map((item) => idToDataType[item.guid] || item.data_type);

    // Fields dragged into "indicators"
    const m = placeholders[2].items;

    // Types of fields dragged into "indicators"
    const mTypes = m.map((item) => idToDataType[item.guid] || item.data_type);

    // Fields dragged into "sorting"
    const s = sort;

    // Number of fields dragged into "columns"
    const cl = c.length;

    // Number of fields dragged into "rows"
    const rl = r.length;

    // Number of fields dragged into "indicators"
    const ml = m.length;

    // Number of fields dragged into "sorting"
    const sl = s.length;

    // Enumeration of unique values for the lowercase header by levels
    // The lowercase header is the vertical header on the left in the table
    const headRow: any[] = [];

    // Enumeration of unique values for columnar caps by levels
    // A columnar header is a horizontal header at the top of the table
    const headColumn: any[] = [];

    // Table "cell key (intersection of row and column)" - "value in cell"
    const hashTable: Record<string, any> = {};

    // Table "cell key (intersection of row and column)" - "formatted value in cell"
    const hashTableFormatted: Record<string, any> = {};

    // Table "cell key (intersection of row and column)" - "type of value in the cell"
    const typeTable: Record<string, any> = {};

    // Table "cell key (intersection of row and column)" - "color of the value in the cell"
    const colorHashTable: Record<string, any> = {};

    // Flag indicating that more than 1 metric is used
    let multimeasure = false;

    // Flag, meaning that the pseudo-field "Measure Names" in the lowercase header
    let measureNamesInRow = false;

    // Flag, meaning that the pseudo-field "Measure Names" in the columnar cap
    let measureNamesLevel: any = null;

    // Service flag telling data-table to use grouping
    const useGroup = rl > 1;

    // Array of displayed indicator names
    const measureNames = m.map((measureItem) => {
        return measureItem.fakeTitle || idToTitle[measureItem.guid];
    });

    if (ml > 1) {
        multimeasure = true;
    }

    // Flag indicating that the "Measure Names" pseudo field is present in the visualization
    let measureNamesExists = false;

    // Flag indicating that the "lowercase" header will not be displayed
    let hideHeadRows = false;

    // Table "displayed field name" - "its index in the back response"
    const indices: Record<string, any> = {};

    // Table "columnar key" - "true/false"
    // (depending on whether there are values for this key)
    const hashTableCKeys: Record<string, any> = {};
    const colorHashTableCKeys: Record<string, any> = {};

    // Table "lowercase key" - "true/false"
    // (depending on whether there are values for this key)
    const hashTableRKeys: Record<string, any> = {};
    const colorHashTableRKeys: Record<string, any> = {};

    // Table "columnar key or part of it" - "true/false"
    // (depending on whether there are values for this key)
    // Auxiliary table to reduce the number of iterations
    // when generating a columnar header
    const auxHashTableCKeys: Record<string, any> = {};

    // Table "lowercase key or part of it" - "true/false"
    // (depending on whether there are values for this key)
    // Auxiliary table to reduce the number of iterations
    // when generating a lowercase header
    const auxHashTableRKeys: Record<string | number, any> = {};

    // Report point for debugging time metrics
    const startTime = new Date();

    // Table "level - value - true/false" for columnar header
    // Auxiliary table to speed up the analysis of data from the backup
    // Previously, indexOf was used
    const headColumnMapping: Record<string | number, any> = {};

    // Table "level - value - true/false" for the lowercase header
    // Auxiliary table to speed up the analysis of data from the backup
    // Previously, indexOf was used
    const headRowMapping: Record<string | number, any> = {};

    // An object that stores the number of unique parts of lowercase keys for each level
    // Used to estimate the execution time
    const urcountbylvl: Record<string | number, any> = {};

    // An object that stores the number of existing parts of lowercase keys for each level
    // Used to estimate the execution time
    const ercountbylvl: Record<string | number, any> = {};

    // An object that stores the number of unique parts of columnar keys for each level
    // Used to estimate the execution time
    const uccountbylvl: Record<string | number, any> = {};

    // An object that stores the number of existing parts of columnar keys for each level
    // Used to estimate the execution time
    const eccountbylvl: Record<string | number, any> = {};

    // Determining where the "Measure Names" is located
    // "Measure Names" cannot be if there are no indicators
    if (ml > 0) {
        if (
            r.some((item, level) => {
                if (item.type === 'PSEUDO') {
                    measureNamesLevel = level;
                    measureNamesExists = true;

                    return true;
                } else {
                    return false;
                }
            })
        ) {
            measureNamesInRow = true;
        } else {
            c.some((item, level) => {
                if (item.type === 'PSEUDO') {
                    measureNamesLevel = level;
                    measureNamesExists = true;

                    return true;
                } else {
                    return false;
                }
            });
        }
    }

    // We determine the lack of headers
    if (!rl && !cl) {
        if (ml) {
            c.push({
                type: 'PSEUDO',
                title: 'Measure Names',
            });
            measureNamesExists = true;
        }

        hideHeadRows = true;
        measureNamesLevel = measureNamesLevel || 0;
    } else if (!cl) {
        if (!measureNamesExists) {
            if (ml) {
                c.push({
                    type: 'PSEUDO',
                    title: 'Measure Names',
                });
                measureNamesExists = true;
            }

            measureNamesLevel = 0;
        }
    } else if (!rl) {
        if (!measureNamesExists) {
            if (ml) {
                r.push({
                    type: 'PSEUDO',
                    title: 'Measure Names',
                });
                measureNamesExists = true;
                measureNamesInRow = true;
            }

            measureNamesLevel = 0;
        }
    }

    // We begin a line-by-line analysis of the data from the backup
    data.forEach((values) => {
        // Array storing a columnar key
        const cPath: any[] = [];

        let replaceMeasureName = false;

        c.forEach((headColumnItem, level) => {
            if (headColumnItem.type === 'PSEUDO') {
                cPath.push('$measureName$');

                const cKey = cPath.join(SPECIAL_DELIMITER);

                if (!auxHashTableCKeys[cKey]) {
                    auxHashTableCKeys[cKey] = true;
                }

                measureNames.forEach((measureName) => {
                    const customRKey = cKey.replace('$measureName$', measureName);

                    if (!auxHashTableCKeys[customRKey]) {
                        auxHashTableCKeys[customRKey] = true;
                    }
                });

                replaceMeasureName = true;

                if (!eccountbylvl[level]) {
                    eccountbylvl[level] = measureNames.length;
                }

                if (!uccountbylvl[level]) {
                    uccountbylvl[level] = measureNames.length;
                }

                return;
            }

            const actualTitle = idToTitle[headColumnItem.guid];
            const actualDataType = idToDataType[headColumnItem.guid];

            let i;
            if (typeof indices[actualTitle] === 'undefined') {
                i = indices[actualTitle] = findIndexInOrder(order, headColumnItem, actualTitle);
            } else {
                i = indices[actualTitle];
            }

            let value = values[i];
            let stringifiedValue = String(undefined);

            if (actualDataType === 'markup') {
                stringifiedValue = JSON.stringify(value);
            }

            if (!headColumnMapping[level]) {
                headColumnMapping[level] = {};
            }

            if (Array.isArray(headColumn[level])) {
                const levelValues = headColumn[level];

                if (actualDataType === 'markup') {
                    if (!headColumnMapping[level][stringifiedValue]) {
                        ++uccountbylvl[level];
                        levelValues.push(value);
                        headColumnMapping[level][stringifiedValue] = true;
                    }
                } else if (!headColumnMapping[level][String(value)]) {
                    ++uccountbylvl[level];
                    levelValues.push(value);
                    headColumnMapping[level][String(value)] = true;
                }
            } else {
                if (actualDataType === 'markup') {
                    headColumnMapping[level] = {[stringifiedValue]: true};
                } else {
                    headColumnMapping[level] = {[String(value)]: true};
                }

                uccountbylvl[level] = 1;
                headColumn[level] = [value];
            }

            if (value === null) {
                value = '__null';
            } else if (typeof value === 'undefined') {
                value = '__undefined';
            }

            if (actualDataType === 'markup') {
                cPath.push(stringifiedValue);
            } else {
                cPath.push(value);
            }

            const cKey = cPath.join(SPECIAL_DELIMITER);

            if (!auxHashTableCKeys[cKey]) {
                auxHashTableCKeys[cKey] = true;

                if (replaceMeasureName) {
                    measureNames.forEach((measureName) => {
                        const customCKey = cKey.replace('$measureName$', measureName);

                        if (!auxHashTableCKeys[customCKey]) {
                            auxHashTableCKeys[customCKey] = true;
                        }
                    });
                }

                if (eccountbylvl[level]) {
                    ++eccountbylvl[level];
                } else {
                    eccountbylvl[level] = 1;
                }
            }
        });

        const rPath: any[] = [];
        r.forEach((headRowItem, level) => {
            if (headRowItem.type === 'PSEUDO') {
                rPath.push('$measureName$');

                const rKey = rPath.join(SPECIAL_DELIMITER);

                if (!auxHashTableRKeys[rKey]) {
                    auxHashTableRKeys[rKey] = true;
                }

                measureNames.forEach((measureName) => {
                    const customRKey = rKey.replace('$measureName$', measureName);

                    if (!auxHashTableRKeys[customRKey]) {
                        auxHashTableRKeys[customRKey] = true;
                    }
                });

                replaceMeasureName = true;

                if (!ercountbylvl[level]) {
                    ercountbylvl[level] = measureNames.length;
                }

                if (!urcountbylvl[level]) {
                    urcountbylvl[level] = measureNames.length;
                }

                return;
            }

            const actualTitle = idToTitle[headRowItem.guid];
            const actualDataType = idToDataType[headRowItem.guid];

            let i;
            if (typeof indices[actualTitle] === 'undefined') {
                i = indices[actualTitle] = findIndexInOrder(order, headRowItem, actualTitle);
            } else {
                i = indices[actualTitle];
            }

            let value = values[i];
            let stringifiedValue = String(undefined);

            if (actualDataType === 'markup') {
                stringifiedValue = JSON.stringify(value);
            }

            if (!headRowMapping[level]) {
                headRowMapping[level] = {};
            }

            if (Array.isArray(headRow[level])) {
                const levelValues = headRow[level];

                if (actualDataType === 'markup') {
                    if (!headRowMapping[level][stringifiedValue]) {
                        ++urcountbylvl[level];
                        levelValues.push(value);
                        headRowMapping[level][stringifiedValue] = true;
                    }
                } else if (!headRowMapping[level][String(value)]) {
                    ++urcountbylvl[level];
                    levelValues.push(value);
                    headRowMapping[level][String(value)] = true;
                }
            } else {
                if (actualDataType === 'markup') {
                    headRowMapping[level] = {[stringifiedValue]: true};
                } else {
                    headRowMapping[level] = {[String(value)]: true};
                }

                urcountbylvl[level] = 1;
                headRow[level] = [value];
            }

            if (value === null) {
                value = '__null';
            } else if (typeof value === 'undefined') {
                value = '__undefined';
            }

            if (actualDataType === 'markup') {
                rPath.push(stringifiedValue);
            } else {
                rPath.push(value);
            }

            const rKey = rPath.join(SPECIAL_DELIMITER);

            if (!auxHashTableRKeys[rKey]) {
                auxHashTableRKeys[rKey] = true;

                if (replaceMeasureName) {
                    measureNames.forEach((measureName) => {
                        const customRKey = rKey.replace('$measureName$', measureName);

                        if (!auxHashTableRKeys[customRKey]) {
                            auxHashTableRKeys[customRKey] = true;
                        }
                    });
                }

                if (ercountbylvl[level]) {
                    ++ercountbylvl[level];
                } else {
                    ercountbylvl[level] = 1;
                }
            }
        });

        const cKey = cPath.join(SPECIAL_DELIMITER);
        const rKey = rPath.join(SPECIAL_DELIMITER);

        // Getting the full key
        // The intersection of a line and a line is the union of a lowercase and columnar key
        const key = `${cKey};${rKey}`;

        // eslint-disable-next-line complexity
        m.forEach((measureItem) => {
            const actualTitle = idToTitle[measureItem.guid];
            const {data_type: dataType} = measureItem;

            const shownTitle = measureItem.fakeTitle || idToTitle[measureItem.guid];

            let i;
            if (typeof indices[actualTitle] === 'undefined') {
                i = indices[actualTitle] = findIndexInOrder(order, measureItem, actualTitle);
            } else {
                i = indices[actualTitle];
            }

            let value: string | number | null = values[i];
            let formattedValue = '';

            if (value !== null) {
                if (isNumericalDataType(dataType)) {
                    value = Number(value);
                    formattedValue = chartKitFormatNumberWrapper(value, {
                        lang: 'ru',
                        ...(measureItem.formatting ?? {
                            precision: isFloatDataType(dataType) ? MINIMUM_FRACTION_DIGITS : 0,
                        }),
                    });
                } else if (isDateField(measureItem)) {
                    value = getTimezoneOffsettedTime(new Date(value));
                }
            }

            // If necessary, you need to supplement the key with a pseudo-field "Measure Names"
            if (measureNamesExists || !rl || !cl) {
                let rPathSpecial: any = [...rPath];
                let cPathSpecial: any = [...cPath];

                rPathSpecial = rPathSpecial.join(SPECIAL_DELIMITER);
                cPathSpecial = cPathSpecial.join(SPECIAL_DELIMITER);

                if (measureNamesInRow) {
                    rPathSpecial = rPathSpecial.replace('$measureName$', shownTitle);
                } else {
                    cPathSpecial = cPathSpecial.replace('$measureName$', shownTitle);
                }

                if (!hashTableRKeys[rPathSpecial]) {
                    hashTableRKeys[rPathSpecial] = true;
                }

                if (!hashTableCKeys[cPathSpecial]) {
                    hashTableCKeys[cPathSpecial] = true;
                }

                if (!auxHashTableRKeys[rPathSpecial]) {
                    auxHashTableRKeys[rPathSpecial] = true;
                }

                if (!auxHashTableCKeys[cPathSpecial]) {
                    auxHashTableCKeys[cPathSpecial] = true;
                }

                const specialKey = `${cPathSpecial};${rPathSpecial}`;

                hashTable[specialKey] = [value];
                hashTableFormatted[specialKey] = [formattedValue];
                typeTable[specialKey] = dataType;

                if (colors.length) {
                    const actualColorTitle = idToTitle[colors[0].guid];

                    let j;
                    if (typeof indices[actualColorTitle] === 'undefined') {
                        j = indices[actualColorTitle] = findIndexInOrder(
                            order,
                            colors[0],
                            actualColorTitle,
                        );
                    } else {
                        j = indices[actualColorTitle];
                    }

                    colorHashTable[specialKey] = values[j];
                }
            } else {
                hashTable[key] = [value];
                hashTableFormatted[key] = [formattedValue];
                typeTable[key] = dataType;

                const rKey = rPath.join(SPECIAL_DELIMITER);
                const cKey = cPath.join(SPECIAL_DELIMITER);

                if (!hashTableRKeys[rKey]) {
                    hashTableRKeys[rKey] = true;
                }

                if (!hashTableCKeys[cKey]) {
                    hashTableCKeys[cKey] = true;
                }
            }
        });

        if (!multimeasure) {
            if (colors.length) {
                const actualColorTitle = idToTitle[colors[0].guid];

                let i;
                if (typeof indices[actualColorTitle] === 'undefined') {
                    i = indices[actualColorTitle] = findIndexInOrder(
                        order,
                        colors[0],
                        actualColorTitle,
                    );
                } else {
                    i = indices[actualColorTitle];
                }

                const value = values[i];

                colorHashTableCKeys[cKey] = true;
                colorHashTableRKeys[rKey] = true;

                colorHashTable[key] = value;
            }
        }
    });

    if (sl) {
        s.forEach((sortItem) => {
            r.forEach((item, level) => {
                if (sortItem.guid === item.guid) {
                    if (headRow[level]) {
                        headRow[level].sort(sorter);

                        if (sortItem.direction !== 'ASC') {
                            headRow[level].reverse();
                        }
                    }
                }
            });

            c.forEach((item, level) => {
                if (sortItem.guid === item.guid) {
                    if (headColumn[level]) {
                        headColumn[level].sort(sorter);

                        if (sortItem.direction !== 'ASC') {
                            headColumn[level].reverse();
                        }
                    }
                }
            });
        });
    } else {
        r.forEach((item, level) => {
            if (item.type !== 'PSEUDO') {
                if (headRow[level]) {
                    headRow[level].sort(sorter);
                }
            }
        });

        c.forEach((item, level) => {
            if (item.type !== 'PSEUDO') {
                if (headColumn[level]) {
                    headColumn[level].sort(sorter);
                }
            }
        });
    }

    // At this stage, after 0.5-1.5 seconds, we can cut off the execution,
    // if we understand that we will not meet the 10-second limit

    // The time for which the initial analysis of data from the backend occurred
    const initTime = (new Date() as unknown as number) - (startTime as unknown as number);

    logTiming('Inited', initTime);

    // "Predicted Head Row Iterations Count"
    // Number of iterations required to generate a lowercase header
    let phric = ercountbylvl[0] || 1;
    if (rl > 1) {
        for (let i = 1; i < rl; ++i) {
            phric += ercountbylvl[i - 1] * urcountbylvl[i];
        }
    }

    // "Predicted Head Column Iterations Count"
    // The number of iterations that will be required to generate a columnar header
    let phcic = eccountbylvl[0] || 1;
    if (cl > 1) {
        for (let i = 1; i < cl; ++i) {
            phcic += eccountbylvl[i - 1] * uccountbylvl[i];
        }
    }

    // Experiments have shown that each iteration of generating caps
    // takes ~0.0006-0.0015 ms
    // Therefore, we can say in advance how long it will take to generate these caps
    const TIME_FOR_HEAD_GENERATION_ITERATION = 0.0012;

    const thric = phric * TIME_FOR_HEAD_GENERATION_ITERATION;
    const thcic = phcic * TIME_FOR_HEAD_GENERATION_ITERATION;

    // A similar dependency with the execution of getPaths:
    const TIME_FOR_GET_PATHS_ITERATION = 0.003;

    const tpric = phric * TIME_FOR_GET_PATHS_ITERATION;
    const tpcic = phcic * TIME_FOR_GET_PATHS_ITERATION;

    // And a similar dependency with the last nested loop:
    const TIME_FOR_DATA_LOOP_ITERATION = 0.003;

    const flic =
        Object.keys(hashTableRKeys).length *
        Object.keys(hashTableCKeys).length *
        TIME_FOR_DATA_LOOP_ITERATION;

    // The allowed limit is 10 seconds
    // It's already been - "initTime" seconds
    // Also, probably, we don't want users to draw end-to-end under 10 seconds of the table
    // Let's take another buffer in 1 second
    const SECOND = 1000;
    const ALLOWED_EXECUTON_TIME = 10000;

    const estimatedResultTime = thric + thcic + tpric + tpcic + flic + initTime + SECOND;

    log('estimated result time:', estimatedResultTime);

    if (estimatedResultTime > ALLOWED_EXECUTON_TIME) {
        ChartEditor._setError({
            code: 'ERR.CHARTS.ROWS_NUMBER_OVERSIZE',
            details: {
                estimatedResultTime,
            },
        });

        return {};
    }

    // We determine in which header we put Measure Names
    if (ml) {
        if (measureNamesInRow) {
            headRow[measureNamesLevel] = measureNames;
        } else {
            headColumn[measureNamesLevel] = measureNames;
        }
    }

    // Lowercase header generation function
    function generateHeadRows() {
        function generateHeadRowLevel(level: any, accumulated: any): any[] {
            const localResult: any[] = [];

            accumulated.forEach((accumulatedRow: any) => {
                const keyPrefix = accumulatedRow.length
                    ? accumulatedRow
                          .map((cell: any) => {
                              return cell.originalValue;
                          })
                          .join(SPECIAL_DELIMITER)
                    : null;

                headRow[level].forEach((headRowLevel: any) => {
                    let value = headRowLevel;
                    let formattedValue = '';
                    let originalValue = headRowLevel;

                    if (originalValue === null) {
                        originalValue = '__null';
                    } else if (typeof originalValue === 'undefined') {
                        originalValue = '__undefined';
                    }

                    if (rTypes[level] === 'markup') {
                        originalValue = JSON.stringify(value);
                    }

                    const currentKey =
                        keyPrefix === null
                            ? originalValue
                            : `${keyPrefix}${SPECIAL_DELIMITER}${originalValue}`;

                    if (!auxHashTableRKeys[currentKey]) {
                        return;
                    }

                    if (headRowLevel === null) {
                        value = null;
                    } else if (isDateField({data_type: rTypes[level]})) {
                        value = formatDate({
                            valueType: rTypes[level],
                            value: headRowLevel,
                            format: r[level].format,
                        });
                    } else if (isNumericalDataType(rTypes[level]) && r[level]?.formatting) {
                        formattedValue = chartKitFormatNumberWrapper(Number(headRowLevel), {
                            lang: 'ru',
                            ...r[level].formatting,
                        });
                    }

                    const cell = {
                        value,
                        originalValue,
                        formattedValue,
                        key: currentKey,
                        css: {
                            fontSize: '13px',
                            lineHeight: '15px',
                        },
                    };

                    localResult.push([...accumulatedRow, cell]);
                });
            });

            if (headRow[level + 1]) {
                return generateHeadRowLevel(level + 1, localResult);
            } else {
                return localResult;
            }
        }

        let rows;
        if (headRow[0]) {
            rows = generateHeadRowLevel(0, [[]]);

            let rowId = 0;
            rows = rows.map((cells) => {
                const row = {
                    cells,
                    id: ++rowId,
                };

                return row;
            });
        } else {
            rows = [{cells: []}];
        }

        return rows;
    }

    // Header cap generation function
    function generateHeadColumns() {
        let headerId = 0;

        function generateHeadColumnLevel(level: any, key?: any) {
            return (
                headColumn[level]
                    // eslint-disable-next-line complexity
                    .map((entry: any, entryIndex: number) => {
                        const cell: any = {
                            id: ++headerId,
                            type: 'text',
                        };

                        let mType;
                        let mItem;

                        let value = entry;
                        if (value === null) {
                            value = '__null';
                        }
                        if (typeof value === 'undefined') {
                            value = '__undefined';
                        }

                        const cType = cTypes[level];

                        if (cType === 'markup') {
                            value = JSON.stringify(value);
                        }

                        if (
                            !measureNamesInRow &&
                            (measureNamesLevel === null || measureNamesLevel === level)
                        ) {
                            if (multimeasure) {
                                mType = mTypes[entryIndex];
                                mItem = m[entryIndex];
                            } else {
                                mType = mTypes[0];
                                mItem = m[0];
                            }

                            if (isNumericalDataType(mType)) {
                                cell.type = 'number';
                                cell.sortable = true;
                                const mItemFormatting = mItem?.formatting as
                                    | CommonNumberFormattingOptions
                                    | undefined;
                                if (mItemFormatting) {
                                    cell.formatter = {
                                        format: mItemFormatting.format,
                                        suffix: mItemFormatting.postfix,
                                        prefix: mItemFormatting.prefix,
                                        showRankDelimiter: mItemFormatting.showRankDelimiter,
                                        unit: mItemFormatting.unit,
                                        precision:
                                            mType === DATASET_FIELD_TYPES.FLOAT &&
                                            typeof mItemFormatting.precision !== 'number'
                                                ? MINIMUM_FRACTION_DIGITS
                                                : mItemFormatting.precision,
                                    };
                                } else {
                                    cell.precision =
                                        mType === DATASET_FIELD_TYPES.FLOAT
                                            ? MINIMUM_FRACTION_DIGITS
                                            : 0;
                                }
                            } else if (isDateField({data_type: mType})) {
                                cell.type = 'date';
                                cell.sortable = true;
                                cell.format = mItem.format;
                            }
                        }

                        if (isDateField({data_type: cType})) {
                            cell.name = formatDate({
                                valueType: cType,
                                value: entry,
                                format: c[level].format,
                            });
                        } else if (isMarkupField({data_type: cType})) {
                            cell.name = markupToRawString(entry);
                            cell.markup = entry;
                        } else if (isNumericalDataType(cType) && c[level]?.formatting) {
                            cell.name = entry === null ? 'null' : entry;
                            cell.formattedName = chartKitFormatNumberWrapper(entry, {
                                lang: 'ru',
                                ...c[level].formatting,
                            });
                        } else {
                            cell.name = entry === null ? 'null' : entry;
                        }

                        const currentKey =
                            typeof key === 'string'
                                ? `${key}${SPECIAL_DELIMITER}${value}`
                                : `${value}`;
                        const nextLevel = headColumn[level + 1];
                        const noValues = !auxHashTableCKeys[currentKey];

                        if (noValues) {
                            return null;
                        } else if (nextLevel) {
                            cell.sub = generateHeadColumnLevel(level + 1, currentKey);

                            if (cell.sub.length === 0) {
                                return null;
                            }
                        }

                        return cell;
                    })
                    .filter((entry: any) => entry !== null)
            );
        }

        let result;

        if (headColumn[0]) {
            result = generateHeadColumnLevel(0);
        } else {
            result = [
                {
                    name: '',
                    group: useGroup,
                    autogroup: false,
                    sortable: false,
                },
            ];
        }

        if (!hideHeadRows) {
            // How many levels are there in the headRow - so many need to insert an empty cell into the header
            headRow.forEach(() => {
                result.unshift({
                    name: '',
                    group: useGroup,
                    autogroup: false,
                    sortable: false,
                });
            });
        }

        return result;
    }

    const rows = generateHeadRows();

    logTiming(
        'Generated rows',
        (new Date() as unknown as number) - (startTime as unknown as number),
    );

    const head = generateHeadColumns();

    logTiming(
        'Generated head',
        (new Date() as unknown as number) - (startTime as unknown as number),
    );

    let colorData: any;
    if (colors.length) {
        colorData = mapAndColorizeHashTableByGradient(colorHashTable, colorsConfig).colorData;

        logTiming(
            'Map and colorize',
            (new Date() as unknown as number) - (startTime as unknown as number),
        );
    }

    // The function of generating keys of existing data in the correct order
    function getPaths(structure: any, level: any, current: any, target: any, direction: any) {
        if (current.length) {
            if (direction === 'row' && !auxHashTableRKeys[current.join(SPECIAL_DELIMITER)]) {
                return;
            } else if (
                direction === 'column' &&
                !auxHashTableCKeys[current.join(SPECIAL_DELIMITER)]
            ) {
                return;
            }
        }

        if (structure[level + 1]) {
            structure[level].forEach((entry: any) => {
                let pathPart = entry;

                if (entry === null) {
                    pathPart = '__null';
                } else if (typeof entry === 'undefined') {
                    pathPart = '__undefined';
                } else if (typeof entry === 'object') {
                    pathPart = JSON.stringify(pathPart);
                }

                getPaths(structure, level + 1, [...current, pathPart], target, direction);
            });
        } else if (structure[level]) {
            structure[level].forEach((entry: any) => {
                let pathPart = entry;

                if (entry === null) {
                    pathPart = '__null';
                } else if (typeof entry === 'undefined') {
                    pathPart = '__undefined';
                } else if (typeof entry === 'object') {
                    pathPart = JSON.stringify(pathPart);
                }

                target.push([...current, pathPart]);
            });
        }
    }

    let headRowPaths: any[] = [];
    getPaths(headRow, 0, [], headRowPaths, 'row');

    logTiming(
        'getPaths headRow',
        (new Date() as unknown as number) - (startTime as unknown as number),
    );

    if (headRowPaths.length === 0) {
        headRowPaths = [['']];
    }

    let headColumnPaths: any[] = [];
    getPaths(headColumn, 0, [], headColumnPaths, 'column');

    logTiming(
        'getPaths headColumn',
        (new Date() as unknown as number) - (startTime as unknown as number),
    );

    if (headColumnPaths.length === 0) {
        headColumnPaths = [['']];
    }

    let cellId = 0;
    let rCounter = 0;

    // The final cycle - we fill the cells with data
    headRowPaths.forEach((headRowPath) => {
        const rKey = headRowPath.join(SPECIAL_DELIMITER);
        const rKeyExisting = hashTableRKeys[rKey] || colorHashTableRKeys[rKey];

        if (!rKeyExisting) {
            return;
        }

        const dataCells: any[] = [];

        headColumnPaths.forEach((headColumnPath) => {
            const cKey = headColumnPath.join(SPECIAL_DELIMITER);
            const cKeyExisting = hashTableCKeys[cKey] || colorHashTableCKeys[cKey];

            if (!cKeyExisting) {
                return;
            }

            const key = `${cKey};${rKey}`;
            const value = hashTable[key] && hashTable[key][0];
            const formattedValue = hashTableFormatted[key] && hashTableFormatted[key][0];
            const type = typeTable[key];

            const cell: any = {
                value,
                id: ++cellId,
            };

            if (type === 'markup') {
                cell.value = value;
                cell.type = 'markup';
            } else if (type === 'float') {
                cell.precision = 2;
                cell.type = 'number';
                cell.formattedValue = formattedValue;
            } else if (isNumericalDataType(type)) {
                cell.type = 'number';
                cell.formattedValue = formattedValue;
            } else if (isDateField({data_type: type})) {
                cell.type = 'date';

                if (type === 'datetime' || type === 'genericdatetime') {
                    cell.format = 'DD.MM.YYYY HH:mm:ss';
                } else {
                    cell.format = 'DD.MM.YYYY';
                }
            }

            if (colors.length && colorData && colorData[key]) {
                cell.css = colorData[key];
            }

            if (!cell.css) {
                cell.css = {};
            }

            Object.assign(cell.css, {
                fontSize: '13px',
                lineHeight: '15px',
            });

            dataCells.push(cell);
        });

        rows[rCounter].cells = [...rows[rCounter].cells, ...dataCells];

        ++rCounter;
    });

    logTiming('Result', (new Date() as unknown as number) - (startTime as unknown as number));

    return {head, rows};
}

export default preparePivotTable;
