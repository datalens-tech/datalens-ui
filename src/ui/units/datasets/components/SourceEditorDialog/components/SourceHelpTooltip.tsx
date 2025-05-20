import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {I18n} from '../../../../../../i18n';
import {Interpolate} from '../../../../../../ui';
import type {FormOptions} from '../../../store/types';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');

type SourceHelpTooltipProps = {
    fieldDocKey: FormOptions['field_doc_key'];
};

interface RegularTooltipProps {
    body?: React.ReactNode;
    example?: string | string[];
    headerExampleEnabled?: boolean;
}

const RegularTooltip: React.FC<RegularTooltipProps> = (props) => {
    const {body, example, headerExampleEnabled = true} = props;

    const renderExample = (): React.ReactNode => {
        return Array.isArray(example)
            ? example.map((text, index) => (
                  <div key={`example-${index}`} className={b('example-row')}>
                      {text}
                  </div>
              ))
            : example;
    };

    const renderContent = (): React.ReactNode => (
        <div className={b('tooltip-item')}>
            {body && <span className={b('tooltip-body')}>{body}</span>}
            {example && (
                <div className={b('example')}>
                    {headerExampleEnabled && <span>{i18n('label_yt-table-example')}</span>}
                    <div className={b('example-path')}>{renderExample()}</div>
                </div>
            )}
        </div>
    );

    return <HelpMark popoverProps={{content: renderContent()}} />;
};

const getStyledTextWithCode = (key: string) => {
    return (
        <Interpolate
            text={i18n(key)}
            matches={{
                code(match) {
                    return <span className={b('code', {inline: true})}>{match}</span>;
                },
            }}
        />
    );
};

const getCommonSubselectContent = () => (
    <div className={b('tooltip-item')}>
        <Interpolate
            text={i18n('label_subselect-form-tooltip-common')}
            matches={{
                code(match) {
                    return <span className={b('code', {inline: true})}>{match}</span>;
                },
            }}
        />
    </div>
);

// eslint-disable-next-line complexity
export const SourceHelpTooltip: React.FC<SourceHelpTooltipProps> = ({fieldDocKey}) => {
    switch (fieldDocKey) {
        case 'CHYT_TABLE/table_name':
        case 'CHYT_USER_AUTH_TABLE/table_name': {
            return (
                <RegularTooltip
                    body={i18n('label_tooltip-choveryt-path-restriction')}
                    example={i18n('label_yt-table-example-path')}
                />
            );
        }
        case 'CHYT_TABLE_LIST/title':
        case 'CHYT_USER_AUTH_TABLE_LIST/title': {
            return (
                <RegularTooltip
                    body={i18n('label_yt-function-tables')}
                    example={i18n('label_yt-function-tables-example')}
                    headerExampleEnabled={false}
                />
            );
        }
        case 'CHYT_TABLE_LIST/table_names':
        case 'CHYT_USER_AUTH_TABLE/table_names': {
            return <RegularTooltip example={i18n('label_yt-table-example-paths').split(' ')} />;
        }
        case 'CHYT_TABLE_RANGE/title':
        case 'CHYT_USER_AUTH_TABLE_RANGE/title': {
            return (
                <RegularTooltip
                    body={i18n('label_yt-function-tables-range')}
                    example={i18n('label_yt-function-tables-range-example')}
                    headerExampleEnabled={false}
                />
            );
        }
        case 'CHYT_TABLE_RANGE/directory_path': {
            return <RegularTooltip example={i18n('label_yt-table-example-directory-path')} />;
        }
        case 'CHYDB_TABLE/table_name': {
            return <RegularTooltip example={i18n('label_chydb-table-example')} />;
        }
        case 'CHYDB_TABLE/ydb_database': {
            return <RegularTooltip example={i18n('label_chydb-database-example')} />;
        }
        case 'ANY_SUBSELECT/subsql': {
            return <HelpMark popoverProps={{content: getCommonSubselectContent()}} />;
        }
        case 'CHYT_SUBSELECT/subsql': {
            return (
                <HelpMark
                    popoverProps={{
                        content: (
                            <React.Fragment>
                                {getCommonSubselectContent()}
                                <div className={b('tooltip-item')}>
                                    {getStyledTextWithCode('label_subselect-form-tooltip-chyt')}
                                </div>
                            </React.Fragment>
                        ),
                    }}
                />
            );
        }
        case 'MSSQL_SUBSELECT/subsql': {
            return (
                <HelpMark
                    popoverProps={{
                        content: (
                            <React.Fragment>
                                {getCommonSubselectContent()}
                                <div className={b('tooltip-item')}>
                                    {i18n('label_subselect-form-tooltip-mssql')}
                                </div>
                            </React.Fragment>
                        ),
                    }}
                />
            );
        }
        case 'PG_SUBSELECT/subsql': {
            return (
                <HelpMark
                    popoverProps={{
                        content: (
                            <React.Fragment>
                                {getCommonSubselectContent()}
                                <div className={b('tooltip-item')}>
                                    {getStyledTextWithCode('label_subselect-form-tooltip-pg')}
                                </div>
                            </React.Fragment>
                        ),
                    }}
                />
            );
        }
        case 'YTsaurus/CHYT_TABLE/table_name': {
            return (
                <RegularTooltip
                    body={i18n('label_yc-chyt-table-name-body')}
                    example="//home/chyt/demo/table"
                />
            );
        }
        case 'CHYT_YTSAURUS_TABLE_LIST/title': {
            return (
                <RegularTooltip
                    body={i18n('label_yc-chyt-table-list-title-body')}
                    example="concatYtTables(table1, [table2, [...]])"
                    headerExampleEnabled={false}
                />
            );
        }
        case 'YTsaurus/CHYT_TABLE_LIST/table_names': {
            return <RegularTooltip example="//home/chyt/demo/table1 //home/chyt/demo/table2" />;
        }
        case 'CHYT_YTSAURUS_TABLE_RANGE/title': {
            return (
                <RegularTooltip
                    body={i18n('label_yc-chyt-table-range-title-body')}
                    example="concatYtTablesRange(cypressPath, [from, [to]])"
                    headerExampleEnabled={false}
                />
            );
        }
        case 'YTsaurus/CHYT_TABLE_RANGE/directory_path': {
            return <RegularTooltip example="//home/chyt/demo_folder" />;
        }
        case 'YTsaurus/CHYT_SUBSELECT/subsql': {
            return (
                <RegularTooltip body={getStyledTextWithCode('label_yc-chyt-subselect-subsql')} />
            );
        }
        default: {
            return null;
        }
    }
};
