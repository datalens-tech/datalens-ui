import type {ButtonButtonProps as ButtonProps} from '@gravity-ui/uikit';

export type OAuthTokenButtonProps = ButtonProps & {
    onTokenChange: (token: string) => void;
    application: any;
    text?: string;
};
