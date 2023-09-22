export const getParsedRect = ({width, height}: {width?: string; height?: string}) => {
    const parsedWidth = typeof width === 'string' ? Number.parseInt(width, 10) : width;
    const parsedHeight = typeof height === 'string' ? Number.parseInt(height, 10) : height;

    return {parsedWidth, parsedHeight};
};
