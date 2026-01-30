import type {IllustrationName} from 'ui/components/Illustration/types';

export type GetImageNameFromErrorContentType = (
    errorContentType: string,
) => IllustrationName | null;
