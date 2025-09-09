import type {PublicGalleryData} from '../../../../../ui/components/CollectionsStructure/types';

export type GetPublicGalleryEntry<T extends PublicGalleryData = PublicGalleryData> = (
    fileId: string,
) => Promise<{publicGallery?: T}>;
