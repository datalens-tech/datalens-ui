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

declare module 'markdown-it-mark' {
    import type {PluginSimple} from 'markdown-it';
    declare const plugin: PluginSimple;
    export = plugin;
}

declare module 'markdown-it-sub' {
    import type {PluginSimple} from 'markdown-it';
    declare const plugin: PluginSimple;
    export = plugin;
}

declare module 'markdown-it-ins' {
    import type {PluginSimple} from 'markdown-it';
    declare const plugin: PluginSimple;
    export = plugin;
}
