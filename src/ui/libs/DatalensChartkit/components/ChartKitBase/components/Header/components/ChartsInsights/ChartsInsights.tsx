import React from 'react';

import type {PopoverInstanceProps} from '@gravity-ui/uikit';
import {Button, Loader, Popover} from '@gravity-ui/uikit';
import logger from 'libs/logger';
import {isEmpty} from 'lodash';
import moment from 'moment';
import {useDispatch} from 'react-redux';
import type {ChartsInsightsItem} from 'shared';
import {updateUserSettings} from 'store/actions/user';
import {fetchBatchRenderedMarkdown} from 'ui/utils/renderMarkdown';

import {CounterName, GoalId, reachMetricaGoal} from '../../../../../../../metrica';
import type {ChartsInsightsData} from '../../../../../../types/widget';

import {ChartsInsightsIcon} from './components/ChartsInsightsIcon/ChartsInsightsIcon';
import {TooltipContent} from './components/TooltipContent/TooltipContent';
import {getIconLevel} from './helpers/getIconLevel';

type Props = ChartsInsightsData & {hidden?: boolean};

export const ChartsInsights = ({items = [], messagesByLocator, locators, hidden}: Props) => {
    const dispatch = useDispatch();

    const buttonRef = React.useRef<HTMLElement>(null);
    const tooltipRef = React.useRef<PopoverInstanceProps>(null);

    const [currentItems, setCurrentItems] = React.useState<ChartsInsightsItem[]>(items);
    const [currentLocators, setCurrentLocators] = React.useState<Record<string, string>>(locators);
    const [messages, setMessages] = React.useState<Record<string, {result: string}>>({});
    const [showTooltip, setShowTooltip] = React.useState<boolean>(false);

    const level = getIconLevel(currentItems);

    React.useEffect(() => {
        setCurrentItems(items);
        setCurrentLocators(locators);
    }, [items, locators]);

    React.useEffect(() => {
        if (level) {
            reachMetricaGoal(CounterName.Main, GoalId.ChartInsightsIconShow, {level});
        }
    }, [level]);

    const handleMouseEnter = async () => {
        if (!isEmpty(messagesByLocator) && isEmpty(messages)) {
            try {
                const result = await fetchBatchRenderedMarkdown(messagesByLocator);
                setMessages(result);
                // force Popover to recalculate its position after changing the content
                window.dispatchEvent(new CustomEvent('scroll'));
            } catch (error) {
                logger.logError('ChartsInsights: fetchBatchRenderedMarkdown failed', error);
            }
        }
    };

    const handleClick = () => {
        reachMetricaGoal(CounterName.Main, GoalId.ChartsInsightsIconClck, {level});
        const tooltipInstance = tooltipRef.current;
        if (!tooltipInstance) {
            return;
        }

        if (showTooltip) {
            setShowTooltip(false);
            tooltipInstance.closeTooltip();
        } else {
            setShowTooltip(true);
            tooltipInstance.openTooltip();
        }
    };

    const handleTooltipActionClick = (locator: string) => {
        setCurrentItems(currentItems.filter((item) => item.locator !== locator));

        const today = moment().format('DD.MM.YYYY');
        const updatedLocators = {...currentLocators, [locator]: today};
        setCurrentLocators(updatedLocators);
        const chartsInsightsLocators = JSON.stringify(updatedLocators);

        dispatch(updateUserSettings({newSettings: {chartsInsightsLocators}}));
    };

    React.useEffect(() => {
        setMessages({});
    }, [messagesByLocator]);

    if (isEmpty(currentItems) || !level || hidden) {
        return null;
    }

    return (
        <Popover
            ref={tooltipRef}
            openOnHover={false}
            placement={['left', 'right']}
            content={
                isEmpty(messages) ? (
                    <Loader size="s" />
                ) : (
                    <TooltipContent
                        items={currentItems}
                        messages={messages}
                        onButtonClick={handleTooltipActionClick}
                    />
                )
            }
        >
            <Button
                ref={buttonRef}
                view="flat-secondary"
                size="s"
                width="auto"
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
            >
                <ChartsInsightsIcon level={level} />
            </Button>
        </Popover>
    );
};
