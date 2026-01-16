import type {PlaceholderContainerProps} from '@gravity-ui/uikit';

import type {IllustrationName} from '../Illustration/types';

export type PlaceholderIllustrationProps = {
    name: IllustrationName;
    renderAction?: () => React.ReactNode;
    title?: string;
    description?: React.ReactNode;
    direction?: PlaceholderContainerProps['direction'];
    size?: PlaceholderContainerProps['size'];
    className?: string;
};
