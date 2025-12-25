import type {ReactNode} from 'react';
import React from 'react';

import {CircleQuestion} from '@gravity-ui/icons';
import {Icon, Label, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './Body.scss';

const b = block('dl-select-migration-to-workbook-dialog-body');

const i18n = I18n.keyset('component.select-migration-to-workbook-dialog');

type List = {
    icon: ReactNode;
    text: string;
    helpText?: string;
};

type BodyProps = {
    title: string;
    label?: string;
    description: string;
    icon: ReactNode;
    list: List[];
};

const Body: React.FC<{content: BodyProps; isActive?: boolean}> = ({content, isActive}) => {
    return (
        <div className={b({active: isActive})}>
            <div className={b('header')}>
                <div className={b('title')}>{i18n(content.title)}</div>
                {content.label && (
                    <div className={b('label')}>
                        <Label size="m" theme="warning">
                            {i18n(content.label)}
                        </Label>
                    </div>
                )}

                <div className={b('icon')}>{content.icon}</div>
            </div>
            <div className={b('description')}>{i18n(content.description)}</div>
            <div className={b('content')}>
                {content.list.map((item) => (
                    <div key={item.text} className={b('content-item')}>
                        <div className={b('content-item-icon')}>{item.icon}</div>{' '}
                        <div className={b('content-item-text')}>{i18n(item.text)}</div>
                        {item.helpText && (
                            <Popover
                                content={
                                    <div className={b('content-tooltip')}>
                                        {i18n(item.helpText)}
                                    </div>
                                }
                                placement="bottom"
                                className={b('content-item-help')}
                            >
                                <Icon data={CircleQuestion} />
                            </Popover>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export {Body};
