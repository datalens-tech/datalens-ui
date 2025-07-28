import React from 'react';

import type {DropdownMenuItem, Toaster} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon, Loader} from '@gravity-ui/uikit';
import type {EntryDialogues} from 'components/EntryDialogues';
import {i18n} from 'i18n';
import type {SDK} from 'libs';
import _debounce from 'lodash/debounce';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import ResizeObserver from 'resize-observer-polyfill';
import type {
    Dataset,
    DatasetField,
    DatasetFieldCalcMode,
    Field,
    HierarchyField,
    Link,
    Update,
} from 'shared';
import {
    DATASET_FIELD_TYPES,
    EntryScope,
    PLACE,
    SectionDatasetQA,
    getResultSchemaFromDataset,
} from 'shared';
import {closeDialog, openDialog, openDialogParameter} from 'store/actions/dialog';
import type {DatalensGlobalState} from 'ui';
import {DL, EntryDialogName, NavigationMinimal} from 'ui';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';
import {selectDebugMode} from 'ui/store/selectors/user';
import {matchDatasetFieldFilter} from 'ui/utils/helpers';
import {openDialogMultidataset} from 'units/wizard/actions/dialog';
import {
    selectDataset,
    selectDatasetApiErrors,
    selectDatasetError,
    selectDatasetId,
    selectDatasetLoaded,
    selectDatasetLoading,
    selectDatasets,
    selectDimensions,
    selectExtendedDimensionsAndMeasures,
    selectFields,
    selectLinks,
    selectMeasures,
} from 'units/wizard/selectors/dataset';
import {selectUpdates} from 'units/wizard/selectors/preview';
import {selectIsNavigationVisible} from 'units/wizard/selectors/settings';
import {selectHierarchies, selectVisualization} from 'units/wizard/selectors/visualization';
import {selectWidget} from 'units/wizard/selectors/widget';
import {v1 as uuidv1} from 'uuid';

import type {DialogFieldEditorProps} from '../../../../../components/DialogFieldEditor/DialogFieldEditor';
import {DIALOG_FIELD_EDITOR} from '../../../../../components/DialogFieldEditor/DialogFieldEditor';
import {registry} from '../../../../../registry';
import Utils from '../../../../../utils';
import {
    fetchDataset,
    fetchWidget,
    removeDataset,
    setCurrentDataset,
    updateDatasetByValidation,
} from '../../../actions';
import {setDatasetApiErrors, setHierarchies, setLinks} from '../../../actions/dataset';
import {openHierarchyEditor} from '../../../actions/hierarchyEditor';
import {updatePreviewAndClientChartsConfig} from '../../../actions/preview';
import {toggleNavigation} from '../../../actions/settings';
import DNDContainer from '../../../components/DND/DNDContainer';
import DatasetSelect from '../../../components/DatasetSelect/DatasetSelect';
import type {DialogFieldState} from '../../../components/Dialogs/DialogField/DialogField';
import {DIALOG_FIELD} from '../../../components/Dialogs/DialogField/DialogField';
import SearchInput from '../../../components/SearchInput/SearchInput';
import {
    AVAILABLE_DATETIMETZ_FORMATS,
    AVAILABLE_DATETIME_FORMATS,
    AVAILABLE_DATE_FORMATS,
    DATASET_ERRORS,
    ITEM_TYPES,
} from '../../../constants';
import {
    generateNextTitle,
    prepareFieldForCreate,
    prepareFieldForUpdate,
} from '../../../utils/helpers';
import {isFieldVisible} from '../../../utils/wizard';

import type {DatasetItemProps} from './DatasetItem/DatasetItem';
import DatasetItem from './DatasetItem/DatasetItem';
import {FieldsContainer} from './FieldsContainer/FieldsContainer';
import HierarchyEditor from './HierarchyEditor/HierarchyEditor';

import iconPlus from 'ui/assets/icons/plus.svg';

import './SectionDataset.scss';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type OwnProps = {
    sdk: SDK;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    toaster: Toaster;
    workbookId?: string;
};

interface Props extends StateProps, DispatchProps, OwnProps {}

interface State {
    fieldEditorLoading: boolean;
    fieldEditorIsVisible: boolean;
    editingField: Field | undefined;
    dialogMultidatasetVisible: boolean;
    datasetSelectHeight: number;
    navigationMode: string;
    replaceDatasetId?: string;
    datasetReplacingInProgress?: boolean;
    dialogMultidatasetInitedDataset: Dataset | undefined;
    searchPhrase: string;
    appliedSearchPhrase: string;
    datasetItemsLoading: boolean;
}

class SectionDataset extends React.Component<Props, State> {
    private resizeObserver: ResizeObserver;
    private navigationButtonRef = React.createRef<HTMLDivElement>();
    private debouncedApply?: ReturnType<typeof _debounce>;

    constructor(props: Props) {
        super(props);

        this.resizeObserver = new ResizeObserver(this.onDatasetSelectResize);

        this.state = {
            fieldEditorLoading: false,
            fieldEditorIsVisible: false,
            editingField: undefined,
            dialogMultidatasetVisible: false,
            datasetSelectHeight: 0,
            navigationMode: '',
            dialogMultidatasetInitedDataset: undefined,
            searchPhrase: '',
            appliedSearchPhrase: '',
            datasetItemsLoading: false,
        };
    }

    componentDidMount() {
        this.resizeObserver.observe(this.navigationButtonRef.current!);
    }

    componentWillUnmount() {
        this.resizeObserver.disconnect();
    }

    onDatasetSelectResize = () => {
        this.setState({
            datasetSelectHeight: this.navigationButtonRef.current?.clientHeight || 0,
        });
    };

    createField = ({field}: {field: Field}) => {
        const dataset = this.props.dataset!;

        const preparedField = prepareFieldForCreate({
            field,
            dataset,
        });

        this.props.updateDatasetByValidation({
            dataset,
            updates: [
                {
                    action: 'add_field',
                    field: preparedField,
                },
            ],
        });
    };

    // Without the groupingChanged flag, the following case breaks:
    // - duplicate the formula field of the date|datetime type
    // - changing his grouping
    updateField = ({field, groupingChanged}: {field: Field; groupingChanged?: boolean}) => {
        const dataset = this.props.dataset!;

        const preparedField = prepareFieldForUpdate({
            field,
            groupingChanged,
        });

        this.props.updateDatasetByValidation({
            dataset,
            updates: [
                {
                    action: 'update_field',
                    field: preparedField,
                },
            ],
        });
    };

    saveAsNewField = (field: Field) => {
        const {updates} = this.props;
        const dataset = this.props.dataset!;

        const resultSchema = getResultSchemaFromDataset(dataset);

        const guid = uuidv1();

        let {title} = field;

        const fieldNext: Update['field'] = {
            ...field,
            guid,
        };

        const existedTitles = [...resultSchema, ...updates].map(
            (row) => (row as DatasetField).title || (row as Update).field.title || '',
        );
        title = generateNextTitle(existedTitles, title);

        fieldNext.title = title;
        fieldNext.originalFormula = field.originalFormula || field.formula;

        if (field.grouping && field.grouping !== 'none') {
            const [operation, mode] = field.grouping.split('-');

            let functionName;
            if (operation === 'trunc') {
                functionName = 'datetrunc';
            } else {
                functionName = 'datepart';
                fieldNext.data_type = DATASET_FIELD_TYPES.INTEGER;
                fieldNext.cast = DATASET_FIELD_TYPES.INTEGER;
            }

            field.formula = `${functionName}([${field.originalTitle || field.title}], "${mode}")`;

            fieldNext.grouping = field.grouping;

            fieldNext.originalDateCast = field.cast;
            fieldNext.originalSource = field.source;
        }

        if (field.formula) {
            // If there is a formula there, then we will put down all the accompanying attributes of the formula

            // In the grouping, we will allow aggregation
            if (fieldNext.grouping && fieldNext.grouping !== 'none') {
                fieldNext.aggregation = field.aggregation;
            } else {
                fieldNext.aggregation = field.aggregation || 'none';
            }

            fieldNext.calc_mode = 'formula';
            fieldNext.formula = field.formula;
            fieldNext.source = '';
        } else {
            // If there is just a field, then we will put down all the accompanying attributes of a simple field
            fieldNext.aggregation = field.aggregation;
            fieldNext.calc_mode = 'direct';
            fieldNext.source = field.source;
            fieldNext.cast = field.cast;
            fieldNext.data_type = field.data_type;
        }

        return this.props.updateDatasetByValidation({
            dataset,
            updates: [
                {
                    action: 'add_field',
                    field: fieldNext,
                },
            ],
        });
    };

    removeField = async ({field}: {field: Field}) => {
        const {dataset} = this.props;

        const failed = await (this.props.updateDatasetByValidation({
            dataset: dataset!,
            updates: [
                {
                    action: 'delete_field',
                    field,
                },
            ],
        }) as unknown as Promise<boolean>);

        if (failed) {
            this.props.toaster.add({
                title: i18n('wizard', 'label_error-remove-field'),
                name: 'WIZARD',
                theme: 'danger',
            });
        }
    };

    openDialogFieldEditor = async (item?: Field) => {
        const {dataset, fields, workbookId} = this.props;

        const fieldEditorFields = fields.filter(
            (field) => !field.quickFormula && !field.hidden && !field.virtual,
        );

        let field: Field | undefined;
        if (item) {
            if (item.local) {
                if (item.formula) {
                    field = item;
                } else {
                    field = {
                        ...item,
                        local: false,
                        title: '',
                        guid: uuidv1(),
                        calc_mode: 'formula' as DatasetFieldCalcMode,
                        formula: `[${item.originalTitle || item.title}]`,
                    };
                }
            } else if (item.formula) {
                field = {
                    ...item,
                    title: '',
                    guid: uuidv1(),
                };
            } else {
                field = {
                    ...item,
                    title: '',
                    guid: uuidv1(),
                    fakeTitle: '',
                    calc_mode: 'formula' as DatasetFieldCalcMode,
                    formula: `[${item.originalTitle || item.title}]`,
                };
            }
        }

        if (dataset) {
            const props: DialogFieldEditorProps<Field> = {
                datasetContent: dataset.dataset,
                datasetId: dataset.id,
                workbookId: workbookId ?? null,
                datasetOptions: dataset.options,
                field,
                fields: fieldEditorFields,
                onlyFormulaEditor: true,
                onClose: this.closeDialogFieldEditor,
                onSave: this.onSaveDialogFieldEditor,
                onCreate: this.onCreateDialogFieldEditor,
                onLoadStart: () => {
                    this.setState({fieldEditorLoading: true});
                },
                onLoadComplete: () => {
                    this.setState({fieldEditorLoading: false});
                },
            };
            this.props.openDialog({
                id: DIALOG_FIELD_EDITOR,
                props,
            });
        }
    };

    closeDialogFieldEditor = () => {
        this.props.closeDialog();
    };

    onNavigationClick = async (data: {entryId: string}) => {
        const {
            datasetError,
            datasets,
            datasetApiErrors,
            fetchDataset,
            removeDataset,
            setCurrentDataset,
            toggleNavigation,
            datasetId,
            setDatasetApiErrors,
        } = this.props;

        const newDatasetId = data.entryId;

        toggleNavigation(false);

        const prevDatasetId = this.state.replaceDatasetId || datasetId;

        const prevDataset = datasets.find((dataset) => dataset.id === prevDatasetId);

        if (prevDataset) {
            if (prevDataset.id !== data.entryId) {
                const existingDataset = datasets.find(
                    (someDataset) => someDataset.id === newDatasetId,
                );

                if (existingDataset) {
                    setCurrentDataset({dataset: existingDataset});
                } else {
                    await fetchDataset({
                        id: newDatasetId,
                        replacing: this.state.navigationMode === 'replace',
                    });

                    const {dataset: newDataset} = this.props;

                    if (this.state.navigationMode === 'replace') {
                        this.setState({datasetReplacingInProgress: true});
                        await removeDataset({
                            datasetId: prevDataset.id,
                            newDataset,
                        });

                        if (datasets.length > 1) {
                            this.openDialogMultidataset({initedDataset: newDataset});
                        }
                    } else if (!datasetError) {
                        this.openDialogMultidataset({initedDataset: newDataset});
                    }
                }
            }
        } else {
            if (datasetApiErrors.some((item) => item.datasetId === prevDatasetId)) {
                setDatasetApiErrors({
                    datasetApiErrors: datasetApiErrors.filter(
                        (item) => item.datasetId !== prevDatasetId,
                    ),
                });
            }

            await fetchDataset({
                id: newDatasetId,
            });
        }

        this.setState({
            navigationMode: '',
            replaceDatasetId: '',
            datasetReplacingInProgress: false,
        });
    };

    onDatasetChange = (dataset: Dataset) => {
        if (this.props.dataset !== dataset) {
            this.props.setCurrentDataset({dataset});
        }
    };

    onPreselectClick = () => {
        this.props.toggleNavigation();
    };

    onOpenDatasetClick = (id: string) => {
        window.open(`${DL.ENDPOINTS.dataset}/${id}`);
    };

    onAddDatasetClick = () => {
        const {toggleNavigation} = this.props;

        this.setState({
            navigationMode: 'add',
        });

        toggleNavigation(true);
    };

    onReplaceDatasetClick = (id: string) => {
        const {toggleNavigation} = this.props;

        this.setState({
            navigationMode: 'replace',
            replaceDatasetId: id,
        });

        toggleNavigation(true);
    };

    onRemoveDatasetClick = (datasetId: string) => {
        const {removeDataset, setDatasetApiErrors, datasetApiErrors} = this.props;

        if (window.confirm(i18n('wizard', 'toast_confirm-remove-item'))) {
            removeDataset({datasetId});

            if (datasetApiErrors.some((item) => item.datasetId === datasetId)) {
                setDatasetApiErrors({
                    datasetApiErrors: datasetApiErrors.filter(
                        (item) => item.datasetId !== datasetId,
                    ),
                });
            }
        }
    };

    onButtonDatasetTryAgainClick = () => {
        const {extractEntryId} = registry.common.functions.getAll();
        const entryId = extractEntryId(window.location.pathname);

        if (entryId) {
            this.props.fetchWidget({entryId});
        }
    };

    onButtonDatasetRequestRightsClick = () => {
        const {dataset, entryDialoguesRef, datasetId} = this.props;

        entryDialoguesRef.current!.open({
            dialog: EntryDialogName.Unlock,
            dialogProps: {
                // @ts-ignore
                entry: {
                    ...dataset,
                    entryId: datasetId || dataset!.id,
                },
            },
        });
    };

    onNavigationClose = (event: any) => {
        const {toggleNavigation, isNavigationVisible} = this.props;

        const className = event.target.getAttribute('class') || '';

        // TODO: this logic is clearly not the best. onOutsideClick should be handled correctly inside the Popup, but this does not happen
        if (isNavigationVisible) {
            if (
                (this.navigationButtonRef.current &&
                    !this.navigationButtonRef.current.contains(event.target) &&
                    className.indexOf &&
                    className.indexOf('menu__') === -1 &&
                    className.indexOf('multidataset') === -1 &&
                    event.composedPath().every((x: any) => {
                        const pathElementClassName = x.getAttribute?.('class');
                        return (
                            !pathElementClassName ||
                            pathElementClassName.indexOf('dl-navigation-minimal__popup') === -1
                        );
                    })) ||
                (event instanceof KeyboardEvent && event.code === 'Escape')
            ) {
                toggleNavigation(false);
            }
        }
    };

    onSaveDialogFieldEditor = (field: Field) => {
        if (field.local) {
            this.updateField({field: field});
        } else {
            this.createField({field: field});
        }

        this.closeDialogFieldEditor();
    };

    onCreateDialogFieldEditor = (field: DatasetField) => {
        this.createField({field: field as Field});

        this.closeDialogFieldEditor();
    };

    openDialogField = (
        item: Field,
        extra: {
            title?: boolean;
            label?: string;
            hideLabel?: boolean;
        },
    ) => {
        const {dataset, visualization} = this.props;
        this.props.openDialog({
            id: DIALOG_FIELD,
            props: {
                item,
                extra,
                visualization,
                options: dataset && dataset.options,
                onCancel: this.closeDialogField,
                formattingEnabled: false,
                onApply: this.onDialogFieldApply.bind(null, item),
                markupTypeEnabled: false,
            },
        });
    };

    closeDialogField = () => {
        this.props.closeDialog();
    };

    openDialogMultidataset = ({initedDataset}: {initedDataset?: Dataset}) =>
        this.props.openDialogMultidataset({
            onAddDatasetClick: this.onAddDialogMultidatasetClick,
            onRemoveDatasetClick: this.onRemoveDialogMultidatasetClick,
            onApply: this.onApplyDialogMultidataset,
            initedDataset,
        });

    onClickEditDatasetItem = (item: Field) => {
        if ((item as unknown as {asPseudo: boolean}).asPseudo) {
            return;
        }

        this.openDialogFieldEditor(item);
    };

    onClickDuplicateDatasetItem = (item: Field) => {
        return this.saveAsNewField(item);
    };

    onClickRemoveDatasetItem = async (item: Field) => {
        if (!item.local) {
            return;
        }

        return this.removeField({field: item});
    };

    onApplyDialogMultidataset = ({links}: {links: Link[]}) => {
        const {setLinks, updatePreviewAndClientChartsConfig, closeDialog} = this.props;

        // It is necessary to update the reference to the array and redraw the components that depend on it
        const newLinks = [...links];

        setLinks({
            links: newLinks,
        });

        updatePreviewAndClientChartsConfig({});

        closeDialog();
    };

    onAddDialogMultidatasetClick = () => {
        const {closeDialog, toggleNavigation} = this.props;

        closeDialog();

        this.setState({
            navigationMode: 'add',
        });

        toggleNavigation(true);
    };

    onRemoveDialogMultidatasetClick = (dataset: Dataset) => {
        if (confirm(i18n('wizard', 'toast_confirm-remove-item'))) {
            this.props.removeDataset({datasetId: dataset.id});
        }
    };

    onSearchInputChange = (value: string) => {
        this.setState(
            {
                searchPhrase: value,
            },
            () => {
                if (this.debouncedApply) {
                    this.debouncedApply.cancel();
                }

                const searchPhrase = value.toLowerCase();

                this.debouncedApply = _debounce(() => {
                    this.setState({
                        appliedSearchPhrase: searchPhrase,
                    });
                }, 150);

                this.debouncedApply();
            },
        );
    };

    handleCreateParameterField = (field: DatasetField) => {
        const {dataset} = this.props;

        if (!dataset) {
            return;
        }

        const parameterField = {
            ...field,
            datasetId: dataset.id,
            local: true,
        } as Field;

        this.props.updateDatasetByValidation({
            dataset,
            updates: [
                {
                    action: 'add_field',
                    field: parameterField,
                },
            ],
        });
    };

    renderDatasetItem = (props: any) => {
        const datasetItemProps: DatasetItemProps = {
            dndProps: props,
            links: this.props.links,
            removeHierarchy: this.removeHierarchy,
            openHierarchyEditor: this.props.openHierarchyEditor,
            openDialogField: this.openDialogField,
            onClickEditDatasetItem: this.onClickEditDatasetItem,
            openDialogMultidataset: this.openDialogMultidataset.bind(null, {}),
            openDialog: this.props.openDialog,
            onClickDuplicateDatasetItem: async (item) => {
                this.setState({
                    datasetItemsLoading: true,
                });

                await this.onClickDuplicateDatasetItem(item);

                this.setState({
                    datasetItemsLoading: false,
                });
            },
            onClickRemoveDatasetItem: async (item) => {
                this.setState({
                    datasetItemsLoading: true,
                });

                await this.onClickRemoveDatasetItem(item);

                this.setState({
                    datasetItemsLoading: false,
                });
            },
        };

        // div is necessary because DnDItem needs a `native element node', not a React component
        return (
            <div>
                <DatasetItem {...datasetItemProps} />
            </div>
        );
    };

    renderSections = () => {
        const {visualization, dlDebugMode} = this.props;
        let {dimensions, measures} = this.props;

        const {searchPhrase, appliedSearchPhrase, datasetItemsLoading} = this.state;

        ({dimensions, measures} = selectExtendedDimensionsAndMeasures(
            visualization,
            dimensions,
            measures,
        ));

        if (appliedSearchPhrase) {
            dimensions = dimensions.filter((item) =>
                matchDatasetFieldFilter(appliedSearchPhrase, dlDebugMode, {
                    title: item.title,
                    description: item.description,
                    guid: item.guid,
                }),
            );

            measures = measures.filter((item) =>
                matchDatasetFieldFilter(appliedSearchPhrase, dlDebugMode, {
                    title: item.title,
                    description: item.description,
                    guid: item.guid,
                }),
            );
        }

        const filteredDimensions = dimensions.filter(isFieldVisible);
        const filteredMeasures = measures.filter(isFieldVisible);

        return (
            <div
                className="dataset-wrapper"
                data-qa={SectionDatasetQA.DatasetFields}
                style={{
                    height: `calc(100% - ${this.state.datasetSelectHeight}px)`,
                }}
            >
                {datasetItemsLoading && (
                    <div className="dataset-veil">
                        <Loader className="dataset-fields-loader" size={'s'} />
                    </div>
                )}
                <div className="subcontainer actions-subcontainer">
                    <div className="subheader actions-subheader">
                        <SearchInput
                            text={searchPhrase}
                            placeholder={i18n('wizard', 'field_search')}
                            onChange={this.onSearchInputChange}
                        />

                        {this.renderAddButton()}
                    </div>
                </div>
                <div className="subcontainer dimensions-subcontainer">
                    <div className="subheader dimensions-subheader">
                        <span>{i18n('wizard', 'section_dimensions')}</span>
                    </div>
                    <DNDContainer
                        id="dimensions-container"
                        noRemove={true}
                        items={filteredDimensions}
                        allowedTypes={ITEM_TYPES.DIMENSIONS}
                        wrapTo={this.renderDatasetItem}
                    />
                </div>
                {this.getHierarchySubcontainer()}
                <HierarchyEditor />
                {filteredMeasures.length > 0 && (
                    <div className="subcontainer measures-subcontainer">
                        <div className="subheader measures-subheader">
                            <span>{i18n('wizard', 'section_measures')}</span>
                        </div>
                        <DNDContainer
                            id="measures-container"
                            noRemove={true}
                            allowedTypes={ITEM_TYPES.MEASURES}
                            items={filteredMeasures}
                            wrapTo={this.renderDatasetItem}
                        />
                    </div>
                )}
                <FieldsContainer
                    wrapTo={this.renderDatasetItem}
                    appliedSearchPhrase={appliedSearchPhrase}
                />
            </div>
        );
    };

    getHierarchySubcontainer() {
        let {hierarchies} = this.props;
        const {appliedSearchPhrase} = this.state;

        if (!hierarchies.length) {
            return null;
        }

        if (appliedSearchPhrase) {
            hierarchies = hierarchies.filter((item) => {
                return item.title.toLowerCase().includes(appliedSearchPhrase);
            });
        }

        return (
            <div className="subcontainer hierarchy-subcontainer">
                <div className="subheader hierarchy-subheader">
                    <span>{i18n('wizard', 'section_hierarchy')}</span>
                </div>
                <DNDContainer
                    id="hierarchy-container"
                    noRemove={true}
                    items={hierarchies}
                    wrapTo={this.renderDatasetItem}
                />
            </div>
        );
    }

    renderBlank() {
        return (
            <div className="dataset-blank" data-qa={SectionDatasetQA.DatasetEmptyMessage}>
                {i18n('wizard', 'label_dataset-blank')}
            </div>
        );
    }

    renderSectionsOrBlank = () => {
        const {datasetLoading, datasetLoaded, datasetError} = this.props;
        const {datasetReplacingInProgress} = this.state;

        if (datasetLoading || datasetReplacingInProgress) {
            return <Loader className="dataset-fields-loader" size={'s'} />;
        }

        if (datasetError) {
            const {status, details} = Utils.parseErrorResponse(datasetError);
            const scope = details.scope || 'dataset';

            let datasetErrorText;

            if (status === 403) {
                datasetErrorText =
                    DATASET_ERRORS[`403-${scope}` as keyof typeof DATASET_ERRORS] ||
                    DATASET_ERRORS.UNKNOWN;
            } else {
                datasetErrorText =
                    DATASET_ERRORS[status as keyof typeof DATASET_ERRORS] || DATASET_ERRORS.UNKNOWN;
            }

            let errorContent;

            if (datasetErrorText === DATASET_ERRORS['403-dataset']) {
                errorContent = (
                    <div>
                        <Button
                            qa={SectionDatasetQA.RequestDatasetAccess}
                            onClick={this.onButtonDatasetRequestRightsClick}
                            view={'action'}
                            size="l"
                        >
                            {i18n('wizard', 'button_access-rights')}
                        </Button>
                    </div>
                );
            } else if (datasetErrorText === DATASET_ERRORS[404]) {
                errorContent = <div></div>;
            } else {
                errorContent = (
                    <div>
                        <Button
                            className="btn-retry"
                            onClick={this.onButtonDatasetTryAgainClick}
                            view={'action'}
                            qa="wizard-dataset-btn-retry"
                            size="l"
                        >
                            {i18n('wizard', 'button_retry')}
                        </Button>
                    </div>
                );
            }

            return (
                <div className="error">
                    {i18n('wizard', datasetErrorText)}
                    {errorContent}
                </div>
            );
        }

        return datasetLoaded ? this.renderSections() : this.renderBlank();
    };

    removeHierarchy = (hierarchy: HierarchyField) => {
        const hierarchies = this.props.hierarchies.filter((el) => el.guid !== hierarchy.guid);

        this.props.setHierarchies({
            hierarchies,
        });

        this.props.updatePreviewAndClientChartsConfig({});
    };

    renderAddButton() {
        return (
            <DropdownMenu
                size="s"
                switcherWrapperClassName="add-param-btn-wrapper"
                renderSwitcher={({onClick, onKeyDown}) => (
                    <Button
                        className="add-param-btn"
                        view="outlined"
                        size="m"
                        loading={this.state.fieldEditorLoading}
                        qa="add-param"
                        onClick={onClick}
                        onKeyDown={onKeyDown}
                    >
                        <Icon data={iconPlus} size={15} />
                    </Button>
                )}
                items={this.getDropdownItems()}
            />
        );
    }

    render() {
        const {
            sdk,
            dataset,
            datasets,
            datasetApiErrors,
            datasetLoading,
            isNavigationVisible,
            datasetLoaded,
            widget,
        } = this.props;

        const workbookId = widget.workbookId as string;

        const startFrom = dataset?.key.replace(/[^/]+$/, '')
        
        const {getPlaceSelectParameters} = registry.common.functions.getAll();

        return (
            <div
                className={`container datasets-container${!datasetLoaded ? ' blank' : ''}`}
                data-qa={SectionDatasetQA.DatasetContainer}
            >
                <div
                    className="actions-container datasets-actions-container"
                    ref={this.navigationButtonRef}
                >
                    {datasetLoading ? (
                        <div className="datasets-actions-loader-wrapper">
                            <Loader className="dataset-list-loader" size="s" />
                        </div>
                    ) : (
                        <React.Fragment>
                            <DatasetSelect
                                dataset={dataset}
                                datasets={datasets}
                                datasetApiErrors={datasetApiErrors}
                                onChange={this.onDatasetChange}
                                onPreselectClick={this.onPreselectClick}
                                onOpenDatasetClick={this.onOpenDatasetClick}
                                onAddDatasetClick={this.onAddDatasetClick}
                                onReplaceDatasetClick={this.onReplaceDatasetClick}
                                openDialogMultidataset={this.openDialogMultidataset}
                                onRemoveDatasetClick={this.onRemoveDatasetClick}
                                toggleNavigation={this.props.toggleNavigation}
                                isPopupVisible={this.props.isNavigationVisible}
                            />
                            {workbookId ? (
                                <WorkbookNavigationMinimal
                                    anchor={this.navigationButtonRef}
                                    visible={isNavigationVisible}
                                    onClose={this.onNavigationClose}
                                    onEntryClick={this.onNavigationClick}
                                    workbookId={workbookId}
                                    scope={EntryScope.Dataset}
                                />
                            ) : (
                                <NavigationMinimal
                                    sdk={sdk}
                                    anchor={this.navigationButtonRef}
                                    visible={isNavigationVisible}
                                    onClose={this.onNavigationClose}
                                    onEntryClick={this.onNavigationClick}
                                    clickableScope="dataset"
                                    scope="dataset"
                                    startFrom={startFrom}
                                    ignoreWorkbookEntries={true}
                                    placeSelectParameters={getPlaceSelectParameters([
                                        PLACE.ROOT,
                                        PLACE.FAVORITES,
                                        PLACE.DATASETS,
                                    ])}
                                />
                            )}
                        </React.Fragment>
                    )}
                </div>
                {this.renderSectionsOrBlank()}
            </div>
        );
    }

    private getDropdownItems = (): DropdownMenuItem[] => {
        return [
            {
                action: () => {
                    this.openDialogFieldEditor();
                },
                text: i18n('wizard', 'add_field_item'),
                qa: SectionDatasetQA.CreateFieldButton,
            },
            {
                action: () => {
                    this.props.openHierarchyEditor();
                },
                text: i18n('wizard', 'add_hierarchy_item'),
                qa: SectionDatasetQA.CreateHierarchyButton,
            },
            {
                action: () => {
                    this.props.openDialogParameter({
                        type: 'create',
                        onApply: this.handleCreateParameterField,
                    });
                },
                text: i18n('wizard', 'add_parameter_item'),
                qa: SectionDatasetQA.CreateParameterButton,
            },
        ];
    };

    private onDialogFieldApply = (
        target: Field,
        {title, cast, aggregation, format, grouping, formatting}: DialogFieldState,
    ) => {
        let groupingChanged = false;

        if (target.title !== title) {
            target.title = title!;
        }

        if (target.format !== format) {
            target.format = format!;
        }

        if (target.cast !== cast) {
            // TODO: there are a couple of similar places, probably this good can be carried out in a separate function
            if (cast === 'date') {
                target.format = AVAILABLE_DATE_FORMATS[2];
            } else if (cast === 'genericdatetime') {
                target.format = AVAILABLE_DATETIME_FORMATS[5];
            } else if (cast === 'datetimetz') {
                target.format = AVAILABLE_DATETIMETZ_FORMATS[7];
            }

            target.cast = cast!;
            target.data_type = cast as unknown as DATASET_FIELD_TYPES;
        }

        if (target.aggregation !== aggregation) {
            target.aggregation = aggregation!;
        }

        if (target.grouping !== grouping) {
            groupingChanged = true;
            target.grouping = grouping!;
        }

        if (target.formatting !== formatting) {
            target.formatting = formatting;
        }

        if (target.local) {
            this.updateField({field: target, groupingChanged});
        } else {
            this.saveAsNewField(target);
        }
        this.closeDialogField();
    };
}

const mapStateToProps = (state: DatalensGlobalState, ownProps: OwnProps) => {
    const {workbookId} = ownProps;

    let widget = selectWidget(state);

    if (widget.fake && workbookId) {
        widget = {
            ...widget,
            workbookId,
        };
    }

    return {
        datasetLoading: selectDatasetLoading(state),
        datasetLoaded: selectDatasetLoaded(state),
        isNavigationVisible: selectIsNavigationVisible(state),
        fields: selectFields(state),
        dataset: selectDataset(state),
        datasets: selectDatasets(state),
        datasetApiErrors: selectDatasetApiErrors(state),
        links: selectLinks(state),
        updates: selectUpdates(state),
        datasetError: selectDatasetError(state),
        measures: selectMeasures(state),
        dimensions: selectDimensions(state),
        visualization: selectVisualization(state),
        hierarchies: selectHierarchies(state),
        widget,
        datasetId: selectDatasetId(state),
        dlDebugMode: selectDebugMode(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updatePreviewAndClientChartsConfig,
            fetchDataset,
            setCurrentDataset,
            removeDataset,
            setLinks,
            toggleNavigation,
            updateDatasetByValidation,
            setHierarchies,
            openHierarchyEditor,
            openDialog,
            closeDialog,
            fetchWidget,
            openDialogMultidataset,
            openDialogParameter,
            setDatasetApiErrors,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(SectionDataset);
