import React from 'react';

import {Clock, File, Key, Thunderbolt} from '@gravity-ui/icons';
import type {IconProps} from '@gravity-ui/uikit';
import {Flex, Icon, Label, Text} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {InterpolatedText} from 'ui/components/InterpolatedText/InterpolatedText';

const i18n = I18n.keyset('component.workbook-export-dialog.view');

const InfoRow = ({icon, text}: {icon: IconProps['data']; text: React.ReactNode}) => {
    return (
        <Flex gap={3} alignItems="center">
            <Label icon={<Icon data={icon} />} size="m" theme="info"></Label>
            <Text variant="body-1">{text}</Text>
        </Flex>
    );
};

export const ExportInfo = () => {
    return (
        <Flex gap={3} direction="column">
            <InfoRow text={i18n('label_info-file')} icon={File} />
            <InfoRow text={i18n('label_info-time')} icon={Clock} />
            <InfoRow text={i18n('label_info-secrets')} icon={Key} />
            <InfoRow
                text={<InterpolatedText disableLink text={i18n('label_info-versions')} />}
                icon={Thunderbolt}
            />
            {/* add it when the documentation is available. */}
            {/* <Link href="#" className={spacing({mt: 1})}>
                {i18n('label_info-documentation')}
            </Link> */}
        </Flex>
    );
};
