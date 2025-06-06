import React from 'react';

import {Hashtag} from '@gravity-ui/icons';
import DataTable from '@gravity-ui/react-data-table';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {openDialogErrorWithTabs} from 'store/actions/dialog';
import {Utils} from 'ui';

import Markup from '../../../../components/Markup/Markup';
import {BI_ERRORS} from '../../../../constants';
import ContainerLoader from '../../components/ContainerLoader/ContainerLoader';

import './PreviewTable.scss';

const b = block('preview-table');

class PreviewTable extends React.Component {
    _collator = new Intl.Collator(undefined, {
        numeric: true,
    });

    get textPreviewLoader() {
        const {preview: {readyPreview} = {}} = this.props;

        switch (readyPreview.toLowerCase()) {
            case 'pending':
                return i18n('dataset.dataset-editor.modify', 'label_data-preparation-preview');
            case 'loading':
            default:
                return i18n('dataset.dataset-editor.modify', 'label_loading-dataset-preview');
        }
    }

    getRows() {
        const {preview: {data: {Data = []} = {}} = {}} = this.props;

        return Data.map((row, index) => {
            const preparedRow = row.map((item, itemIndex) => {
                if (item && typeof item === 'object') {
                    // In this place, except for the markup in the form of an object, nothing comes
                    return <Markup key={`${index}-${itemIndex}`} item={item} />;
                }

                return item;
            });

            return Object.assign(
                {
                    positionIndex: index + 1,
                },
                preparedRow,
            );
        });
    }

    getColumns() {
        const {preview: {data: {Type = []} = {}} = {}} = this.props;

        const columns = Type[1][1].reduce((columnsTable, column, index) => {
            const [name, type] = column;

            columnsTable.push({
                name: index,
                header: name,
                type,
            });

            return columnsTable;
        }, []);

        columns.unshift({
            name: 'positionIndex',
            header: <Icon className={b('header-icon-table-count')} data={Hashtag} size={14} />,
        });

        return columns;
    }

    getTableData() {
        try {
            const rows = this.getRows();
            const columns = this.getColumns();

            return {
                columns: this.handleColumns(columns),
                rows,
                startIndex: 0,
            };
        } catch (error) {
            return {
                columns: [],
                rows: [],
                startIndex: 0,
            };
        }
    }

    sortRows =
        (columnName) =>
        ({row: rowCurrent}, {row: rowNext}) => {
            const valueCurrent = rowCurrent[columnName];
            const valueNext = rowNext[columnName];

            return this._collator.compare(valueCurrent, valueNext);
        };

    handleColumns(columns) {
        return columns.map((column) => {
            const {header, name: columnName} = column;

            const sortAscending = this.sortRows(columnName);

            return {
                ...column,
                header: <div className={b('header')}>{header}</div>,
                className: b('column'),
                render: ({value}) => value,
                sortAscending,
                customStyle: ({header}) => {
                    const generalStyle = {
                        paddingTop: '0',
                        paddingBottom: '0',
                    };

                    if (header) {
                        return {
                            ...generalStyle,
                            background: 'var(--ds-color-base-area)',
                            borderTop: '1px solid var(--ds-color-divider)',
                            borderBottom: '1px solid var(--ds-color-divider)',
                        };
                    }
                },
            };
        });
    }

    getErrorMessage(code) {
        switch (code) {
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
    }

    renderError() {
        const {error} = this.props;
        const {code} = Utils.parseErrorResponse(error);

        return (
            <div className={b()}>
                <div className={b('error')}>
                    <span className={b('error-msg-text')}>
                        {this.getErrorMessage(BI_ERRORS.DATA_PREPARATION_NOT_FINISHED)}
                    </span>
                    {/*
                        For incomplete materialization, we do not show the button with details
                        because it's kind of not a mistake
                    */}
                    {code !== BI_ERRORS.DATA_PREPARATION_NOT_FINISHED && (
                        <Button
                            className={b('details-btn')}
                            view="outlined"
                            onClick={() => {
                                this.props.openDialogErrorWithTabs({
                                    error,
                                    title: i18n(
                                        'dataset.dataset-editor.modify',
                                        'label_request-dataset-preview-error',
                                    ),
                                });
                            }}
                        >
                            {i18n('dataset.notifications.view', 'toast_error-action-label')}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    render() {
        const {preview: {isLoading, readyPreview} = {}, view} = this.props;

        const isDisplayError = ['failed'].includes(readyPreview);

        if (isLoading) {
            return (
                <div className={b()}>
                    <div className={b('loader')}>
                        <ContainerLoader loaderSize="m" text={this.textPreviewLoader} />
                    </div>
                </div>
            );
        }

        if (isDisplayError) {
            return this.renderError();
        }

        const {columns, rows} = this.getTableData();

        const isNoData = !rows.length && !columns.length;

        return (
            <div className={b({view, 'align-center': isNoData})}>
                <DataTable
                    columns={columns}
                    data={rows}
                    emptyDataMessage={i18n('dataset.dataset-editor.modify', 'label_no-data')}
                    settings={{
                        stickyHead: DataTable.FIXED,
                        stickyTop: 0,
                        syncHeadOnResize: true,
                        highlightRows: true,
                        stripedRows: false,
                        displayIndices: false,
                        sortable: false,
                    }}
                    rowClassName={() => b('row')}
                    theme={'preview-dataset'}
                />
            </div>
        );
    }
}

PreviewTable.propTypes = {
    view: PropTypes.string.isRequired,
    preview: PropTypes.object.isRequired,
    error: PropTypes.object,
    openDialogErrorWithTabs: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    openDialogErrorWithTabs,
};

export default connect(null, mapDispatchToProps)(PreviewTable);
