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
    enableDescription?: boolean;
    withPaddings?: boolean;
    author?: EntryPublicAuthor;
};

const b = block(COMPONENT_CLASSNAME);

export const WidgetFooter = (props: FooterProps) => {
    const {isFullscreen, description, author, withPaddings, enableDescription} = props;

    const enableDesc = enableDescription === undefined ? Boolean(description) : enableDescription;

    const showWidgetFooter = Boolean(!isFullscreen && (enableDesc || author));

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
