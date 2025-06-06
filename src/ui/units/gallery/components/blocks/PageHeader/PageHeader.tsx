import React from 'react';

import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Text} from '@gravity-ui/uikit';
import type {ButtonProps, TextProps} from '@gravity-ui/uikit';
import {Link} from 'react-router-dom';

import {block} from '../../utils';

import './PageHeader.scss';

const b = block('page-header');

interface PageHeaderProps {
    title: string;
    to: string;
    buttonProps?: Partial<ButtonProps>;
    textProps?: Partial<TextProps>;
}

export function PageHeader({buttonProps, title, textProps, to}: PageHeaderProps) {
    return (
        <div className={b()}>
            <Link to={to}>
                <Button view="flat" {...buttonProps}>
                    <Button.Icon>
                        <ArrowLeft />
                    </Button.Icon>
                </Button>
            </Link>

            <Text variant="header-2" {...textProps}>
                {title}
            </Text>
        </div>
    );
}
