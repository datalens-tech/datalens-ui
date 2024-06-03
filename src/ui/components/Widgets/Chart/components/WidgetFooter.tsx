import React from 'react';

import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {YfmWrapper} from 'components/YfmWrapper/YfmWrapper';
import type {EntryPublicAuthor} from 'shared';

import {COMPONENT_CLASSNAME} from '../helpers/helpers';

import '../ChartWidget.scss';

export type FooterProps = {
    isFullscreen: boolean;
    description: string | null;
    withPaddings?: boolean;
    author?: EntryPublicAuthor;
};

const b = block(COMPONENT_CLASSNAME);

export const WidgetFooter = (props: FooterProps) => {
    const {isFullscreen, description, author, withPaddings} = props;

    const showWidgetFooter = Boolean(!isFullscreen && (description || author));

    return (
        <React.Fragment>
            {showWidgetFooter && (
                <div className={b('description', {'with-paddings': Boolean(withPaddings)})}>
                    {description && <YfmWrapper content={description} setByInnerHtml={true} />}
                </div>
            )}
            {author && author.text && (
                <div className={b('author', {'with-paddings': Boolean(withPaddings)})}>
                    {author.link ? (
                        <Link target="_blank" view="normal" href={author.link}>
                            {author.text}
                        </Link>
                    ) : (
                        author.text
                    )}
                </div>
            )}
        </React.Fragment>
    );
};
