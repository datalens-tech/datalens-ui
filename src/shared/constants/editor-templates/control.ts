import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Selector,
    name: 'control',
    type: EDITOR_TYPE.CONTROL_NODE,
    data: {
        ui: `const moment = require('vendor/moment/v2.21');

const {regionsDict} = ChartEditor.getLoadedData();
    
module.exports = [
    {
        type: 'select' ,
        param: 'scale',
        content: [
            {title: 'Daily', value: 'd'},
            {title: 'Weekly', value: 'w'},
            {title: 'Monthly', value: 'm'}
        ],
        updateControlsOnChange: true
    },
    {
        type: 'select',
        param: 'select',
        
        // заголовок
        // по умолчанию: ''
        label: 'Селект',
        
        // множественный выбор
        // по умолчанию: false
        multiselect: true,
        
        // добавить поисковую строку 
        // по умолчанию: true
        searchable: false,
        
        // cодержимое селекта    
        content: Object.entries(regionsDict).map(([key, value]) => (
                // title — имя в выпадушке, которое будет выглядеть пользователь            
            // value — значение, которое попадет в параметр после выбора    
            {title: value, value: key}
        )),
        
        // updateOnChange: true,
        // updateControlsOnChange: true
    },
    {
        type: 'input',
        param: 'input',
        
        // заголовок
        // по умолчанию: ''
        label: 'Поле ввода',
        
        // текст-заглушка, когда у поля нет содержимого
        // по умолчанию: ''
        placeholder: 'Введите текст',
        
        // updateOnChange: true,
        // updateControlsOnChange: true
    }, 
    {
        type: 'datepicker',
        param: 'datepicker',
        
        // заголовок
        // по умолчанию: ''
        label: 'Дата',
        
        // ограничения по выбору даты и времени
        // по умолчанию: не заданы
        minDate: moment().subtract(8, 'days').format(),
        maxDate: moment().subtract(-7, 'days').format(),
        
        // updateOnChange: true,
        // updateControlsOnChange: true
    },
    {
        type: 'range-datepicker',
        // Параметр, с которым будет связано значение начала интервала
        paramFrom: 'rangeDatepickerFrom',
        // Аналогично, для конца интервала
        paramTo: 'rangeDatepickerTo',
        
        // заголовок
        // по умолчанию: ''
        label: 'Календарь',
        
        // ограничения по выбору даты и времени
        // по умолчанию: не заданы
        minDate: moment().subtract(8, 'days').format(),
        maxDate: moment().subtract(-7, 'days').format(),
    },
    {
        type: 'checkbox',
        param: 'checkbox',
        
        // заголовок
        label: 'Verify'
    },
    {
        type: 'button',
        
        // текст
        label: 'Go',
        
        // тема кнопки
        theme: 'action'
    }
];`,
        url: `const Stat = require('libs/stat/v1');
        
module.exports = {
    regionsDict: {
        url: Stat.buildDictSource({
            name: 'stat_report_regions',
            language: 'ru'
        }),
        ui: true
    }
};
        `,
        params: `const moment = require('vendor/moment/v2.19');
        
module.exports = {
    input: ['Lorem ipsum'],
    datepicker: [moment().subtract(1, 'days').format()],
    rangeDatepickerFrom: [moment().subtract(1, 'days').format()],
    rangeDatepickerTo: [moment().subtract(-1, 'days').format()],
    select: ['RU'],
    checkbox: ['true'],
    scale: ['d']
};
        `,
        shared: '',
    },
};
