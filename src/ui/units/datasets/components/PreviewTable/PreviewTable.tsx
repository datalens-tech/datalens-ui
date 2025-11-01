import React from 'react';

import {Hashtag} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {TableCellsRow, TableHead} from 'shared/types/chartkit/table';
import {openDialogErrorWithTabs} from 'store/actions/dialog';
import {Utils} from 'ui';
import TableWidget from 'ui/libs/DatalensChartkit/ChartKit/plugins/Table/renderer/TableWidget';
import type {TableWidgetData} from 'ui/libs/DatalensChartkit/types';
import type {DatasetError, DatasetReduxState} from 'units/datasets/store/types';

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

const BASE_COLUMN_PARAMETERS = {
    sortable: false,
    verticalAlignment: 'center',
    css: HEADER_CELL_CSS,
};

type Props = {
    view: DatasetReduxState['preview']['view'];
    preview: DatasetReduxState['preview'];
    error?: DatasetError;
};

function PreviewTable(props: Props) {
    const dispatch = useDispatch();

    const {error, preview, view} = props;
    const {isLoading, readyPreview} = preview;

    const textPreviewLoader = (() => {
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
    })();

    const getColumns = (): TableHead[] => {
        const {data: {Type = []} = {}} = preview;

        if (Type.length < 1) {
            return [];
        }

        const columns = Type[1][1].reduce((columnsTable, column, index) => {
            const [name, type] = column; // CHARTS-10719: is type necessary?

            columnsTable.push({
                id: name,
                type: 'text',
                name,
                ...BASE_COLUMN_PARAMETERS,
            });

            return columnsTable;
        }, []);

        columns.unshift({
            id: 'positionIndex',
            name: 'positionIndex',
            formattedName: (
                <Icon className={b('header-icon-table-count')} data={Hashtag} size={14} />
            ),
            ...BASE_COLUMN_PARAMETERS,
        });

        return columns;
    };

    const getRows = (): TableCellsRow[] => {
        const {data: {Data = []} = {}} = preview;

        return Data.map((rowCells, rowIndex) => {
            const columns = getColumns();

            return {
                cells: columns.map((column, columnIndex) => {
                    const {id} = column;

                    return {
                        fieldId: id,
                        value: columnIndex === 0 ? rowIndex + 1 : rowCells[columnIndex - 1],
                        verticalAlignment: 'center',
                        css: BASE_CELL_CSS,
                    };
                }),
            };
        });
    };

    const getTableWidgetData = (): TableWidgetData => {
        const columns: TableHead[] = getColumns();
        const rows: TableCellsRow[] = getRows();

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
    };

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

    const isDisplayError = ['failed'].includes(readyPreview);

    if (isLoading) {
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

    const tableWidgetData = getTableWidgetData();
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
