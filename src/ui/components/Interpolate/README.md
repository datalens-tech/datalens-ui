## Interpolate

Component for adding react-components in text from i18n.

### Usage

```tsx
import React from 'react';
import block from 'bem-cn-lite';
import {Interpolate} from '../../../components/Interpolate';
import './InterpolateDemo.scss';

const b = block('interpolate-demo');

export default class InterpolateDemo extends React.Component {
  render() {
    const text = 'Some <link>link</link> to <red>docs</red>!';

    return (
      <div className={b()}>
        <Interpolate
          text={text}
          matches={{
            link(match) {
              return <a href="https://some.osesome.site.example">{match}</a>;
            },
            red(match) {
              return <span className={b('tomato')}>{match}</span>;
            },
          }}
        />
      </div>
    );
  }
}
```

### Notes

- works with one level of nesting;
