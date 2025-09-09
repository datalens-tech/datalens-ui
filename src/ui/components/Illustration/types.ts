export type IllustrationStore = Record<string, Record<string, any>>;

export type IllustrationName =
    | 'error'
    | 'noAccess'
    | 'template'
    | 'successOperation'
    | 'project'
    | 'notFound'
    | 'notFoundError'
    | 'identity'
    | 'emptyDirectory'
    | 'badRequest';

export type IllustrationProps = {
    name: IllustrationName;
    illustrationStore: IllustrationStore;
    showSkeleton?: boolean;
    [prop: string]: unknown;
};

export type CreateIllustrationProps = Omit<IllustrationProps, 'name'> & {
    name: IllustrationName | 'barchar' | 'logo' | 'logoShort' | 'logoInit' | 'galleryHeader';
};
