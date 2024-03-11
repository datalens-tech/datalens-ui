import React from 'react';

import block from 'bem-cn-lite';
import {Collapse} from 'components/Collapse/Collapse';

import type {CollapseProps} from '../Collapse/types';

import './SectionWrapper.scss';

const b = block('section-wrapper');

export type SectionWrapperProps = {
    className?: string;
    title?: string | JSX.Element;
    titleMods?: string;
    subTitle?: string;
    withCollapse?: boolean;
    arrowPosition?: CollapseProps['arrowPosition'];
    arrowQa?: CollapseProps['arrowQa'];
    defaultIsExpanded?: boolean;
};

type SectionBodyProps = {
    title?: string | JSX.Element;
    subTitle?: string;
    className?: string;
    titleModsVal: Record<string, boolean> | null;
};

const SectionBody: React.FC<SectionBodyProps> = (
    props: React.PropsWithChildren<SectionBodyProps>,
) => {
    return (
        <div className={b(null, props.className)}>
            {props.title && <div className={b('title', props.titleModsVal)}>{props.title}</div>}
            {props.subTitle && <div className={b('subtitle')}>{props.subTitle}</div>}
            <div className={b('content')}>{props.children}</div>
        </div>
    );
};

const SectionWrapper: React.FC<SectionWrapperProps> = (props) => {
    let titleModsVal = props.titleMods ? {[props.titleMods]: true} : null;
    if (props.subTitle) {
        const subTitleMod = {'with-subtitle': true};
        titleModsVal = titleModsVal ? {...titleModsVal, ...subTitleMod} : subTitleMod;
    }

    if (props.withCollapse) {
        return (
            <SectionBody
                titleModsVal={titleModsVal}
                subTitle={props.subTitle}
                className={props.className}
            >
                <Collapse
                    defaultIsExpand={props.defaultIsExpanded ?? true}
                    arrowPosition={props.arrowPosition}
                    arrowQa={props.arrowQa}
                    title={props.title || ''}
                    titleSize="m"
                >
                    {props.children}
                </Collapse>
            </SectionBody>
        );
    }

    return (
        <SectionBody
            titleModsVal={titleModsVal}
            subTitle={props.subTitle}
            title={props.title}
            className={props.className}
        >
            {props.children}
        </SectionBody>
    );
};

export {SectionWrapper};
