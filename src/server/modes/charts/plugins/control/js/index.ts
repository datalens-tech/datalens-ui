import {
    ApiV2ResultData,
    ApiV2ResultDataRow,
    DatasetFieldCalcMode,
    DatasetFieldType,
    IChartEditor,
} from '../../../../../../shared';
import {ELEMENT_TYPE, SOURCE_TYPE} from '../constants/misc';
import {formatIntervalRangeDate, formatRelativeRangeDate, getISOFromToday} from '../helpers/misc';
import {ControlShared, UIControl} from '../types';

// eslint-disable-next-line complexity
export default ({
    data,
    shared,
    params,
    ChartEditor,
}: {
    data: {
        distincts?: ApiV2ResultData;
        fields?: {
            fields: {
                data_type: string;
                guid: string;
                hidden: boolean;
                type: DatasetFieldType;
                title: string;
                calc_mode: DatasetFieldCalcMode;
            }[];
        };
    };
    shared: ControlShared;
    params: Record<string, string | string[]>;
    ChartEditor: IChartEditor;
}) => {
    if (shared.sourceType === SOURCE_TYPE.DATASET) {
        if (data.distincts && shared.source.elementType !== ELEMENT_TYPE.DATE) {
            // https://stackoverflow.com/questions/40107588 numeric collation doesn't work correctly with float type
            const needCollator = shared.source.fieldType !== 'float';

            const collator = new Intl.Collator(undefined, {
                numeric: true,
                sensitivity: 'base',
            });

            shared.content = data.distincts.result_data[0].rows
                .map((row: ApiV2ResultDataRow) => {
                    const value = row.data[0];
                    return {title: value, value};
                })
                .sort((a: {title: string}, b: {title: string}) => {
                    return needCollator
                        ? collator.compare(a.title, b.title)
                        : Number(a.title) - Number(b.title);
                });
        } else if (shared.source.elementType === ELEMENT_TYPE.INPUT) {
            shared.content = shared.source.acceptableValues as {
                value: string;
                title: string;
            }[];
        } else {
            shared.content = [];
        }

        if (data.fields) {
            const datasetFields: Record<string, string> = {};
            const paramsFromDataset: Record<string, string> = {};

            data.fields.fields.forEach(
                (field: {guid: string; title: string; data_type: string}) => {
                    datasetFields[field.guid] = field.title;
                    paramsFromDataset[field.guid] = '';
                },
            );

            const datasetFieldsList = data.fields.fields.map(
                (field: {
                    guid: string;
                    title: string;
                    data_type: string;
                    calc_mode: string;
                    type: DatasetFieldType;
                }) => {
                    const {guid} = field;

                    return {
                        title: field.title,
                        guid,
                        dataType: field.data_type,
                        calc_mode: field.calc_mode,
                        fieldType: field.type,
                    };
                },
            );

            ChartEditor.setExtra('datasets', [
                {
                    fields: datasetFields,
                    fieldsList: datasetFieldsList,
                    id: shared.source.datasetId,
                },
            ]);

            ChartEditor.updateParams(paramsFromDataset);
        }
    }

    const {source, param, content = []} = shared;

    const uiControl: UIControl = {
        label: source.showTitle ? shared.title : '',
        multiselect: source.multiselectable,
        content,
        param,
        isValueRequired: source.isValueRequired,
    };

    switch (source.elementType) {
        case ELEMENT_TYPE.DATE:
            if (source.isRange) {
                uiControl.type = 'range-datepicker';

                const {defaultValue} = source;

                if (typeof defaultValue === 'string') {
                    const resolvedInterval = ChartEditor.resolveInterval(defaultValue);

                    if (resolvedInterval) {
                        const {from, to} = resolvedInterval;
                        params[param] = `__interval_${from || ''}_${to || ''}`;
                    }
                } else if (content.length) {
                    params[param] = formatIntervalRangeDate({
                        from: content[0].value,
                        to: content[content.length - 1].value,
                    });
                } else {
                    params[param] = formatRelativeRangeDate({from: 0, to: 0});
                }
            } else {
                uiControl.type = 'datepicker';

                const {defaultValue} = source;

                if (typeof defaultValue === 'string') {
                    params[param] = ChartEditor.resolveRelative(defaultValue) || defaultValue;
                } else if (content.length) {
                    params[param] = [content[content.length - 1].value];
                } else {
                    params[param] = [getISOFromToday()];
                }
            }

            if (source.acceptableValues) {
                const {from, to} = source.acceptableValues as {
                    from: string;
                    to: string;
                };
                uiControl.minDate = from;
                uiControl.maxDate = to;
            }

            break;

        case ELEMENT_TYPE.SELECT:
            uiControl.type = source.elementType;

            if (!params[param]) {
                if (Array.isArray(source.defaultValue)) {
                    params[param] = source.defaultValue.length > 0 ? source.defaultValue : [''];
                } else {
                    params[param] = source.defaultValue || [''];
                }
            }

            break;

        case ELEMENT_TYPE.CHECKBOX:
            uiControl.type = source.elementType;

            if (!params[param]) {
                if (source.defaultValue === undefined) {
                    params[param] = ['false'];
                } else {
                    params[param] = [source.defaultValue];
                }
            }

            break;

        default:
            uiControl.type = source.elementType;

            if (!params[param]) {
                if (source.defaultValue === undefined) {
                    params[param] = [''];
                } else {
                    params[param] = [source.defaultValue];
                }
            }
    }

    shared.uiControl = uiControl;

    ChartEditor.updateParams({[param]: params[param]});
};
