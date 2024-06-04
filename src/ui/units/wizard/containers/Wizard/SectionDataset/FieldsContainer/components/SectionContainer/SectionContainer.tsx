import React from 'react';

import block from 'bem-cn-lite';
import type {Field} from 'shared';

import DNDContainer from '../../../../../../components/DND/DNDContainer';
import {ITEM_TYPES} from '../../../../../../constants';
import type {CommonContainerProps} from '../../FieldsContainer';

import './SectionContainer.scss';

type SectionContainerProps = {
    title: string;
    items: Field[];
    qa?: string;
} & CommonContainerProps;

const b = block('section-container');

export const SectionContainer: React.FC<SectionContainerProps> = (props: SectionContainerProps) => {
    const {title, items, wrapTo, qa, appliedSearchPhrase} = props;

    const filteredSectionItems = items.filter((item) =>
        item.title.toLowerCase().includes(appliedSearchPhrase),
    );

    return (
        <div className={b()} data-qa={qa}>
            <div className={b('title')}>
                <span>{title}</span>
            </div>
            <DNDContainer
                id="parameters-container"
                noRemove={true}
                allowedTypes={ITEM_TYPES.PARAMETERS}
                items={filteredSectionItems}
                wrapTo={wrapTo}
            />
        </div>
    );
};
