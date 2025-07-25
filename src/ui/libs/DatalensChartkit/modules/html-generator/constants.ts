export const TAG_DL_TOOLTIP = 'dl-tooltip';

export const ATTR_DATA_CE_THEME = 'data-ce-theme';
export const ATTR_DATA_TOOLTIP_CONTENT = 'data-tooltip-content';
export const ATTR_DATA_TOOLTIP_PLACEMENT = 'data-tooltip-placement';
export const ATTR_DATA_TOOLTIP_ANCHOR_ID = 'data-tooltip-anchor-id';
export const ATTR_DATA_TOOLTIP_HIDE_DELAY = 'data-tooltip-hide-delay';
export const ATTR_DATA_TOOLTIP_OPEN_DELAY = 'data-tooltip-open-delay';
export const ATTR_DATA_ELEMENT_ID = 'data-dl-id';

export const THEME_CSS_VARIABLE_PREFIX = '--ce-theme';

export const ALLOWED_TAGS = [
    'a',
    'abbr',
    'b',
    'br',
    'button',
    'caption',
    'circle',
    'clipPath',
    'code',
    'dd',
    'defs',
    'details',
    'div',
    'dl',
    'dt',
    'ellipse',
    'em',
    'feComponentTransfer',
    'feDropShadow',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feOffset',
    'feMerge',
    'feMergeNode',
    'filter',
    'g',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'ol',
    'p',
    'path',
    'pattern',
    'polyline',
    'polygon',
    'pre',
    'radialGradient',
    'rect',
    'small',
    'span',
    'stop',
    'strong',
    'sub',
    'summary',
    'sup',
    'svg',
    'table',
    'text',
    'textPath',
    'thead',
    'title',
    'tbody',
    'tspan',
    'td',
    'th',
    'tr',
    'u',
    'ul',
    TAG_DL_TOOLTIP,
].map((tag) => tag.toLowerCase());

export const ALLOWED_ATTRIBUTES = [
    'alt',
    'alignment-baseline',
    'aria-controls',
    'aria-describedby',
    'aria-expanded',
    'aria-haspopup',
    'aria-hidden',
    'aria-label',
    'aria-labelledby',
    'aria-live',
    'aria-pressed',
    'aria-readonly',
    'aria-roledescription',
    'aria-selected',
    'class',
    'clip-path',
    'clip-rule',
    'color',
    'colspan',
    'cursor',
    'cx',
    'cy',
    'd',
    'dx',
    'dy',
    'disabled',
    'dominant-baseline',
    'fill',
    'fill-opacity',
    'fill-rule',
    'filter',
    'filterunits',
    'flood-color',
    'flood-opacity',
    'font-family',
    'font-size',
    'font-weight',
    'fx',
    'fy',
    'height',
    'href',
    'id',
    'in',
    'letter-spacing',
    'mask',
    'name',
    'offset',
    'opacity',
    'orient',
    'overflow',
    'padding',
    'paint-order',
    'pointer-events',
    'points',
    'preserveaspectratio',
    'r',
    'refX',
    'refY',
    'role',
    'rx',
    'ry',
    'scope',
    'slope',
    'src',
    'stddeviation',
    'stop',
    'stop-color',
    'stop-opacity',
    'stroke',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-opacity',
    'stroke-width',
    'result',
    'rowspan',
    'summary',
    'target',
    'tabindex',
    'text-align',
    'text-anchor',
    'text-decoration',
    'title',
    'transform',
    'type',
    'valign',
    'viewbox',
    'width',
    'x',
    'x1',
    'x2',
    'xlink:href',
    'xmlns',
    'xmlns:xlink',
    'y',
    'y1',
    'y2',
    'zindex',
    'data-id',
    ATTR_DATA_TOOLTIP_CONTENT,
    ATTR_DATA_TOOLTIP_HIDE_DELAY,
    ATTR_DATA_TOOLTIP_OPEN_DELAY,
    ATTR_DATA_TOOLTIP_PLACEMENT,
].map((attr) => attr.toLowerCase());

export const ALLOWED_REFERENCES = ['https://', 'http://', 'mailto:', '#'];
