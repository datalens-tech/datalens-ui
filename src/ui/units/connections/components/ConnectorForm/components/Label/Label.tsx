import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {LabelItem} from 'shared/schema/types';
import {Interpolate} from 'ui';

import {MarkdownItem} from '../';

import './Label.scss';

const b = block('conn-form-label');

type LabelProps = Omit<LabelItem, 'id'>;

const getStyles = (align: NonNullable<LabelItem['align']>) => {
    let alignItems: React.CSSProperties['alignItems'];

    switch (align) {
        case 'start': {
            alignItems = 'flex-start';
            break;
        }
        case 'end': {
            alignItems = 'flex-end';
            break;
        }
        default: {
            alignItems = 'center';
        }
    }

    return {alignItems};
};

const LabelText = ({text = ''}: {text: string}) => {
    return (
        <Interpolate
            text={text}
            matches={{
                br() {
                    return <br />;
                },
            }}
        />
    );
};

export const Label = ({text, helpText, align = 'center'}: LabelProps) => {
    const handleMarkdownLoad = React.useCallback(() => {
        // Dispatching of scroll event force popup to recalculate its position after content changing
        window.dispatchEvent(new CustomEvent('scroll'));
    }, []);

    return (
        <div style={getStyles(align)} className={b({align})}>
            <span className={b('inner-content')}>
                <LabelText text={text} />
                {helpText && (
                    <HelpPopover
                        className={b('help-text')}
                        content={
                            <MarkdownItem
                                text={helpText}
                                fallback={<Loader size="s" />}
                                onLoad={handleMarkdownLoad}
                            />
                        }
                    />
                )}
            </span>
        </div>
    );
};
