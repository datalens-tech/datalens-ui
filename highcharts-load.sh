#!/bin/bash

VERSION=8.2.2
DIR=./dist/public/highcharts/$VERSION

mkdir -p $DIR
mkdir -p $DIR/modules

wget -P $DIR "https://code.highcharts.com/$VERSION/highcharts.js"
wget -P $DIR "https://code.highcharts.com/$VERSION/highcharts-more.js"
for mdl in 'exporting' 'export-data' 'stock' 'solid-gauge' 'funnel' 'histogram-bellcurve' 'sankey' 'heatmap' 'treemap' 'variwide' 'streamgraph' 'drilldown' 'parallel-coordinates' 'pattern-fill' 'wordcloud' 'xrange' 'networkgraph' 'timeline' 'bullet' 'annotations' 'series-label' 'venn'
do
wget -P $DIR/modules "https://code.highcharts.com/$VERSION/modules/$mdl.js"
done