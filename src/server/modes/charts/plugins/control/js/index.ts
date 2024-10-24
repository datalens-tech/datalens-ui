import {DashTabItemControlElementType} from '../../../../../../shared';
import type {IChartEditor, StringParams} from '../../../../../../shared';
import {formatIntervalRangeDate, formatRelativeRangeDate, getISOFromToday} from '../helpers/misc';
import type {ControlShared, UIControl} from '../types';

import {processContent} from './helpers/process-content';
import type {SourceResponseData} from './types';

// eslint-disable-next-line complexity
export const buildGraph = ({
    data,
    shared,
    params,
    ChartEditor,
}: {
    data: SourceResponseData;
    shared: ControlShared;
    params: StringParams;
    ChartEditor: IChartEditor;
}) => {
    shared.content = processContent({data, shared, ChartEditor, params});

    const {source, param, content} = shared;

    const uiControl: UIControl = {
        label: source.showTitle ? shared.title : '',
        multiselect: source.multiselectable,
        content,
        param,
        required: source.required,
        disabled: shared.disabled,
    };

    switch (source.elementType) {
        case DashTabItemControlElementType.Date:
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

        case DashTabItemControlElementType.Select:
            uiControl.type = source.elementType;

            if (!params[param]) {
                if (Array.isArray(source.defaultValue)) {
                    params[param] = source.defaultValue.length > 0 ? source.defaultValue : [''];
                } else {
                    params[param] = source.defaultValue || [''];
                }
            }

            break;

        case DashTabItemControlElementType.Checkbox:
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
