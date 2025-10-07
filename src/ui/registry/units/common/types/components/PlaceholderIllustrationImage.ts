import type {PlaceholderContainerProps} from '@gravity-ui/uikit';

import type {
    CreateIllustrationProps,
    IllustrationName,
} from '../../../../../components/Illustration/types';

export type PlaceholderIllustrationImageProps = CreateIllustrationProps & {
    name: IllustrationName;
    size?: PlaceholderContainerProps['size'];
    className?: string;
};
