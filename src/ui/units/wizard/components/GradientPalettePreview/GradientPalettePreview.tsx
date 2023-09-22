import React from 'react';

import block from 'bem-cn-lite';

import './GradientPalettePreview.scss';

const b = block('gradient-palette-preview');

type GradientPalettePreviewProps = {
    colors: string[];
    className?: string;
};

export const GradientPalettePreview = (props: GradientPalettePreviewProps) => {
    const previewStyle = {
        background: `linear-gradient(90deg, ${props.colors.join(', ')})`,
    };

    return <div className={b(null, props.className)} style={previewStyle} />;
};
