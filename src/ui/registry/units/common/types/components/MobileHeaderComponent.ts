import type {IconData} from '@gravity-ui/uikit';

export type MobileHeaderComponentProps = {
    renderContent?: () => React.ReactNode;
    logoIcon?: IconData;
    installationInfo?: string;
};
