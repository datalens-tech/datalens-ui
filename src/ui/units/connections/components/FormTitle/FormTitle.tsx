import React from 'react';

import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import {ConnectorIcon} from 'ui/components/ConnectorIcon/ConnectorIcon';

import {getConnectorIconData, getConnectorIconDataByAlias} from '../../../../utils';
import {getPreviousRalativePathname} from '../../utils';

import './FormTitle.scss';

const b = block('conn-form-title');
const ARROW_ICON_SIZE = 20;
const CONN_ICON_SIZE = 32;

type TitleProps = {
    type: string;
    title: string;
    className?: string;
    titleClassName?: string;
    additionalContent?: React.ReactNode;
    showArrow?: boolean;
};

const ArrowBack = () => {
    return (
        <div className={b('arrow')}>
            <Link to={getPreviousRalativePathname()}>
                <Button view="flat">
                    <Icon data={ArrowLeft} size={ARROW_ICON_SIZE} />
                </Button>
            </Link>
        </div>
    );
};

export const FormTitle = ({
    type,
    title,
    className,
    titleClassName,
    additionalContent = null,
    showArrow = true,
}: TitleProps) => {
    return (
        <div className={b(null, className)}>
            {showArrow && <ArrowBack />}
            <ConnectorIcon
                className={b('icon')}
                data={getConnectorIconDataByAlias(type) || getConnectorIconData(type)}
                height={CONN_ICON_SIZE}
                width={CONN_ICON_SIZE}
            />
            <span className={b('title', titleClassName)}>{title}</span>
            {additionalContent}
        </div>
    );
};
