declare module '*.svg' {
    const content: SVGIconSvgrData;

    export default content;
}

declare module '*.png' {
    const path: string;

    export default path;
}

declare module '*.webp' {
    const path: string;

    export default path;
}
