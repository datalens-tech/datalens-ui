import iconArea100p from 'ui/assets/icons/charts-visualisations/vis-area-100p.svg';
import iconArea from 'ui/assets/icons/charts-visualisations/vis-area.svg';
import iconBar100p from 'ui/assets/icons/charts-visualisations/vis-bar-100p.svg';
import iconBar from 'ui/assets/icons/charts-visualisations/vis-bar.svg';
import iconColumn100p from 'ui/assets/icons/charts-visualisations/vis-column-100p.svg';
import iconColumn from 'ui/assets/icons/charts-visualisations/vis-column.svg';
import iconDonut from 'ui/assets/icons/charts-visualisations/vis-donut.svg';
import iconFlatTable from 'ui/assets/icons/charts-visualisations/vis-flat-table.svg';
import iconGeolayers from 'ui/assets/icons/charts-visualisations/vis-geolayers.svg';
import iconLine from 'ui/assets/icons/charts-visualisations/vis-lines.svg';
import iconMetric from 'ui/assets/icons/charts-visualisations/vis-metric.svg';
import iconPie from 'ui/assets/icons/charts-visualisations/vis-pie.svg';
import iconPivotTable from 'ui/assets/icons/charts-visualisations/vis-pivot.svg';
import iconScatter from 'ui/assets/icons/charts-visualisations/vis-scatter.svg';
import iconTreemap from 'ui/assets/icons/charts-visualisations/vis-treemap.svg';
import iconAnyChart from 'ui/assets/icons/relations-any.svg';
import iconControls from 'ui/assets/icons/relations-controls.svg';

export const RELATIONS_CHARTS_ICONS_DICT = {
    control: iconControls,
    table: iconFlatTable,
    widget: iconAnyChart,
    line: iconLine,
    area: iconArea,
    area100p: iconArea100p,
    column: iconColumn,
    column100p: iconColumn100p,
    bar: iconBar,
    bar100p: iconBar100p,
    scatter: iconScatter,
    pie: iconPie,
    donut: iconDonut,
    metric: iconMetric,
    metric2: iconMetric,
    treemap: iconTreemap,
    flatTable: iconFlatTable,
    pivotTable: iconPivotTable,
    geolayer: iconGeolayers,
    ymap: iconGeolayers,
};

export const DEFAULT_ALIAS_NAMESPACE = 'default';
export const DEFAULT_TITLE_ICON_SIZE = 24;
export const DEFAULT_ICON_SIZE = 16;

export const RELATION_TYPES = {
    ignore: 'ignore',
    input: 'input',
    output: 'output',
    both: 'both',
    unknown: 'unknown',
};

export const TEXT_LIMIT = 20;
