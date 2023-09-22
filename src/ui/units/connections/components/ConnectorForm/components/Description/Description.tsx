import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DescriptionItem} from 'shared/schema/types';

import {MarkdownItem} from '../';

import './Description.scss';

const b = block('conn-form-description');

type PlainTextComponentProps = Omit<DescriptionItem, 'id'>;

export const Description = ({text}: PlainTextComponentProps) => {
    return (
        <div className={b()}>
            <MarkdownItem text={text} fallback={<Loader size="s" />} />
        </div>
    );
};
