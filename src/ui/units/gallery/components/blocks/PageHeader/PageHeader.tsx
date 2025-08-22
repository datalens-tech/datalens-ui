import React from 'react';

import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Text} from '@gravity-ui/uikit';
import type {ButtonButtonProps as ButtonProps, TextProps} from '@gravity-ui/uikit';
import {Link} from 'react-router-dom';

import type {ActiveMediaQuery} from '../../types';
import {block} from '../../utils';

import './PageHeader.scss';

const b = block('page-header');
const HIDE_BACKBUTTON_BREAKPOINTS: ActiveMediaQuery[] = ['xs', 's', 'm'];

interface PageHeaderProps {
    title: string;
    to: string;
    activeMediaQuery?: ActiveMediaQuery;
    buttonProps?: Partial<ButtonProps>;
    textProps?: Partial<TextProps>;
}

export function PageHeader({activeMediaQuery, buttonProps, title, textProps, to}: PageHeaderProps) {
    const showBackButton = activeMediaQuery
        ? !HIDE_BACKBUTTON_BREAKPOINTS.includes(activeMediaQuery)
        : true;

    return (
        <div className={b()}>
            {showBackButton && (
                <Link className={b('back-button')} to={to}>
                    <Button view="flat" {...buttonProps}>
                        <Button.Icon>
                            <ArrowLeft />
                        </Button.Icon>
                    </Button>
                </Link>
            )}
            <Text variant="header-2" {...textProps}>
                {title}
            </Text>
        </div>
    );
}
