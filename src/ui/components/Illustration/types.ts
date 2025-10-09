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
    | 'badRequest'
    | 'noAccounts';

export type CreateIllustrationProps = {
    name: IllustrationName | 'barchar' | 'logo' | 'logoShort' | 'logoInit' | 'galleryHeader';
    illustrationStore: IllustrationStore;
    showSkeleton?: boolean;
    skeletonClassName?: string;
    skeletonTimeout?: number;
    className?: string;
    alt?: string;
    role?: string;
    'aria-hidden'?: boolean;
};
