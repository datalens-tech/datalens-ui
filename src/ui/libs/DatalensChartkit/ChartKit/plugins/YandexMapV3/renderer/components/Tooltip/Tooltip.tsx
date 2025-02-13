import React from 'react';

import block from 'bem-cn-lite';

import './Tooltip.scss';

const b = block('ymap-tooltip');

type Props = {
	title?: string;
};

export const Tooltip = (props: Props) => {
	const {title} = props;

	return (
		<div className={b()}>
			<div className={b('title')}>
				{title}
			</div>
		</div>
	);
}