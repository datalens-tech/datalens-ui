import React from 'react';

import block from 'bem-cn-lite';

import {Collapse} from '../../../Collapse/Collapse';

import './Block.scss';

const b = block('dl-iam-access-dialog-access-list-block');

export type Props = {
    className?: string;
    defaultIsExpand: boolean;
    title: string;
    isLoading: boolean;
    counter?: number;
    children: React.ReactNode;
};

export const Block = ({className, defaultIsExpand, title, isLoading, counter, children}: Props) => {
    return (
        <Collapse
            className={b(null, className)}
            headerClassName={b('collapse-header')}
            titleClassName={b('collapse-title')}
            title={
                <div className={b('title')}>
                    {title}
                    {!isLoading && typeof counter !== 'undefined' && (
                        <span className={b('counter')}>{counter}</span>
                    )}
                </div>
            }
            defaultIsExpand={defaultIsExpand}
        >
            <div className={b('content')}>{children}</div>
        </Collapse>
    );
};
