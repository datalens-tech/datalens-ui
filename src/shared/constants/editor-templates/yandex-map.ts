import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.YMap,
    name: 'yandex-map',
    type: EDITOR_TYPE.YMAP_NODE,
    data: {
        js: `module.exports = [
    {
        feature: {
            geometry: {
                type: 'Circle',
                coordinates: [55.74, 37.61],
                radius: 20000
            },
            properties: {
                name: 'Москва',
                value: 12381,
                text: 'население (тыс. на 1 января 2017)'
            }
        },
        options: {
            fillColor: '#990066',
            opacity: 0.5
        }
    },
    {
        feature: {
            geometry: {
                type: 'Point',
                coordinates: [55.98, 37.59]
            },
            properties: {
                name: 'Point',
                value: Math.random(),
                text: 'случайное число'
            }
        },
        options: {}
    },
    {
        feature: {
            geometry: {
                type: 'LineString',
                coordinates: [
                    [55.90, 37.10],
                    [55.80, 37.00],
                    [55.80, 37.10],
                    [55.70, 37.00],
                    [55.70, 37.10],
                    [55.60, 37.00]
                ]
            },
            properties: {
                name: 'LineString',
                value: Math.random()
            }
        },
        options: {
            strokeWidth: 5
        }
    },
    {
        feature: {
            geometry: {
                type: 'Rectangle',
                coordinates: [[55.40, 37.00], [55.50, 37.40]]
            },
            properties: {
                name: 'Rectangle',
                text: 'прямоугольник'
            }
        },
        options: {}
    },
    {
        feature: {
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [[55.45, 37.50], [55.45, 37.71], [55.40, 37.70]],
                    [[55.43, 37.58], [55.42, 37.70], [55.40, 37.70]]
                ]
            },
            properties: {}
        },
        options: {}
    },
    {
        feature: {
            geometry: {
                type: 'Point',
                coordinates: [55.80, 38.37]
            },
            properties: {
                name: 'Point',
                data: [
                    {weight: 52, color: '#FFA002', text: 'оранжевый'},
                    {weight: 42, color: '#880011', text: 'красный'},
                    {weight: 23, color: '#035201', text: 'зеленый'},
                    {weight: 12, color: '#002f55', text: 'синий'}
                ]
            }
        },
        options: {
            iconLayout: 'default#pieChart',
        }
    },
    {
        collection: {
            children: [
                {
                    feature: {
                        geometry: {
                            type: 'Point',
                            coordinates: [55.45, 38.20]
                        },
                        properties: {
                            name: 'первый'
                        }
                    },
                    options: {}
                },
                {
                    feature: {
                        geometry: {
                            type: 'Point',
                            coordinates: [55.45, 38.51]
                        },
                        properties: {
                            name: 'второй'
                        }
                    },
                    options: {}
                },
                {
                    feature: {
                        geometry: {
                            type: 'Point',
                            coordinates: [55.40, 38.40]
                        },
                        properties: {
                            name: 'третий'
                        }
                    },
                    options: {}
                }
            ]
        },
        options: {
            preset: 'islands#redIcon',
        }
    },
    {
        clusterer: [
            {
                feature: {
                    geometry: {
                        type: 'Point',
                        coordinates: [56.023, 36.988]
                    },
                    properties: {}
                },
                options: {}
            },
            {
                feature: {
                    geometry: {
                        type: 'Point',
                        coordinates: [56.025, 36.981]
                    },
                    properties: {}
                },
                options: {}
            },
            {
                feature: {
                    geometry: {
                        type: 'Point',
                        coordinates: [56.020, 36.981]
                    },
                    properties: {}
                },
                options: {}
            },
            {
                feature: {
                    geometry: {
                        type: 'Point',
                        coordinates: [56.021, 36.983]
                    },
                    properties: {}
                },
                options: {}
            },
            {
                feature: {
                    geometry: {
                        type: 'Point',
                        coordinates: [56.027, 36.987]
                    },
                    properties: {}
                },
                options: {}
            }
        ],
        options: {
            clusterDisableClickZoom: false
        }
    }
];
`,
        url: '',
        ymap: `module.exports = {
    state: {
        center: [55.76, 37.64],
        zoom: 8,
        controls: ['zoomControl'],
        behaviors: ['drag', 'scrollZoom', 'multiTouch']
    },
    options: {}
};
`,
        params: '',
        shared: '',
    },
};
