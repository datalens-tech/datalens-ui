import type {BarsColorType, ServerFieldUpdate, WizardVisualizationId} from '../../../../../shared';

export type RecipeField = {
    /**
     * The name of the field. It can be the same as in the dataset, or it can be named differently
     * if it is required for a better understanding of what is happening on the chart.
     */
    title: string;
    /**
     * A formula can only contain the name of a data set field (if used one-to-one),
     * aggregation, or something more complex from the list of formulas available for a given dataset source.
     */
    formula: string;
};

export type RecipeFieldUpdate = {
    action: ServerFieldUpdate['action'];
    field: RecipeField & {
        /** To replace the default value of the dataset parameter. */
        default_value?: string;
    };
};

export type FilterValue = {
    /** A dataset field (or a new field created at the chart level) used to select data. */
    field: RecipeField;
    /** The operation used to compare the field value with the filter value. */
    operation: string;
    /** The filter values used for comparison with the values of the specified dataset field. */
    values: string[];
};

export type SortingValue = RecipeField & {
    /** Sorting direction */
    direction: 'ASC' | 'DESC';
};

export type TableColumns = RecipeField & {
    /** If it is defined, then display the linear indicator as a bar in the table cell. */
    bar?: {
        colorType?: BarsColorType.Gradient;
        palette?: string;
    };
};

export type WizardChartRecipe = {
    /** The id of the dataset whose fields are used to fill in the axes/colors/filters, etc. of the chart recipe. */
    datasetId: string;
    /** Description of fields added at the chart level or updated parameters (with a different default value, for example). */
    datasetUpdates?: RecipeFieldUpdate[];
    /**
     * The chart layer. The most common case is a single-layer chart.
     * However, if you want to combine several types of visualizations (for example, a line chart and a bar chart),
     * then each type of visualization will be located on a separate layer.
     */
    layers: {
        /** visualization type - for example, linear, pie, or bar charts
         * "column" is a chart with vertical columns. The X-axis usually shows a category (most often a string), and the Y-axis shows a dimension (numbers).
         * "column100p" is a normalized column chart. This is the same as "column", but "column100p" compares the proportional distribution of parts within each category, with the sum for each column equal to 100%.
         * "bar" is a chart with horizontal bars. The Y-axis usually shows a category (most often a string), and the X-axis shows a dimension (numbers).
         * "bar100p" is a normalized "bar" chart.
         */
        type: WizardVisualizationId;
        /**
         * Fields whose values are used to form the X-axis.
         * Usually, a single field is used, unless it is a categorical axis with grouping, as, for example, in a bar chart.
         * Unavailable for "pie" and "donut" charts.
         * */
        x?: RecipeField[];
        /**
         * Fields whose values are used to form the Y-axis.
         * Multiple fields can be used if you want to display different data for the same X-axis.
         * Unavailable for "pie" and "donut" charts.
         * */
        y?: RecipeField[];
        /** There is usually one field whose values are used to group chart series.
         * The colors are assigned automatically in order or set by the user.
         * */
        colors?: RecipeField[];
        /** Fields whose values are used to form table columns. The section is used only for flat and pivot tables. */
        columns?: TableColumns[];
        /** Fields whose values are used to form table rows. The section is used only for pivot tables. */
        rows?: RecipeField[];
        /**
         * Fields used to generate measure values.
         * For pivot tables, this is an aggregation at the intersection of selected columns and rows.
         * For pie or donut charts, this is the value that will determine the size of the chart segment
         * */
        measures?: RecipeField[];
        /**
         * Categorical fields used to generate multiple subplots, where each unique value creates a separate chart showing that subset of the data.
         */
        split?: RecipeField[];
        /** Filters that are used to select the data used in the chart. */
        filters?: FilterValue[];
        /** Fields that are used to sort the data used in the chart. */
        sorting?: SortingValue[];
    }[];
};
