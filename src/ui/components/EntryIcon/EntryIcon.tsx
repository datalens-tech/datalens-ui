import React from 'react';

import {Icon, IconData, IconProps} from '@gravity-ui/uikit';
import {ConnectorType, ENTRY_TYPES, Feature} from 'shared';
import Utils from 'ui/utils';

import {
    EntityIcon,
    EntityIconSize,
    EntityIconType,
    defaultIconSize,
} from '../EntityIcon/EntityIcon';

import iconFilesBroken from '../../assets/icons/broken.svg';
import iconMonitoring from '../../assets/icons/connections/monitoring-mini.svg';
import iconPrometheus from '../../assets/icons/connections/prometheus-mini.svg';
import iconBigQuery from '../../assets/icons/file-con-bigquery.svg';
import iconAppmetrica from '../../assets/icons/files-con-appmetrica.svg';
import iconBitrix from '../../assets/icons/files-con-bitrix.svg';
import iconChGeoFilterd from '../../assets/icons/files-con-ch-geo-filtered.svg';
import iconCHYDB from '../../assets/icons/files-con-chydb.svg';
import iconCHYT from '../../assets/icons/files-con-chyt-token.svg';
import iconCHYTUser from '../../assets/icons/files-con-chyt-user.svg';
import iconClickHouse from '../../assets/icons/files-con-clickhouse.svg';
import iconCSV from '../../assets/icons/files-con-csv.svg';
import iconFile from '../../assets/icons/files-con-file.svg';
import iconGreenplum from '../../assets/icons/files-con-greenplum.svg';
import iconGoogleSheets from '../../assets/icons/files-con-gsheets.svg';
import iconMetrica from '../../assets/icons/files-con-metrica.svg';
import iconMoySklad from '../../assets/icons/files-con-moysklad.svg';
import iconMSSQL from '../../assets/icons/files-con-mssql.svg';
import iconMySQL from '../../assets/icons/files-con-mysql.svg';
import iconOracle from '../../assets/icons/files-con-oracle.svg';
import iconPostgreSQL from '../../assets/icons/files-con-postgresql.svg';
import iconUsageTrackingYCDetailed from '../../assets/icons/files-con-utyc-detailed.svg';
import iconUsageTrackingYCLight from '../../assets/icons/files-con-utyc-light.svg';
import iconUsageTrackingYT from '../../assets/icons/files-con-utyt.svg';
import iconYaMusicPodcast from '../../assets/icons/files-con-ya-music-podcast.svg';
import iconYDB from '../../assets/icons/files-con-ydb.svg';
import iconYQ from '../../assets/icons/files-con-yq.svg';
import iconYT from '../../assets/icons/files-con-yt.svg';
import iconCHBA from '../../assets/icons/files-conn-ch-ba.svg';
import iconChytYC from '../../assets/icons/files-conn-chyt-yc.svg';
import iconEqueo from '../../assets/icons/files-conn-equeo.svg';
import iconExtractor1C from '../../assets/icons/files-conn-extractor1c.svg';
import iconKonturMarket from '../../assets/icons/files-conn-kontur-market.svg';
import iconKpIndex from '../../assets/icons/files-conn-kp-index.svg';
import iconSchoolbookJournal from '../../assets/icons/files-conn-schoolbook-journal.svg';
import iconSmbHeatmaps from '../../assets/icons/files-conn-smb-heatmaps.svg';
import iconSnowflake from '../../assets/icons/files-conn-snowflake.svg';
import iconYadocs from '../../assets/icons/files-conn-yadocs.svg';

const typeToIcon: Record<string, IconData> = {
    [ConnectorType.Csv]: iconCSV,
    [ConnectorType.Mssql]: iconMSSQL,
    [ConnectorType.AppMetrica]: iconAppmetrica,
    [ConnectorType.Postgres]: iconPostgreSQL,
    [ConnectorType.MetrikaApi]: iconMetrica,
    [ConnectorType.Oracle]: iconOracle,
    [ConnectorType.Mysql]: iconMySQL,
    [ConnectorType.Yt]: iconYT,
    [ConnectorType.Clickhouse]: iconClickHouse,
    [ConnectorType.ChBillingAnalytics]: iconCHBA,
    [ConnectorType.ChFrozenBumpyRoads]: iconClickHouse,
    [ConnectorType.ChFrozenCovid]: iconClickHouse,
    [ConnectorType.ChFrozenDemo]: iconClickHouse,
    [ConnectorType.ChFrozenDtp]: iconClickHouse,
    [ConnectorType.ChFrozenGkh]: iconClickHouse,
    [ConnectorType.ChFrozenHoreca]: iconClickHouse,
    [ConnectorType.ChFrozenSamples]: iconClickHouse,
    [ConnectorType.ChFrozenTransparency]: iconClickHouse,
    [ConnectorType.ChFrozenWeather]: iconClickHouse,
    [ConnectorType.ChGeoFiltered]: iconChGeoFilterd,
    [ConnectorType.ChOverYt]: iconCHYT,
    [ConnectorType.ChOverYtUserAuth]: iconCHYTUser,
    [ConnectorType.Chyt]: iconChytYC,
    [ConnectorType.ChytNb]: iconChytYC,
    [ConnectorType.ChytNb_v2]: iconChytYC,
    [ConnectorType.Chydb]: iconCHYDB,
    [ConnectorType.Ydb]: iconYDB,
    [ConnectorType.Yq]: iconYQ,
    [ConnectorType.ChYaMusicPodcastStats]: iconYaMusicPodcast,
    [ConnectorType.Gsheets]: iconGoogleSheets,
    [ConnectorType.GsheetsV2]: iconGoogleSheets,
    [ConnectorType.Greenplum]: iconGreenplum,
    [ConnectorType.Moysklad]: iconMoySklad,
    [ConnectorType.Promql]: iconPrometheus,
    [ConnectorType.Monitoring]: iconMonitoring,
    [ConnectorType.MonitoringExt]: iconMonitoring,
    [ConnectorType.KpInterestIndex]: iconKpIndex,
    [ConnectorType.Bitrix]: iconBitrix,
    [ConnectorType.Bitrix24]: iconBitrix,
    [ConnectorType.SchoolbookJournal]: iconSchoolbookJournal,
    [ConnectorType.File]: iconFile,
    [ConnectorType.SmbHeatmaps]: iconSmbHeatmaps,
    [ConnectorType.Bigquery]: iconBigQuery,
    [ConnectorType.UsageTrackingYT]: iconUsageTrackingYT,
    [ConnectorType.UsageAnalyticsDetailed]: iconUsageTrackingYCDetailed,
    [ConnectorType.UsageAnalyticsLight]: iconUsageTrackingYCLight,
    [ConnectorType.Snowflake]: iconSnowflake,
    [ConnectorType.Equeo]: iconEqueo,
    [ConnectorType.KonturMarket]: iconKonturMarket,
    [ConnectorType.Extractor1c]: iconExtractor1C,
    [ConnectorType.Yadocs]: iconYadocs,
    [ConnectorType.MonitoringV2]: iconMonitoring,
};

const entityTypeIcons: Record<string, string> = {
    script: 'editor',
    ...ENTRY_TYPES.ql.reduce((result, type) => {
        return {
            ...result,
            [type]: 'chart-ql',
        };
    }, {}),
    ...[...ENTRY_TYPES.legacyEditor, ...ENTRY_TYPES.editor].reduce((result, type) => {
        return {
            ...result,
            [type]: 'editor',
        };
    }, {}),
};

const getScopeTypeIcon = (scope: string) => {
    switch (scope) {
        case 'folder':
            return 'folder';
        case 'widget':
        case 'chart':
            return 'chart-wizard';
        case 'dataset':
            return 'dataset';
        case 'dashboard':
        case 'dash':
            return 'dashboard';
        case 'monitoring':
            return 'editor';
        default:
            return null;
    }
};

const folderIconSize = {
    s: 18,
    l: 22,
    xl: 28,
};

interface EntryData {
    scope: string;
    type?: string;
}

export const getEntryIconData = ({scope, type}: EntryData) => {
    let iconData;
    if (type) {
        let typeKey = type;
        if (scope === 'widget' && !Utils.isEnabledFeature(Feature.EntryMenuEditor)) {
            typeKey = '';
        }
        const icon = typeToIcon[typeKey];
        if (icon) {
            iconData = icon;
        }
    }
    return iconData;
};

const getEntityIconType = (
    {scope, type}: EntryData,
    className?: string,
    entityIconSize?: EntityIconSize,
) => {
    let iconType;
    if (type) {
        iconType = entityTypeIcons[type];
    }
    const entityIconType = iconType || getScopeTypeIcon(scope);
    if (entityIconType) {
        const iconSize =
            entityIconType === 'folder'
                ? folderIconSize[entityIconSize || 's']
                : defaultIconSize[entityIconSize || 's'];
        return (
            <EntityIcon
                type={entityIconType as EntityIconType}
                iconSize={iconSize}
                size={entityIconSize}
                classMixin={className}
            />
        );
    }
    return null;
};

interface EntryIconProps extends Partial<IconProps> {
    entry: EntryData;
    entityIconSize?: EntityIconSize;
}

export const EntryIcon: React.FC<EntryIconProps> = (props) => {
    const {entry, className, entityIconSize, ...restProps} = props;
    const iconData = getEntryIconData(entry);
    if (iconData) {
        return <Icon data={iconData} className={className} {...restProps} />;
    }
    return (
        getEntityIconType(entry, className, entityIconSize) || (
            <Icon data={iconFilesBroken} className={className} {...restProps} />
        )
    );
};
