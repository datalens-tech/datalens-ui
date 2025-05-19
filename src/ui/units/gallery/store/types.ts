import type {LoadingStatus} from '../../../store/typings/common';
import type {GalleryItem} from '../types';

export type GalleryState = {
    entriesLoadingStatus: LoadingStatus;
    entries: GalleryItem[];
};
