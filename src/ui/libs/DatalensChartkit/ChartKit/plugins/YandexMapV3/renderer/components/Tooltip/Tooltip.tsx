import React from 'react';
import ReactDom from 'react-dom';

import block from 'bem-cn-lite';
import {formatNumber} from 'shared';
import isEmpty from 'lodash/isEmpty';

import './Tooltip.scss';

const b = block('yandex-map-tooltip');

type HintProps = {
	name?: string;
	value?: number;
	text?: string;
};

export const Tooltip = (props: {context: {hint?: HintProps}}) => {
	const hintContext = React.useContext(props.context);
  
	if (isEmpty(hintContext?.hint)) {
	  return null;
	}

	const {name: title, value, text} = hintContext.hint;
	const formattedValue = typeof value === 'number' ? formatNumber(value) : null;

	return (
		<div className={b()}>
			{title && <div className={b('title')}>
				{title}
			</div>}
			<div className={b('row')}>
				{formattedValue && <div className={b('cell')}>
					{formattedValue}
				</div>}
				{text && <div className={b('cell')}>
					{text}
				</div>}
			</div>
		</div>
	);
}