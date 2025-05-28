import React from 'react';

import {ArrowRight, Medal} from '@gravity-ui/icons';
import {
    Button,
    Card,
    Col,
    Flex,
    Icon,
    Row,
    useLayoutContext,
    useThemeType,
} from '@gravity-ui/uikit';
import {useHistory} from 'react-router-dom';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import {useGetGalleryItemQuery} from 'ui/units/gallery/store/api';

import type {CnMods} from '../../utils';
import {
    block,
    galleryLandingI18n,
    getGalleryItemUrl,
    getLang,
    galleryI18n as i18n,
} from '../../utils';

import './WorkOfMonth.scss';

const b = block('work-of-the-month');

export const WorkOfMonth = ({id}: {id: string}) => {
    const {activeMediaQuery} = useLayoutContext();
    const {isLoading, data} = useGetGalleryItemQuery({id});
    const themeType = useThemeType();
    const history = useHistory();

    const handleClick = React.useCallback(
        () => history.push(getGalleryItemUrl({id})),
        [history, id],
    );

    const handleOpen = React.useCallback(() => {
        const url = getGalleryItemUrl({id, preview: true});
        history.push(url);
    }, [history, id]);

    if (isLoading || !data) {
        return null;
    }

    const lang = getLang();
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const baseMods: CnMods = {media: activeMediaQuery};
    const title = data.title?.[lang] ?? '';
    const description = data.shortDescription?.[lang] ?? '';
    const imgSrc = data.images?.[themeType]?.[0];

    return (
        <Row className={b(baseMods)} space="0">
            <Col m="6" s="12">
                <Flex className={b('flex', baseMods)}>
                    <span className={b('medal', {media: activeMediaQuery})}>
                        <Icon data={Medal} />
                        {galleryLandingI18n('section_work_of_month')}
                    </span>
                    <div className={b('title', {media: activeMediaQuery})}>{title}</div>
                    {!isActiveMediaQueryS && <div className={b('description')}>{description}</div>}
                    {!isActiveMediaQueryS && (
                        <div className={b('actions')}>
                            <Button size="l" view="action" onClick={handleOpen}>
                                {i18n('button_open')}
                            </Button>
                            <Button size="l" view="flat" onClick={handleClick}>
                                {i18n('button_learn_more')}
                                <Button.Icon>
                                    <ArrowRight />
                                </Button.Icon>
                            </Button>
                        </div>
                    )}
                </Flex>
            </Col>
            {imgSrc && (
                <Col m="6" s="12">
                    <Flex style={{alignItems: 'center', height: '100%'}}>
                        <Card view="clear" type="action" className={b('card')}>
                            <AsyncImage className={b('img')} src={imgSrc} showSkeleton={true} />
                        </Card>
                    </Flex>
                </Col>
            )}
            {isActiveMediaQueryS && (
                <Col s="12">
                    <div className={b('actions')}>
                        <Button size="xl" view="action" style={{width: '50%'}} onClick={handleOpen}>
                            {i18n('button_open')}
                        </Button>
                        <Button size="xl" view="flat" style={{width: '50%'}} onClick={handleClick}>
                            {i18n('button_learn_more')}
                        </Button>
                    </div>
                </Col>
            )}
        </Row>
    );
};
