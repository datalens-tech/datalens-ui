import React from 'react';

import block from 'bem-cn-lite';
import {YadocsAddSectionState} from 'ui/units/connections/store';

import {AddSection} from '../components';
import type {AddYandexDoc, UpdateAddSectionState} from '../types';

const b = block('conn-form-yadocs');

type Props = {
    addSectionState: YadocsAddSectionState;
    addYandexDoc: AddYandexDoc;
    updateAddSectionState: UpdateAddSectionState;
};

export const DocsList = (props: Props) => {
    const {addSectionState, addYandexDoc, updateAddSectionState} = props;

    return (
        <div className={b('list')}>
            <div className={b('add-section')}>
                <AddSection
                    {...addSectionState}
                    addYandexDoc={addYandexDoc}
                    updateAddSectionState={updateAddSectionState}
                />
            </div>
        </div>
    );
};
