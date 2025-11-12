import React from 'react';

import {Hashtag} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {TableCellsRow, TableColumn} from 'shared/types/chartkit/table';
import {openDialogErrorWithTabs} from 'store/actions/dialog';
import {Utils} from 'ui';
import TableWidget from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/TableWidget';
import type {TableWidgetData} from 'ui/libs/DatalensChartkit/types';
import type {DatasetError, DatasetPreview, DatasetPreviewView} from 'units/datasets/store/types';

import {BI_ERRORS} from '../../../../constants';
import ContainerLoader from '../ContainerLoader/ContainerLoader';

import './PreviewTable.scss';

const b = block('preview-table');

const BASE_CELL_CSS = {
    height: '32px',
    borderBottom: '1px solid var(--ds-color-divider)',
    whiteSpace: 'nowrap',
    paddingTop: '0',
    paddingBottom: '0',
};

const HEADER_CELL_CSS = {
    ...BASE_CELL_CSS,
    background: 'var(--ds-color-base-area)',
    borderTop: '1px solid var(--ds-color-divider)',
};

const BASE_COLUMN_PARAMETERS: Pick<TableColumn, 'sortable' | 'verticalAlignment' | 'css'> = {
    sortable: false,
    verticalAlignment: 'center',
    css: HEADER_CELL_CSS,
};

const INDEX_COLUMN: TableColumn = {
    id: 'positionIndex',
    type: 'text',
    name: 'positionIndex',
    formattedName: <Icon className={b('header-icon-table-count')} data={Hashtag} size={14} />,
    ...BASE_COLUMN_PARAMETERS,
};

type Props = {
    view: DatasetPreviewView;
    preview: DatasetPreview;
    error?: DatasetError;
};

function PreviewTable(props: Props) {
    const dispatch = useDispatch();

    const {error, preview, view} = props;
    const {isLoading, readyPreview} = preview;

    const getTextPreviewLoader = () => {
        if (!readyPreview) {
            return null;
        }

        switch (readyPreview.toLowerCase()) {
            case 'pending':
                return i18n('dataset.dataset-editor.modify', 'label_data-preparation-preview');
            case 'loading':
            default:
                return i18n('dataset.dataset-editor.modify', 'label_loading-dataset-preview');
        }
    };

    const columns = React.useMemo((): TableColumn[] => {
        const {data: {Type = []} = {}} = preview;
        const typeColumns = Type[1]?.[1];

        if (!Array.isArray(typeColumns) || typeColumns.length < 1) {
            return [];
        }

        return typeColumns.reduce((acc: TableColumn[], column, index) => {
            const [name] = column;

            if (index === 0) {
                acc.push(INDEX_COLUMN);
            }

            acc.push({
                id: name,
                type: 'text',
                name,
                custom: {originalIndex: index},
                ...BASE_COLUMN_PARAMETERS,
            });

            return acc;
        }, []);
    }, [preview]);

    const rows = React.useMemo((): TableCellsRow[] => {
        const {data: {Data = []} = {}} = preview;

        return Data.map((rowCells, rowIndex) => {
            return {
                cells: columns.map((column) => {
                    const {id, custom} = column;
                    const originalIndex = custom?.originalIndex;

                    return {
                        fieldId: id,
                        value:
                            typeof originalIndex === 'number'
                                ? rowCells[originalIndex]
                                : rowIndex + 1,
                        verticalAlignment: 'center',
                        css: BASE_CELL_CSS,
                    };
                }),
            };
        });
    }, [columns, preview]);

    const tableWidgetData = React.useMemo((): TableWidgetData => {
        return {
            data: {
                head: columns,
                rows,
            },
            params: {},
            type: 'table',
            controls: {
                controls: [],
            },
        };
    }, [columns, rows]);

    const getErrorMessage = (code: string) => {
        switch (code) {
            case BI_ERRORS.MATERIALIZATION_NOT_FINISHED:
            case BI_ERRORS.DATA_PREPARATION_NOT_FINISHED:
                return i18n(
                    'component.chartkit-error.codes',
                    'ERR.DS_API.DB.DATA_PREPARATION_NOT_FINISHED',
                );
            case BI_ERRORS.NO_AVAILABLE_SUBPRODUCTS:
                return i18n(
                    'component.chartkit-error.codes',
                    'ERR.DS_API.NO_AVAILABLE_SUBPRODUCTS',
                );
            default:
                return i18n('dataset.dataset-editor.modify', 'label_request-dataset-preview-error');
        }
    };

    const renderError = () => {
        const {code} = Utils.parseErrorResponse(error);

        return (
            <div className={b()}>
                <div className={b('error')}>
                    <span className={b('error-msg-text')}>{getErrorMessage(code)}</span>
                    {/*
                        For incomplete data preparation, we do not show the button with details
                        because it's kind of not a mistake
                    */}
                    {code !== BI_ERRORS.DATA_PREPARATION_NOT_FINISHED &&
                        code !== BI_ERRORS.MATERIALIZATION_NOT_FINISHED && (
                            <Button
                                className={b('details-btn')}
                                view="outlined"
                                onClick={() => {
                                    dispatch(
                                        openDialogErrorWithTabs({
                                            error,
                                            title: i18n(
                                                'dataset.dataset-editor.modify',
                                                'label_request-dataset-preview-error',
                                            ),
                                        }),
                                    );
                                }}
                            >
                                {i18n('dataset.notifications.view', 'toast_error-action-label')}
                            </Button>
                        )}
                </div>
            </div>
        );
    };

    const isDisplayError = readyPreview === 'failed';

    if (isLoading) {
        const textPreviewLoader = getTextPreviewLoader();

        return (
            <div className={b()}>
                <div className={b('loader')}>
                    <ContainerLoader
                        loaderSize="m"
                        {...(textPreviewLoader ? {text: textPreviewLoader} : {})}
                    />
                </div>
            </div>
        );
    }

    if (isDisplayError) {
        return renderError();
    }

    const isNoData = !tableWidgetData.data.head?.length && !tableWidgetData.data.rows?.length;

    return (
        <div className={b({view, 'align-center': isNoData})}>
            <TableWidget
                id="dataset-preview-table"
                data={tableWidgetData}
                emptyDataMessage={i18n('dataset.dataset-editor.modify', 'label_no-data')}
            />
        </div>
    );
}

PreviewTable.displayName = 'PreviewTable';

export default React.memo(PreviewTable);
