import type {ListItemData} from '@gravity-ui/uikit';

import type {FileSourceInfo} from '../../../../../../shared/schema';

export type DialogS3SourcesProps = {
    sourcesInfo?: FileSourceInfo[];
    limit?: number;
    batch?: boolean;
    onApply: (sourcesId: string[]) => void;
    onClose: () => void;
};

export type DialogS3SourceItem = ListItemData<
    FileSourceInfo & {
        selected?: boolean;
    }
>;
