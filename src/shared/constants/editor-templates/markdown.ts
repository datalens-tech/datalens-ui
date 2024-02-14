import {EDITOR_TYPE} from '../..';
import {EditorTemplatesQA} from '../qa/editor';

export default {
    qa: EditorTemplatesQA.Markdown,
    name: 'markdown',
    type: EDITOR_TYPE.MARKDOWN_NODE,
    data: {
        js: `const inline = 'Для вставки кода внутри предложений нужно заключать этот код в апострофы \`<html class="ie no-js">\`.';

const markdown = \`
# Заголовок h1
## Заголовок h2
### Заголовок h3
#### Заголовок h4

~~Зачеркнуто~~

Этот текст _**жирный и наклонный**_.

[Ссылка](https://docs.charts.yandex-team.ru)

***

> ## Цитата.
>
> 1.   Строчка 1.
> 2.   Строчка 2.
>
> Конец.

---

- Элемент 1
    - Элемент A
    - Элемент B
- Элемент 2

1. Первый пункт
    1. Вложенный пункт
    1. Вложенный пункт
1. Второй пункт

---

Колонка по левому краю | Колонка по правому краю | Колонка по центру
:--- | ---: | :---:
Текст | Текст | Текст

---

\\\`\\\`\\\`js
// код
const b = 10;
\\\`\\\`\\\`

\${inline}

---

![alt text](https://jing.yandex-team.ru/files/resure/1510243726_giphy%20%281%29.gif "Logo Title Text 1")\`;

module.exports = { 
    markdown
};`,
        url: '',
        params: '',
        shared: '',
    },
};
