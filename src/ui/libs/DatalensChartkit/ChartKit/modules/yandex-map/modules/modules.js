import defineCanvas from './components/Canvas';
import defineDataConverter from './components/DataConverter';
import defineHeatmap from './components/Heatmap';
import defineTitleUrlsGenerator from './components/TileUrlsGenerator';

function defineModules(ymaps) {
    defineHeatmap(ymaps);
    defineDataConverter(ymaps);
    defineTitleUrlsGenerator(ymaps);
    defineCanvas(ymaps);
}

export default defineModules;
