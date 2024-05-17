// Usually jest ignores node_modules, since in an ideal world all modules are already correctly assembled
// Here we add modules that need to be run through the ts-jest transofrmer
const IGNORE_NODE_MODULES_LIST = [
    '@gravity-ui',
    '@diplodoc/latex-extension/react',
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
    const modulesToTransform = IGNORE_NODE_MODULES_LIST.map(
        (module) => `${module}(?:[^\\/]+\\/?)*`,
    ).join('|');

    return `node_modules/(?!(${modulesToTransform}))`;
};
