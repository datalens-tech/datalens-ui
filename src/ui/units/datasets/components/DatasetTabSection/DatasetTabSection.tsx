import React from 'react';

import type {ButtonSize} from '@gravity-ui/uikit';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DatasetTabSectionQA} from 'shared';
import {Interpolate} from 'ui';

import './DatasetTabSection.scss';

const b = block('dataset-tab-section-wrapper');

export type DatasetTabSectionWrapperProps = {
    title: string;
    description: React.ReactNode;
    onConfirmClick?: () => void;
    confirmButtonText: string;
    isLoading: boolean;
    qa?: string;
    children: React.ReactNode;
    sectionNotice?: React.ReactNode;
    confirmBtnSize?: ButtonSize;
    confirmBtnDisabled?: boolean;
    confirmBtnClassName?: string;
};

export const DatasetTabSection: React.FC<DatasetTabSectionWrapperProps> = (
    props: DatasetTabSectionWrapperProps,
) => {
    const {
        title,
        description,
        onConfirmClick,
        confirmButtonText,
        isLoading,
        qa,
        children,
        confirmBtnSize,
        sectionNotice,
        confirmBtnDisabled,
        confirmBtnClassName,
    } = props;

    return (
        <div className={b(null, 'dataset_tab')} data-qa={qa}>
            <div className={b('content')}>
                {sectionNotice && sectionNotice}
                <div className={b('section')}>
                    <div className={b('title')}>{title}</div>
                    <div className={b('description')}>
                        {typeof description === 'string' ? (
                            <Interpolate
                                text={description}
                                matches={{
                                    br() {
                                        return <br />;
                                    },
                                }}
                            />
                        ) : (
                            description
                        )}
                    </div>
                    {children}
                    {onConfirmClick && (
                        <Button
                            size={confirmBtnSize}
                            className={b('confirm-button', null, confirmBtnClassName)}
                            disabled={confirmBtnDisabled}
                            loading={isLoading}
                            onClick={onConfirmClick}
                            qa={DatasetTabSectionQA.AddButton}
                        >
                            {confirmButtonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
