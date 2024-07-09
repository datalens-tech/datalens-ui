import type {TabsSize} from '@gravity-ui/components';
import type {ButtonSize, CheckboxSize, SelectSize} from '@gravity-ui/uikit';
import type {EntityIconSize} from 'ui/components/EntityIcon/EntityIcon';
import {DL} from 'ui/constants/common';

type MobileSizeType = {
    TABS: TabsSize;
    NAVIGATION_ICON: number;
    ENTITY_ICON: EntityIconSize;
    YC_SELECT: 'xs' | 's' | 'm' | 'n' | 'promo';
    CONTROL: 's' | 'm' | 'l' | 'xl';
    BUTTON: ButtonSize;
    CHECKBOX: CheckboxSize;
    SELECT: SelectSize;
};

export const MOBILE_SIZE: MobileSizeType = {
    TABS: 'l',
    NAVIGATION_ICON: 36,
    ENTITY_ICON: 'xl',
    YC_SELECT: 'promo',
    CONTROL: 'xl',
    BUTTON: 'xl',
    CHECKBOX: 'l',
    SELECT: 'xl',
};

export const isMobileView = DL.IS_MOBILE;
