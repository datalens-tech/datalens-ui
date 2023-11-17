import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {Xmark} from '@gravity-ui/icons';
import {Button, Icon, Select, SelectOption, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {QlConfigParam} from 'shared/types/config/ql';
import {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';

import {QLParamType} from '../../../../../../../shared';
import {DEFAULT_TIMEZONE} from '../../../../constants';
import {addParam, drawPreview, removeParam, updateParam} from '../../../../store/actions/ql';
import {getChartType, getParams, getPreviewData, getValid} from '../../../../store/reducers/ql';

import './TabParams.scss';

const {SimpleDatepicker, RangeDatepicker} = registry.common.components.getAll();

const b = block('ql-tab-params');

function formatDate(date: string) {
    return dateTimeParse(date, {
        timeZone: DEFAULT_TIMEZONE,
    })?.toISOString();
}

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
                                        this.handleParameterTypeUpdate(selectedType, {
                                            param,
                                            paramIndex,
                                            paramIsDate,
                                            paramIsInterval,
                                        });
                                    }}
                                    options={this.paramTypes}
                                    className={b('select')}
                                    popupClassName={b('select-popup')}
                                    value={param.type ? [param.type] : []}
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
                                                    {JSON.stringify(param.overridenValue)}
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
                >
                    {i18n('sql', 'button_add-param')}
                </Button>
            </div>
        );
    }

    private handleParameterTypeUpdate = (
        type: string,
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
                from: formatDate('now-3d'),
                to: formatDate('now-0d'),
            };
        } else if (paramIsDate) {
            newParam.defaultValue = formatDate('now-0d');
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
            return (
                <RangeDatepicker
                    wrapClassName={b('default-value-interval')}
                    from={formatDate(param.defaultValue.from)}
                    to={formatDate(param.defaultValue.to)}
                    dateFormat="YYYY-MM-DD"
                    timeFormat="HH:mm:ss"
                    onUpdate={(newValue) => {
                        let parsedValueFrom;
                        if (newValue.from?.date) {
                            parsedValueFrom = dateTimeParse(newValue.from.date, {
                                timeZone: DEFAULT_TIMEZONE,
                            });
                        }

                        let parsedValueTo;
                        if (newValue.to?.date) {
                            parsedValueTo = dateTimeParse(newValue.to.date || '', {
                                timeZone: DEFAULT_TIMEZONE,
                            });
                        }

                        const newParam = {...param};

                        if (parsedValueFrom && parsedValueTo) {
                            newParam.defaultValue = {
                                from: parsedValueFrom.toISOString(),
                                to: parsedValueTo.toISOString(),
                            };
                        }

                        this.onEditParam({param: newParam, paramIndex});
                    }}
                    hasCalendarIcon={false}
                    allowNullableValues={false}
                    hasClear={false}
                    withTime={param.type === QLParamType.DatetimeInterval}
                    timeZone={DEFAULT_TIMEZONE}
                />
            );
        } else if (paramIsDate && typeof param.defaultValue === 'string') {
            return (
                <SimpleDatepicker
                    wrapClassName={b('default-value-date')}
                    date={param.defaultValue}
                    withTime={param.type === QLParamType.Datetime}
                    allowRelative={true}
                    hasClear={false}
                    onUpdate={({date}: {date: string | null}) => {
                        const newParam = {...param};

                        if (date !== null) {
                            newParam.defaultValue = date;
                        }

                        this.onEditParam({param: newParam, paramIndex});
                    }}
                />
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
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<TabParamsProps, TabParamsInnerProps>(withRouter)(TabParams));
