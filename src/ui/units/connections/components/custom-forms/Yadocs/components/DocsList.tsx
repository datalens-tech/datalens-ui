import React from 'react';

import {List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {YadocItem, YadocsAddSectionState} from 'ui/units/connections/store';

import {AddSection, YadocListItemView} from '../components';
import type {AddYandexDoc, HandleItemClick, UpdateAddSectionState, YadocListItem} from '../types';

const b = block('conn-form-yadocs');
const ITEM_HEIGHT = 52;

type Props = {
    addSectionState: YadocsAddSectionState;
    items: YadocItem[];
    selectedItemIndex: number;
    addYandexDoc: AddYandexDoc;
    clickListItem: HandleItemClick;
    updateAddSectionState: UpdateAddSectionState;
};

export const DocsList = (props: Props) => {
    const {
        addSectionState,
        items,
        selectedItemIndex,
        addYandexDoc,
        clickListItem,
        updateAddSectionState,
    } = props;

    const renderItem = React.useCallback((item: YadocListItem) => {
        return <YadocListItemView item={item} />;
    }, []);

    return (
        <div className={b('list')}>
            <List
                className={b('list-container')}
                itemClassName={b('list-item-wrap')}
                itemHeight={ITEM_HEIGHT}
                items={items}
                selectedItemIndex={selectedItemIndex}
                filterable={false}
                virtualized={false}
                renderItem={renderItem}
                onItemClick={clickListItem}
            />
            <AddSection
                {...addSectionState}
                addYandexDoc={addYandexDoc}
                updateAddSectionState={updateAddSectionState}
            />
        </div>
    );
};
