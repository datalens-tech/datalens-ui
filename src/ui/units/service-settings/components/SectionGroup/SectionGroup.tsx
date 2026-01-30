import React from 'react';

import block from 'bem-cn-lite';

import './SectionGroup.scss';

type SectionGroupProps = {
    title: React.ReactNode;
    description?: React.ReactNode;
};

const b = block('dl-settings-section-group');

export const SectionGroup: React.FC<SectionGroupProps> = (props) => {
    return (
        <section>
            <div className={b('row')}>
                <div className={b('title')}>
                    <h4 className={b('header')}>{props.title}</h4>
                    {props.description}
                </div>
                <div className={b('content')}>{props.children}</div>
            </div>
        </section>
    );
};
