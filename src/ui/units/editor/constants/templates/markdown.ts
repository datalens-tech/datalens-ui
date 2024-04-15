import {EDITOR_TYPE, EditorTemplatesQA} from '../../../../../shared/constants';

export default {
    qa: EditorTemplatesQA.Markdown,
    name: 'markdown',
    type: EDITOR_TYPE.MARKDOWN_NODE,
    data: {
        js: `const markdown = \`
# Header h1
## Header h2
### Header h3
#### Header h4

~~Strikethrough~~

This text is _**bold and italic**_.

[Link](https://datalens.tech/)

***

> ## Quotation.
>
> 1.   String 1.
> 2.   String 2.
>
> End.

---

- Element 1
    - Element A
    - Element B
- Element 2

1. First
    1. A
    1. B
1. Second

---

Left side column | Right side column | Center column
:--- | ---: | :---:
Text | Text | Text

---

\\\`\\\`\\\`js
// Code
const b = 10;
\\\`\\\`\\\`

---
\`;

module.exports = { 
    markdown
};
`,
        url: '',
        params: '',
        shared: '',
    },
};
