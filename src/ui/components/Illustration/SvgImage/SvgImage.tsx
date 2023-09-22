import React from 'react';

import isNil from 'lodash/isNil';

type SvgImageProps = Omit<
    React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    'src'
> & {
    src: string | (() => Promise<{default: string}>);
};

export function SvgImage({src, alt, ...restProps}: SvgImageProps) {
    const [finalSrc, setFinalSrc] = React.useState(typeof src === 'string' ? src : undefined);

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

    return isNil(finalSrc) ? null : <img src={finalSrc} alt={alt} {...restProps} />;
}
