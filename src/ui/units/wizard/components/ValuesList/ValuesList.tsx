import React from 'react';

import {Loader, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _ from 'lodash';
import {
    ApiV2Filter,
    ApiV2Parameter,
    ApiV2RequestField,
    DATASET_FIELD_TYPES,
    DatasetOptions,
    Field,
    FilterField,
    MarkupItem,
    TIMEOUT_90_SEC,
    Update,
    getFieldsApiV2RequestSection,
    getFiltersApiV2RequestSection,
    getParametersApiV2RequestSection,
    isMeasureName,
    markupToRawString,
} from 'shared';
import {getColorsConfigKey} from 'shared/modules/colors/common-helpers';
import {getLineTimeDistinctValue} from 'shared/modules/colors/distincts-helpers';
import type {GetDistinctsApiV2TransformedResponse} from 'shared/schema';

import {getWhereOperation} from '../../../../libs/datasetHelper';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {ExtraSettings} from '../Dialogs/DialogColor/DialogColor';

import './ValuesList.scss';

const b = block('values-list');

const MAX_VALUES_COUNT = 100;
const DEBOUNCE_DELAY = 250;
const VALUES_LOAD_LIMIT = 1000;

const getShownValues = ({searchValue, values}: {searchValue: string; values: string[]}) => {
    let shownValues;

    if (searchValue) {
        const searchPattern = new RegExp(searchValue, 'i');
        shownValues = values.filter((value) => searchPattern.test(value));
    } else {
        shownValues = values;
    }

    return shownValues.slice(0, MAX_VALUES_COUNT);
};
export interface Props {
    item: Field;
    items?: Field[];
    filters: FilterField[];
    parameters: Field[];
    dashboardParameters: Field[];
    updates: Update[];
    options: DatasetOptions;
    datasetId: string;
    selectedValue: string | null;
    renderValueIcon: (value: string) => React.ReactNode;
    onChangeSelectedValue: (selectedValue: string | null, shouldClearPalette?: boolean) => void;
    extra?: ExtraSettings;
    distincts?: Record<string, string[]>;
    // this prop is only used when section supports handling of multiple fields; otherwise it must be only undefined.
    sectionFields?: Field[];
}

interface State {
    values: string[];
    searchValue: string;
    itemGuid: string | undefined;
    isRetry: boolean;
    useSuggest: boolean;
    suggestFetching: boolean;
    error: any | undefined;
    fetching: boolean;
}

class ValuesList extends React.Component<Props, State> {
    private isUnmounted: boolean;
    private debounced: ReturnType<typeof _.debounce> | undefined;

    constructor(props: Props) {
        super(props);

        this.isUnmounted = false;
        this.debounced = undefined;

        this.state = {
            values: [],
            searchValue: '',
            itemGuid: undefined,
            isRetry: false,
            useSuggest: false,
            suggestFetching: false,
            error: undefined,
            fetching: false,
        };
    }

    componentDidMount() {
        const {items} = this.props;
        if (items?.length) {
            this.composeData();
            return;
        }

        this.fetchInitialData();
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (prevProps.item.guid !== this.props.item.guid) {
            this.fetchInitialData();
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {error, searchValue, suggestFetching} = this.state;
        const {fetching} = this.state;

        return (
            <div className={b('values-container')}>
                {error ? (
                    <div className={b('error-label')}>
                        {i18n('wizard', 'label_error-loading-filter-values')}
                    </div>
                ) : (
                    <React.Fragment>
                        <div className={b('values-search')}>
                            <TextInput
                                size="m"
                                placeholder={i18n('wizard', 'field_search')}
                                value={searchValue}
                                onUpdate={this.onSearchChange}
                            />
                        </div>
                        <div className={b('values-list')}>
                            {fetching || suggestFetching ? (
                                this.renderLoader()
                            ) : (
                                <React.Fragment>
                                    {getShownValues({
                                        searchValue: this.state.searchValue,
                                        values: this.state.values,
                                    }).map(this.renderValueItem)}
                                </React.Fragment>
                            )}
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }

    renderLoader = () => {
        return (
            <div className={b('loader')}>
                <Loader size="s" />
            </div>
        );
    };

    renderValueItem = (value: string) => {
        const {selectedValue, renderValueIcon} = this.props;
        return (
            <div
                key={value}
                className={b('value', {selected: selectedValue === value})}
                onClick={() => {
                    this.props.onChangeSelectedValue(value);
                }}
            >
                {renderValueIcon(value)}
                <div className={b('value-label')} title={value}>
                    {value}
                </div>
            </div>
        );
    };

    composeData = () => {
        const {items = []} = this.props;
        const values = [
            ...new Set(
                items.map(
                    (item) => getColorsConfigKey(item, items, {isMeasureNames: true}) as string,
                ),
            ),
        ];

        this.setState({
            values,
            itemGuid: undefined,
            error: undefined,
        });

        this.props.onChangeSelectedValue(values[0] || null, Boolean(this.state.itemGuid));
    };

    async fetchInitialData() {
        const {item, distincts: externalDistincts, sectionFields} = this.props;
        const {isRetry} = this.state;

        this.setState({
            fetching: true,
        });

        try {
            let values: string[] = [];
            if (externalDistincts) {
                const placeholderFields = sectionFields || [item];

                const distincts = placeholderFields.map((v) => {
                    return externalDistincts[v.guid];
                });

                values = this.buildMultipleColorsDistincts(distincts, 0);
            } else {
                values = this.getValuesFromDistincts(await this.getDistincts());
            }

            const useSuggest = values.length === VALUES_LOAD_LIMIT;

            const oldItemGuid = this.state.itemGuid;
            const newItemGuid = item.guid;

            this.setState({
                values,
                useSuggest,
                error: null,
                fetching: false,
                itemGuid: newItemGuid,
            });

            const shouldClearPalette =
                Boolean(oldItemGuid) && Boolean(newItemGuid) && newItemGuid !== oldItemGuid;

            this.props.onChangeSelectedValue(values[0] || null, shouldClearPalette);
        } catch (error) {
            if (this.isUnmounted || getSdk().isCancel(error)) {
                return;
            }
            logger.logError('DialogColorPalette: fetchInitialData failed', error);

            if (!isRetry) {
                // Retry in case the source does not support the operation from the installed filters
                this.setState({isRetry: true}, this.fetchInitialData);

                return;
            }

            this.setState({
                error,
                values: [],
            });
            this.setState({
                fetching: false,
            });
            this.props.onChangeSelectedValue(null);
        }
    }

    getValuesFromDistincts = ({result}: GetDistinctsApiV2TransformedResponse) => {
        const {item, extra} = this.props;
        const distincts = result.data.Data.reduce((acc: string[], cur: (string | MarkupItem)[]) => {
            const rawDistinctValue = cur[0];
            let distinctValue: string;

            if (item.data_type === DATASET_FIELD_TYPES.MARKUP && rawDistinctValue) {
                distinctValue = markupToRawString(rawDistinctValue as MarkupItem);
            } else {
                distinctValue = (rawDistinctValue as string) || 'Null';
            }

            return acc.concat(distinctValue);
        }, []);

        return [...distincts, ...(extra?.extraDistinctsForDiscreteMode || [])];
    };

    getDistincts = (): Promise<GetDistinctsApiV2TransformedResponse> => {
        const {datasetId, updates, item} = this.props;

        if (isMeasureName(item)) {
            return Promise.resolve({result: {data: {Data: []}}});
        }

        const fields = this.getFieldsSection();
        const filters = this.getWhereSection();
        const parameter_values = this.getParametersSection();

        getSdk().cancelRequest('getDistincts');

        return getSdk().bi.getDistinctsApiV2(
            {
                updates,
                datasetId,
                limit: VALUES_LOAD_LIMIT,
                fields,
                filters,
                parameter_values,
            },
            {concurrentId: 'getDistincts', timeout: TIMEOUT_90_SEC},
        );
    };

    getFieldsSection = (): ApiV2RequestField[] => {
        const {item} = this.props;
        return getFieldsApiV2RequestSection([item], 'distinct');
    };

    getParametersSection = (): ApiV2Parameter[] => {
        const {parameters, dashboardParameters} = this.props;
        return getParametersApiV2RequestSection({parameters, dashboardParameters});
    };

    getWhereSection = (): ApiV2Filter[] => {
        const {item, options, filters = []} = this.props;
        const {searchValue, useSuggest, isRetry} = this.state;

        const where: ApiV2Filter[] = [];

        if (filters.length && !isRetry) {
            const newWhereItems = getFiltersApiV2RequestSection(filters);

            where.push(...newWhereItems);
        }

        if (useSuggest && searchValue) {
            where.push({
                values: [searchValue],
                operation: getWhereOperation(item, options)!,
                ref: {type: 'id', id: item.guid},
            });
        }

        return where;
    };

    onChangeSuggest = async () => {
        const {useSuggest} = this.state;

        if (!useSuggest) {
            return;
        }

        try {
            this.setState({suggestFetching: true});

            const distincts = await this.getDistincts();
            const values = this.getValuesFromDistincts(distincts);

            this.setState({
                values,
                suggestFetching: false,
            });

            this.props.onChangeSelectedValue(values[0] || null);
        } catch (error) {
            if (this.isUnmounted || getSdk().isCancel(error)) {
                return;
            }
            logger.logError('DialogColorPalette: onChangeSuggest failed', error);

            this.setState({suggestFetching: false});
        }
    };

    debouncedChangeSuggest = () => {
        if (this.debounced) {
            this.debounced.cancel();
        }

        this.debounced = _.debounce(this.onChangeSuggest, DEBOUNCE_DELAY);
        this.debounced();
    };

    onSearchChange = (searchValue: string) => {
        const {values} = this.state;

        this.setState(
            {
                searchValue,
            },
            this.debouncedChangeSuggest,
        );

        this.props.onChangeSelectedValue(values[0] || null);
    };

    private buildMultipleColorsDistincts(distincts: string[][], index: number): string[] {
        const root = distincts[index];
        if (distincts.length - 1 === index) {
            return root;
        }

        return root.reduce((acc, rootDistinct) => {
            return [
                ...acc,
                ...this.buildMultipleColorsDistincts(distincts, index + 1).map((subDistinct) =>
                    getLineTimeDistinctValue(subDistinct, rootDistinct),
                ),
            ];
        }, [] as string[]);
    }
}

export default ValuesList;
