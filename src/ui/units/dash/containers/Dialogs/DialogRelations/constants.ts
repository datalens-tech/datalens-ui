import LogoMarkdownIcon from '@gravity-ui/icons/svgs/logo-markdown.svg';
import iconFlatTable from 'ui/assets/icons/charts-visualisations/vis-flat-table.svg';
import iconGeolayers from 'ui/assets/icons/charts-visualisations/vis-geolayers.svg';
import iconMetric from 'ui/assets/icons/charts-visualisations/vis-metric.svg';
import iconAnyChart from 'ui/assets/icons/relations-any.svg';
import iconControls from 'ui/assets/icons/relations-controls.svg';

export const RELATIONS_CHARTS_ICONS_DICT = {
    control: iconControls,
    table: iconFlatTable,
    widget: iconAnyChart,
    metric: iconMetric,
    metric2: iconMetric,
    ymap: iconGeolayers,
    markdown: LogoMarkdownIcon,
    markup: iconMetric,
};

export const DEFAULT_ALIAS_NAMESPACE = 'default';
export const DEFAULT_ICON_SIZE = 16;

export const RELATION_TYPES = {
    ignore: 'ignore',
    input: 'input',
    output: 'output',
    both: 'both',
    unknown: 'unknown',
};

export const TEXT_LIMIT = 20;

export const FULL_RELATIONS = [
    RELATION_TYPES.both,
    RELATION_TYPES.input,
    RELATION_TYPES.output,
    RELATION_TYPES.ignore,
];

export const INPUT_RELATIONS = [RELATION_TYPES.input, RELATION_TYPES.ignore];

export const OUTPUT_RELATIONS = [RELATION_TYPES.output, RELATION_TYPES.ignore];
