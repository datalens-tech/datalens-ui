// import {I18n} from 'i18n';
import {DL} from 'ui/constants';

// const i18n = I18n.keyset('component.chart-modeling-settings');

const keyset_mock: any = {
    ru: {
        'label_additional-settings': 'Дополнительные настройки',
        label_auto: 'Авто',
        label_cubic: 'Кубическая',
        label_linear: 'Линейная',
        'label_link-series': 'Связать отображение линий',
        label_method: 'Функция',
        'label_null-data-warning':
            'Моделирование построено неточно, так как данные частично или полностью отсутствуют',
        'label_null-data-warning-short': 'Неточность моделирования',
        label_quadratic: 'Квадратичная',
        'label_shape-and-width': 'Форма и толщина линий',
        'label_simple-moving-average': 'Простое скользящее среднее',
        label_smoothing: 'Сглаживание',
        label_trend: 'Тренд',
        'label_window-size': 'Окно (количество точек)',
        title_modeling: 'Моделирование',
        'tooltip_smoothing-method':
            'Простое скользящее среднее - среднее арифметическое в точке t за интервал, указанный в "Окне". Окно учитывает значения до точки t.',
        'tooltip_smoothing-window-size':
            'Количество точек, которые будут взяты для расчета среднего арифметического, включая саму точку t.',
        'tooltip_trend-method':
            '**Линейная** - линейная регрессия, представляет собой прямую линию, помогает в целом оценить рост или падение на выбранном интервале\n**Квадратичная** - если на исходных данных явно видна нелинейная зависимость в данных.\n**Кубическая** - если на исходных данных явно видно больше одного перегиба\n\nNB! Усложнение вида функций соотносите с количеством точек на графике, используйте степенные функции с осторожностью при принятии решений.',
    },
    en: {
        'label_additional-settings': 'Additional settings',
        label_auto: 'Auto',
        label_cubic: 'Cubic',
        label_linear: 'Linear',
        'label_link-series': 'Link series lines',
        label_method: 'Function',
        'label_null-data-warning':
            'The modeling is inaccurate, as the data is partially or completely missing.',
        'label_null-data-warning-short': "Modeling's inaccuracy",
        label_quadratic: 'Quadratic',
        'label_shape-and-width': "Line's shape and width",
        'label_simple-moving-average': 'Simple moving average',
        label_smoothing: 'Smoothing',
        label_trend: 'Trend',
        'label_window-size': 'Window (points count)',
        title_modeling: 'Modeling',
        'tooltip_smoothing-method':
            'A simple moving average is the arithmetic mean at point t over the interval specified in the "Window". The window takes into account the values up to the point t.',
        'tooltip_smoothing-window-size':
            'The number of points that will be taken to calculate the arithmetic mean, including the point t itself.',
        'tooltip_trend-method':
            '**Linear** - linear regression, which is a straight line, helps to generally assess growth or decline in the selected interval**Quadratic** - if the source data clearly shows a nonlinear dependence in the data.\n**Cubic** - if more than one inflection is clearly visible on the source data\n\nNB! Correlate the complexity of the type of functions with the number of points on the graph, use power functions with caution when making decisions.',
    },
};

export const i18n = (keysetName: string) => {
    return keyset_mock[DL.USER_LANG]?.[keysetName];
};
