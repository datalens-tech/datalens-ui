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
};

export function AsyncImage({src, alt, style, showSkeleton, onLoad, ...restProps}: AsyncImageProps) {
    const [finalSrc, setFinalSrc] = React.useState(typeof src === 'string' ? src : undefined);
    const [loading, setLoading] = React.useState(showSkeleton);

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
    }, [src]);

    const handleLoad = React.useCallback(() => {
        setLoading(false);
        onLoad?.();
    }, [onLoad]);

    const skeleton = loading ? <Skeleton className={restProps.className} style={style} /> : null;

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
                onLoad={loading ? handleLoad : undefined}
                onError={() => setLoading(false)}
            />
            {skeleton}
        </React.Fragment>
    );
}
