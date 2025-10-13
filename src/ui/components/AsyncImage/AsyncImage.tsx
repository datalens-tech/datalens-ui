import React from 'react';

import {Skeleton} from '@gravity-ui/uikit';
import isNil from 'lodash/isNil';

export type AsyncImageProps = Omit<
    React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    'src'
> & {
    src: string | (() => Promise<{default: string}>);
    showSkeleton?: boolean;
    onLoad?: () => void;
    // if you need to separate the skeleton styles from the image
    skeletonClassName?: string;
    // makes it possible not to show skeletons for fast-loading images
    skeletonTimeout?: number;
};

export function AsyncImage({
    src,
    alt,
    style,
    showSkeleton,
    onLoad,
    skeletonClassName,
    skeletonTimeout,
    ...restProps
}: AsyncImageProps) {
    const [finalSrc, setFinalSrc] = React.useState(typeof src === 'string' ? src : undefined);
    const [loading, setLoading] = React.useState(showSkeleton && !skeletonTimeout);
    const [isImgReady, setIsImgReady] = React.useState(false);

    React.useEffect(() => {
        let isCancelled = false;

        if (typeof src === 'function') {
            src()
                .then(({default: img}: {default: string}) => {
                    if (!isCancelled) {
                        setFinalSrc(img);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    if (!isCancelled) {
                        setFinalSrc('');
                    }
                });
        } else {
            setFinalSrc(src);
        }

        return () => {
            isCancelled = true;
        };
    }, [src, skeletonTimeout]);

    React.useEffect(() => {
        let skeletonTimer: number;

        if (skeletonTimeout && !loading && !isImgReady) {
            skeletonTimer = window.setTimeout(() => {
                if (!isImgReady) {
                    setLoading(true);
                }
            }, skeletonTimeout);
        }

        return () => {
            clearTimeout(skeletonTimer);
        };
    }, [isImgReady, loading, skeletonTimeout]);

    const handleLoad = React.useCallback(() => {
        setLoading(false);
        setIsImgReady(true);
        onLoad?.();
    }, [onLoad]);

    const skeleton = loading ? (
        <Skeleton className={skeletonClassName || restProps.className} style={style} />
    ) : null;

    return isNil(finalSrc) ? (
        skeleton
    ) : (
        <React.Fragment>
            <img
                src={finalSrc}
                alt={alt}
                style={{
                    ...style,
                    ...(loading && {display: 'none'}),
                }}
                {...restProps}
                onLoad={handleLoad}
                onError={() => setLoading(false)}
            />
            {skeleton}
        </React.Fragment>
    );
}
