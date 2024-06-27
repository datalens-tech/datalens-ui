import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import type {SelectOption} from '@gravity-ui/uikit';
import {Button, Icon, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {QlConfigParam} from 'shared/types/config/ql';
import type {DatalensGlobalState} from 'ui';

import {QLParamType, TabParamsQA, resolveRelativeDate} from '../../../../../../../shared';
import {openDialogQLParameter} from '../../../../store/actions/dialog';
import {addParam, drawPreview, removeParam, updateParam} from '../../../../store/actions/ql';
import {getChartType, getParams, getPreviewData, getValid} from '../../../../store/reducers/ql';

import {DefaultValue} from './DefaultValue';
import {OverridenValue} from './OverridenValue';

import './TabParams.scss';

const b = block('ql-tab-params');

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
                                    qa={TabParamsQA.ParamType}
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
                                    qa={TabParamsQA.ParamName}
                                />
                                <span className={b('delimeter')}>:</span>
                                <DefaultValue
                                    param={param}
                                    paramIndex={paramIndex}
                                    onClickButtonEditParamValue={this.onClickButtonEditParamValue}
                                    onEditParam={this.onEditParam}
                                    onClickButtonAddParamValue={this.onClickButtonAddParamValue}
                                    onClickButtonRemoveParamValue={
                                        this.onClickButtonRemoveParamValue
                                    }
                                />
                                <span className={b('delimeter')}>:</span>
                                <TextInput
                                    view="normal"
                                    size="m"
                                    className={b('param-label')}
                                    placeholder={i18n('sql', 'label_placeholder-label')}
                                    value={param.label}
                                    onUpdate={(label) => {
                                        const newParam = {...param};

                                        newParam.label = label;

                                        this.onEditParam({param: newParam, paramIndex});
                                    }}
                                    qa={TabParamsQA.ParamLabel}
                                />
                                
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
                                                    <OverridenValue
                                                        overridenValue={param.overridenValue}
                                                        type={param.type as QLParamType}
                                                        paramIsInterval={paramIsInterval}
                                                        paramIsDate={paramIsDate}
                                                    />
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
                    qa={TabParamsQA.AddParamBtn}
                >
                    {i18n('sql', 'button_add-param')}
                </Button>
            </div>
        );
    }

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
