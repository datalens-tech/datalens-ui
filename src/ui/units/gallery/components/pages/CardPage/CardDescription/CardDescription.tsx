import React from 'react';

import {Flex, Link, Text} from '@gravity-ui/uikit';
import type {TranslationsDict} from 'shared/types';
import {useMarkdown} from 'ui/hooks/useMarkdown';

import {block, galleryCardPageI18n as i18n} from '../../../utils';

import './CardDescription.scss';

const b = block('card-description');

interface CardDescriptionProps {
    lang: string;
    description?: TranslationsDict;
    shortDescription?: TranslationsDict;
}

export function CardDescription({lang, description, shortDescription}: CardDescriptionProps) {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const {markdown} = useMarkdown({value: getTranslation(description), className: b('md')});
    const shouldShowButton = Boolean(description);

    function getTranslation(dict?: TranslationsDict) {
        return dict?.[lang] || '';
    }

    React.useEffect(() => {
        setIsExpanded(false);
    }, [description, shortDescription]);

    return (
        <Flex direction="column" style={{maxWidth: 720}} className={b()}>
            {shortDescription && <Text variant="body-2">{getTranslation(shortDescription)}</Text>}
            {isExpanded && description && markdown}
            {shouldShowButton && (
                <Link
                    className={b('card-description-collapse')}
                    href="#"
                    onClick={(event) => {
                        event.preventDefault();
                        setIsExpanded(!isExpanded);
                    }}
                    view="secondary"
                    visitable={false}
                >
                    {isExpanded ? i18n('button_collapse') : i18n('button_show_full')}
                </Link>
            )}
        </Flex>
    );
}
