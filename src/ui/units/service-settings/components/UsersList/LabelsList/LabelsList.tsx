import React from 'react';

import type {LabelProps} from '@gravity-ui/uikit';
import {Flex, Label, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Feature} from 'shared';
import type {UserRole} from 'shared/components/auth/constants/role';
import {UserRoleLabel} from 'ui/units/auth/components/UserRoleLabel/UserRoleLabel';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import './LabelsList.scss';

const b = block('users-list-labels-list');

export type LabelsListProps = {
    items: `${UserRole}`[];
    countVisibleElements: number;
    buttonTheme?: LabelProps['theme'];
    size?: LabelProps['size'];
};

export const LabelsList = ({
    items,
    countVisibleElements = 1,
    buttonTheme = 'normal',
    size = isEnabledFeature(Feature.EnableNewServiceSettings) ? 's' : 'xs',
}: LabelsListProps) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const toggleRolesPopup = React.useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            event.stopPropagation();
            setOpen(!open);
        },
        [open],
    );

    const handlePopupClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    const renderList = () => {
        const visibleItems = items.slice(0, countVisibleElements);
        const hiddenItems = items.slice(countVisibleElements);

        const buttonText = `+${items.length - countVisibleElements}`;

        return (
            <React.Fragment>
                {visibleItems.map((item) => (
                    <UserRoleLabel key={item} role={item} size={size} />
                ))}
                <Label
                    ref={anchorRef}
                    theme={buttonTheme}
                    onClick={toggleRolesPopup}
                    className={b('button')}
                    size={size}
                >
                    {buttonText}
                </Label>
                <Popup
                    anchorElement={anchorRef.current}
                    open={open}
                    placement={['bottom-end', 'bottom', 'top-end', 'top']}
                    onOpenChange={(isOpened) => {
                        if (!isOpened) {
                            handlePopupClose();
                        }
                    }}
                >
                    <div className={b('popup')}>
                        <div className={b('popup-content')}>
                            {hiddenItems.map((item) => (
                                <UserRoleLabel key={item} role={item} size={size} />
                            ))}
                        </div>
                    </div>
                </Popup>
            </React.Fragment>
        );
    };

    return (
        <Flex className={b()} alignItems="center" gap={2}>
            {items.length > countVisibleElements
                ? renderList()
                : items.map((item) => <UserRoleLabel key={item} role={item} size={size} />)}
        </Flex>
    );
};
