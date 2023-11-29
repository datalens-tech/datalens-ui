import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon, Select, SelectOption, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DateTime} from 'luxon';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {QlConfigParam} from 'shared/types/config/ql';
import {DatalensGlobalState} from 'ui';

import {QLParamInterval, QLParamType, resolveRelativeDate} from '../../../../../../../shared';
import {LUXON_FORMATS} from '../../../../../../components/RelativeDatesPicker/constants';
import {getDatesFromValue} from '../../../../../../components/RelativeDatesPicker/utils';
import {openDialogQLParameter} from '../../../../store/actions/dialog';
import {addParam, drawPreview, removeParam, updateParam} from '../../../../store/actions/ql';
import {getChartType, getParams, getPreviewData, getValid} from '../../../../store/reducers/ql';

import './TabParams.scss';

const b = block('ql-tab-params');

function resolveAndFormatDate(date: string, type: QLParamType) {
    const resolvedDate = resolveRelativeDate(date);

    return DateTime.fromISO(resolvedDate || date, {
        zone: 'utc',
    }).toFormat(type === QLParamType.Datetime ? LUXON_FORMATS.DATE_TIME : LUXON_FORMATS.DATE);
}

const TODAY = '__relative_+0d';
const THREE_DAYS_BEFORE = '__relative_-3d';

type TabParamsMakeMapStateToPropsResult = ReturnType<typeof makeMapStateToProps>;
type TabParamsMapDispatchToPropsResult = typeof mapDispatchToProps;

interface TabParamsInnerProps {}

type TabParamsProps = RouteComponentProps<{}> &
    TabParamsInnerProps &
    TabParamsMakeMapStateToPropsResult &
    TabParamsMapDispatchToPropsResult;

interface TabParamsState {}

class TabParams extends React.PureComponent<TabParamsProps, TabParamsState> {
    paramTypes: SelectOption<undefined>[] = [
        {
            value: QLParamType.String,
            content: QLParamType.String,
        },
        {
            value: QLParamType.Number,
            content: QLParamType.Number,
        },
        {
            value: QLParamType.Boolean,
            content: QLParamType.Boolean,
        },
        {
            value: QLParamType.Date,
            content: QLParamType.Date,
        },
        {
            value: QLParamType.Datetime,
            content: QLParamType.Datetime,
        },
        {
            value: QLParamType.DateInterval,
            content: QLParamType.DateInterval,
        },
        {
            value: QLParamType.DatetimeInterval,
            content: QLParamType.DatetimeInterval,
        },
    ];

    constructor(props: TabParamsProps) {
        super(props);

        this.state = {};
    }

    render() {
        const {params} = this.props;

        return (
            <div className={b()}>
                {params.map((param, paramIndex) => {
                    const overridenParam = typeof param.overridenValue !== 'undefined';

                    const paramIsInterval =
                        param.type === QLParamType.DateInterval ||
                        param.type === QLParamType.DatetimeInterval;

                    const paramIsDate =
                        param.type === QLParamType.Date || param.type === QLParamType.Datetime;

                    return (
                        <div
                            className={b('param-row-wrapper', {
                                overriden: overridenParam,
                            })}
                            key={`param-${paramIndex}`}
                        >
                            <div
                                className={b('param-row', {
                                    overriden: overridenParam,
                                })}
                            >
                                <Select
                                    onUpdate={([selectedType]) => {
                                        this.handleParameterTypeUpdate(
                                            selectedType as QLParamType,
                                            {
                                                param,
                                                paramIndex,
                                                paramIsDate,
                                                paramIsInterval,
                                            },
                                        );
                                    }}
                                    options={this.paramTypes}
                                    className={b('select')}
                                    popupClassName={b('select-popup')}
                                    value={param.type ? [param.type] : []}
                                    qa="param-type"
                                />
                                <TextInput
                                    view="normal"
                                    size="m"
                                    className={b('param-name')}
                                    placeholder={i18n('sql', 'label_placeholder-name')}
                                    value={param.name}
                                    onUpdate={(name) => {
                                        const newParam = {...param};

                                        newParam.name = name;

                                        this.onEditParam({param: newParam, paramIndex});
                                    }}
                                    autoFocus={true}
                                    qa="param-name"
                                />
                                <span className={b('delimeter')}>:</span>
                                {this.renderParamDefaultValueContent(param, paramIndex)}
                                <Button
                                    view="flat-secondary"
                                    size="m"
                                    onClick={() => this.onClickButtonRemoveParam({paramIndex})}
                                    key="button-remove-param"
                                    className={b('remove-param-btn')}
                                    title={i18n('sql', 'label_delete-param')}
                                >
                                    <Icon data={Xmark} />
                                </Button>
                            </div>
                            {typeof param.overridenValue !== 'undefined' && (
                                <div
                                    className={b('param-row-applied', {
                                        overriden: overridenParam,
                                    })}
                                >
                                    <div className={b('overriden-param-note')}>
                                        <span className={b('overriden-param-note_label')}>
                                            {i18n('sql', 'label_applied')}
                                        </span>
                                        {Array.isArray(param.overridenValue) ? (
                                            param.overridenValue.map((value, valueIndex) => (
                                                <span
                                                    key={`overridenValue-${valueIndex}`}
                                                    className={b(
                                                        'overriden-param-note_value-wrapper',
                                                    )}
                                                >
                                                    <span
                                                        className={b('overriden-param-note_value')}
                                                    >
                                                        {JSON.stringify(value)}
                                                    </span>
                                                    <span
                                                        onClick={() =>
                                                            this.onClickButtonRemoveParamOverride({
                                                                param,
                                                                paramIndex,
                                                                valueIndex,
                                                            })
                                                        }
                                                    >
                                                        <Icon data={Xmark} width="16" />
                                                    </span>
                                                </span>
                                            ))
                                        ) : (
                                            <span
                                                className={b('overriden-param-note_value-wrapper')}
                                            >
                                                <span className={b('overriden-param-note_value')}>
                                                    {this.renderOverridenValue(
                                                        param.overridenValue,
                                                        param.type as QLParamType,
                                                        paramIsInterval,
                                                        paramIsDate,
                                                    )}
                                                </span>
                                                <span
                                                    onClick={() =>
                                                        this.onClickButtonRemoveParamOverride({
                                                            param,
                                                            paramIndex,
                                                        })
                                                    }
                                                >
                                                    <Icon data={Xmark} width="16" />
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                <Button
                    view="normal"
                    size="l"
                    onClick={() => this.onClickButtonAddParam()}
                    key="button-add-param"
                    className={b('add-param-btn')}
                    qa="add-param-btn"
                >
                    {i18n('sql', 'button_add-param')}
                </Button>
            </div>
        );
    }

    private renderOverridenValue = (
        overridenValue: string | string[] | QLParamInterval,
        type: QLParamType,
        paramIsInterval: boolean,
        paramIsDate: boolean,
    ) => {
        if (
            paramIsInterval &&
            typeof overridenValue === 'object' &&
            !Array.isArray(overridenValue) &&
            overridenValue.from &&
            overridenValue.to
        ) {
            return (
                <React.Fragment>
                    {resolveAndFormatDate(overridenValue.from, type as QLParamType)}
                    <span> — </span>
                    {resolveAndFormatDate(overridenValue.to, type as QLParamType)}
                </React.Fragment>
            );
        } else if (paramIsDate && typeof overridenValue === 'string') {
            return (
                <React.Fragment>
                    {resolveAndFormatDate(overridenValue, type as QLParamType)}
                </React.Fragment>
            );
        } else {
            return <React.Fragment>{JSON.stringify(overridenValue)}</React.Fragment>;
        }
    };

    private handleParameterTypeUpdate = (
        type: QLParamType,
        options: {
            paramIsInterval: boolean;
            paramIsDate: boolean;
            param: QlConfigParam;
            paramIndex: number;
        },
    ) => {
        let paramIsInterval = options.paramIsInterval;
        let paramIsDate = options.paramIsDate;

        const oldParamIsInterval = paramIsInterval;
        const oldParamIsDate = paramIsDate;

        const newParam = {...options.param};

        newParam.type = type;

        paramIsInterval =
            type === QLParamType.DateInterval || type === QLParamType.DatetimeInterval;

        paramIsDate = type === QLParamType.Date || type === QLParamType.Datetime;

        if (paramIsInterval) {
            newParam.defaultValue = {
                from: resolveRelativeDate(THREE_DAYS_BEFORE) as string,
                to: resolveRelativeDate(TODAY) as string,
            };
        } else if (paramIsDate) {
            newParam.defaultValue = resolveRelativeDate(TODAY) as string;
        } else if (oldParamIsInterval || oldParamIsDate) {
            newParam.defaultValue = '';
        }

        this.onEditParam({param: newParam, paramIndex: options.paramIndex});
    };

    private renderParamDefaultValueContent = (param: QlConfigParam, paramIndex: number) => {
        const paramIsInterval =
            param.type === QLParamType.DateInterval || param.type === QLParamType.DatetimeInterval;

        const paramIsDate = param.type === QLParamType.Date || param.type === QLParamType.Datetime;

        if (
            paramIsInterval &&
            typeof param.defaultValue === 'object' &&
            !Array.isArray(param.defaultValue) &&
            param.defaultValue.from &&
            param.defaultValue.to
        ) {
            const formattedFrom = resolveAndFormatDate(
                param.defaultValue.from,
                param.type as QLParamType,
            );
            const formattedTo = resolveAndFormatDate(
                param.defaultValue.to,
                param.type as QLParamType,
            );

            const preparedValue = `__interval_${param.defaultValue.from}_${param.defaultValue.to}`;

            return (
                <Button
                    view="outlined"
                    size="m"
                    onClick={() => {
                        this.onClickButtonEditParamValue({
                            value: preparedValue,
                            type: param.type as QLParamType,
                            onApply: ({value}) => {
                                const [fromDate, toDate] = getDatesFromValue(value);

                                if (fromDate && toDate) {
                                    const updatedParam = {...param};

                                    updatedParam.defaultValue = {
                                        from: fromDate,
                                        to: toDate,
                                    };

                                    this.onEditParam({param: updatedParam, paramIndex});
                                }
                            },
                        });
                    }}
                    key="button-open-param-dialog"
                    className={b('default-value-text')}
                    qa="open-param-dialog-btn"
                >
                    {param.defaultValue
                        ? `${formattedFrom} — ${formattedTo}`
                        : i18n('sql', 'label_placeholder-default-value')}
                </Button>
            );
        } else if (paramIsDate && typeof param.defaultValue === 'string') {
            const formattedDate = resolveAndFormatDate(
                param.defaultValue,
                param.type as QLParamType,
            );

            return (
                <Button
                    view="outlined"
                    size="m"
                    onClick={() => {
                        this.onClickButtonEditParamValue({
                            value: param.defaultValue as string,
                            type: param.type as QLParamType,
                            onApply: ({value}) => {
                                const newParam = {...param};

                                if (value !== null) {
                                    newParam.defaultValue = value;
                                }

                                this.onEditParam({param: newParam, paramIndex});
                            },
                        });
                    }}
                    key="button-add-param-value"
                    className={b('default-value-text')}
                    qa="open-param-dialog"
                >
                    {param.defaultValue
                        ? formattedDate
                        : i18n('sql', 'label_placeholder-default-value')}
                </Button>
            );
        } else if (typeof param.defaultValue === 'string') {
            return (
                <div className={b('default-value-array')}>
                    <div key={`default-value-0`}>
                        <TextInput
                            className={b('default-value-text')}
                            placeholder={i18n('sql', 'label_placeholder-default-value')}
                            value={param.defaultValue}
                            onUpdate={(defaultValue) => {
                                const newParam = {...param};

                                newParam.defaultValue = defaultValue;

                                this.onEditParam({param: newParam, paramIndex});
                            }}
                            autoFocus={true}
                        />
                    </div>
                    <div className={b('default-value-add', 'initial')}>
                        <Button
                            view="normal-contrast"
                            size="s"
                            onClick={() => this.onClickButtonAddParamValue({paramIndex})}
                            key="button-add-param-value"
                            className={b('default-value-add-btn')}
                        >
                            {i18n('sql', 'button_add-param-value')}
                        </Button>
                    </div>
                </div>
            );
        } else if (Array.isArray(param.defaultValue)) {
            return (
                <div className={b('default-value-array')}>
                    {param.defaultValue.map((defaultValue, i) => (
                        <div
                            key={`default-value-${i}`}
                            className={b('default-value-entry', {'not-first': i > 0})}
                        >
                            <TextInput
                                className={b('default-value-text', {'not-first': i > 0})}
                                placeholder={i18n('sql', 'label_placeholder-default-value')}
                                value={defaultValue}
                                onUpdate={(newDefaultValue) => {
                                    const newParam = {...param};

                                    newParam.defaultValue = (param.defaultValue as string[]).map(
                                        (item, index) => (i === index ? newDefaultValue : item),
                                    );

                                    this.onEditParam({param: newParam, paramIndex});
                                }}
                                autoFocus={true}
                            />
                            <Button
                                view="flat-secondary"
                                size="m"
                                onClick={() =>
                                    this.onClickButtonRemoveParamValue({
                                        paramIndex,
                                        valueIndex: i,
                                    })
                                }
                                key="button-remove-param-value"
                                className={b('remove-param-value-btn')}
                                title={i18n('sql', 'label_delete-param-value')}
                            >
                                <Icon data={Xmark} />
                            </Button>
                        </div>
                    ))}
                    <div className={b('default-value-add')}>
                        <Button
                            view="normal-contrast"
                            size="s"
                            onClick={() => this.onClickButtonAddParamValue({paramIndex})}
                            key="button-add-param-value"
                            className={b('default-value-add-btn')}
                        >
                            {i18n('sql', 'button_add-param-value')}
                        </Button>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };

    private onClickButtonEditParamValue = ({
        value,
        type,
        onApply,
    }: {
        value: string;
        type: QLParamType;
        onApply: ({value}: {value: string}) => void;
    }) => {
        this.props.openDialogQLParameter({
            value,
            type,
            onApply,
        });
    };

    private onClickButtonAddParam = () => {
        this.props.addParam();
    };

    private onClickButtonRemoveParam = ({paramIndex}: {paramIndex: number}) => {
        this.props.removeParam({index: paramIndex});
    };

    private onClickButtonRemoveParamValue = ({
        paramIndex,
        valueIndex,
    }: {
        paramIndex: number;
        valueIndex: number;
    }) => {
        const {params} = this.props;

        const param = params[paramIndex];

        let defaultValue: string | string[] = (param.defaultValue as string[]).filter(
            (_item, index) => index !== valueIndex,
        );

        if (defaultValue.length === 1) {
            defaultValue = defaultValue[0];
        }

        const newParam: QlConfigParam = {
            ...param,
            defaultValue,
        };

        this.props.updateParam({param: newParam, index: paramIndex});
    };

    private onClickButtonAddParamValue = ({paramIndex}: {paramIndex: number}) => {
        const {params} = this.props;

        const param = params[paramIndex];

        let newParam: QlConfigParam;

        if (Array.isArray(param.defaultValue)) {
            newParam = {
                ...param,
                defaultValue: ([] as string[]).concat(param.defaultValue, ''),
            };
        } else {
            newParam = {
                ...param,
                defaultValue: [param.defaultValue as string, ''],
            };
        }

        this.props.updateParam({param: newParam, index: paramIndex});
    };

    private onClickButtonRemoveParamOverride = ({
        param,
        paramIndex,
        valueIndex,
    }: {
        param: QlConfigParam;
        paramIndex: number;
        valueIndex?: number;
    }) => {
        const {history, location} = this.props;

        if (
            Array.isArray(param.overridenValue) &&
            typeof valueIndex === 'number' &&
            param.overridenValue.length > 1
        ) {
            param.overridenValue.splice(valueIndex, 1);
        } else {
            delete param.overridenValue;
        }

        this.props.updateParam({param, index: paramIndex});

        // TODO: of course not ok, if suddenly someone in param.name will put some special characters RegExp
        // For now, let's hope that no one will think of such a thing, but we will soon make it more secure
        const newLocationSearch = location.search
            // Cut out all occurrences of param=x and param, not forgetting to cut
            .replace(new RegExp(`${param.name}(=[^&]+&?)?`, 'g'), '')
            // Cut out the remaining ?, if necessary
            .replace(/\?$/, '');

        history.replace({
            search: newLocationSearch,
        });

        if (this.props.valid) {
            this.props.drawPreview();
        }
    };

    private onEditParam = ({param, paramIndex}: {param: QlConfigParam; paramIndex: number}) => {
        this.props.updateParam({param, index: paramIndex});
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        chartType: getChartType(state),
        params: getParams(state),
        valid: getValid(state),
        previewData: getPreviewData(state),
    };
};

const mapDispatchToProps = {
    drawPreview,
    addParam,
    updateParam,
    removeParam,
    openDialogQLParameter,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<TabParamsProps, TabParamsInnerProps>(withRouter)(TabParams));
