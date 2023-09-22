import preparePie from './preparePie';

export function prepareHighchartsPie(args: any) {
    const {ChartEditor, labels} = args;
    const {graphs, categories, totals, measure, label} = preparePie(args);

    if (ChartEditor) {
        const labelsLength = labels && labels.length;
        const isHideLabel = measure?.hideLabelMode === 'hide';

        ChartEditor.updateHighchartsConfig({
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: Boolean(labelsLength && label && !isHideLabel),
                    },
                },
            },
        });
    }

    return {graphs, categories, totals};
}
