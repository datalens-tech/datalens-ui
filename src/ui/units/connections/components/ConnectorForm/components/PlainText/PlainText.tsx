import React from 'react';

import block from 'bem-cn-lite';
import type {PlainTextItem} from 'shared/schema/types';

import {MarkdownItem} from '../';

import './PlainText.scss';

const b = block('conn-form-plain-text');

type PlainTextComponentProps = Omit<PlainTextItem, 'id'> & {className?: string};

export const PlainText = ({className, text, hintText}: PlainTextComponentProps) => {
    return (
        <div className={b(null, className)}>
            {text}
            {hintText && (
                <span className={b('hint')}>
                    <MarkdownItem text={hintText} />
                </span>
            )}
        </div>
    );
};
