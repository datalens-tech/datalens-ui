import DialogManager from '../../../../../components/DialogManager/DialogManager';

import {DialogS3Source} from './DialogS3Source';
import type {DialogS3SourcesProps} from './types';

export const DIALOG_CONN_S3_SOURCES = Symbol('DIALOG_CONN_S3_SOURCES');

export type OpenDialogConnS3Sources = {
    id: typeof DIALOG_CONN_S3_SOURCES;
    props: DialogS3SourcesProps;
};

DialogManager.registerDialog(DIALOG_CONN_S3_SOURCES, DialogS3Source);
