import {PlaceholderContainerProps} from '@gravity-ui/components';

import {IllustrationName, IllustrationStore} from '../../../../../components/Illustration/types';

export type PlaceholderIllustrationImageProps = {
    name: IllustrationName;
    illustrationStore: IllustrationStore;
    size?: PlaceholderContainerProps['size'];
};
