import React from 'react';

type PictureProps = Omit<
    React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
    'src'
> & {
    src: string;
    webp: string;
};

export const Picture = ({src, webp, ...rest}: PictureProps) => {
    return (
        <picture>
            <source srcSet={webp} type="image/webp" />
            <source srcSet={src} />
            <img src={src} {...rest} />
        </picture>
    );
};
