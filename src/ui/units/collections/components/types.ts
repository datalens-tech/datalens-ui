import type {ButtonView} from '@gravity-ui/uikit';

export type EmptyPlaceholderAction = {
    id: string;
    title: string;
    view?: ButtonView;
    handler: () => void;
};
