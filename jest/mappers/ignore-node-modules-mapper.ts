// Usually jest ignores node_modules, since in an ideal world all modules are already correctly assembled
// Here we add modules that need to be run through the ts-jest transformer
const IGNORE_NODE_MODULES_LIST = [
    '@gravity-ui',
    '@diplodoc/latex-extension',
    '@diplodoc/mermaid-extension',
    'react-dnd',
    'dnd-core',
    'monaco-editor',
    'tinygesture',
    'jsondiffpatch',
    'd3',
    'd3-array',
    'internmap',
    'delaunator',
    'robust-predicates',
];

export const getIgnoredNodeModulesRegexp = () => {
    // Create pattern that matches module names in both npm/yarn and pnpm structures:
    // - npm/yarn: node_modules/@scope/package/...
    // - pnpm: node_modules/.pnpm/@scope+package@version/node_modules/@scope/package/...
    // We need to handle both / and + as separators (pnpm uses + instead of / in .pnpm folder)
    const modulesToTransform = IGNORE_NODE_MODULES_LIST.map((module) =>
        module.replace(/[@/]/g, '[@/+]'),
    ).join('|');

    return `node_modules/(?!.*(?:${modulesToTransform}))`;
};
