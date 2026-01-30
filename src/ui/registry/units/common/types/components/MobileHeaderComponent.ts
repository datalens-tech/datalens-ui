import type {IconData} from '@gravity-ui/uikit';
import type {LogoTextProps} from 'ui/components/AsideHeaderAdapter/LogoText/LogoText';

export type MobileHeaderComponentProps = {
    renderContent?: () => React.ReactNode;
    logoIcon?: IconData;
    logoTextProps?: LogoTextProps;
};
