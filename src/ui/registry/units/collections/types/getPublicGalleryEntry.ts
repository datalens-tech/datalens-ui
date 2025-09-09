export type GetPublicGalleryEntry = (fileId: string) => Promise<{
    publicGallery?: {
        id: string;
        title: string;
        description: string;
        data: string;
    };
}>;
