export type SourceMetaProps = {
    dataUrl: string;
    setStatus: (status: 'success' | 'failed') => void;
};

export type SourceMeta = React.FC<SourceMetaProps>;
