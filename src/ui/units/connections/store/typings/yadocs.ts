export type YadocsAddSectionState = {
    mode: 'public' | 'private';
    url: string;
    active?: boolean;
    disabled?: boolean;
    uploading?: boolean;
};

export type YadocsActiveDialog = never;
