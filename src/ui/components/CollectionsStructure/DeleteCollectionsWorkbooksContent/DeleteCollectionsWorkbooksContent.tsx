import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './DeleteCollectionsWorkbooksContent.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collection-delete-collections-workbooks-dialog-content');

export type Props = {
    collectionTitles: string[];
    workbookTitles: string[];
};

export const DeleteCollectionsWorkbooksContent = ({collectionTitles, workbookTitles}: Props) => {
    return (
        <div className={b()}>
            {Boolean(collectionTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>
                        {i18n('label_delete-collections-for-delete')}:
                    </div>
                    <div className={b('list')}>
                        {collectionTitles.map((title) => (
                            <div key={title} className={b('title')}>
                                {title}
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            )}

            {Boolean(workbookTitles.length) && (
                <React.Fragment>
                    <div className={b('header')}>{i18n('label_delete-workbooks-for-delete')}:</div>
                    <div className={b('list')}>
                        {workbookTitles.map((title) => (
                            <div key={title} className={b('title')}>
                                {title}
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
