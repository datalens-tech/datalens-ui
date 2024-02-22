import React from 'react';

import {Calendar, FontCursor, ListUl, SquareCheck} from '@gravity-ui/icons';
import {Icon, SelectOption} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {ELEMENT_TYPE} from '../../../../Control/constants';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const getElementOptions = (): SelectOption[] => [
    {
        value: ELEMENT_TYPE.SELECT,
        content: i18n('value_element-select'),
        data: {
            icon: <Icon data={ListUl} />,
        },
    },
    {
        value: ELEMENT_TYPE.INPUT,
        content: i18n('value_element-input'),
        data: {
            icon: <Icon data={FontCursor} />,
        },
    },
    {
        value: ELEMENT_TYPE.DATE,
        content: i18n('value_element-date'),
        data: {
            icon: <Icon data={Calendar} />,
        },
    },
    {
        value: ELEMENT_TYPE.CHECKBOX,
        content: i18n('value_element-checkbox'),
        data: {
            icon: <Icon data={SquareCheck} />,
        },
    },
];
