import {IconData} from '@gravity-ui/uikit';
import {ConnectorType} from 'shared';

import {ConnectorAlias} from '../../constants';

import iconAppMetrica from '../../assets/icons/connections/appmetrica.svg';
import iconBigQuery from '../../assets/icons/connections/bigquery.svg';
import iconBitrix from '../../assets/icons/connections/bitrix.svg';
import iconCHBA from '../../assets/icons/connections/ch-ba.svg';
import iconChGeoFiltered from '../../assets/icons/connections/ch-geo-filtered.svg';
import iconChOverYt from '../../assets/icons/connections/choveryt.svg';
import iconCHYDB from '../../assets/icons/connections/chydb.svg';
import iconChOverYtToken from '../../assets/icons/connections/chyt-token-auth.svg';
import iconChOverYtUser from '../../assets/icons/connections/chyt-user-auth.svg';
import iconChytYC from '../../assets/icons/connections/chyt-yc.svg';
import iconClickHouse from '../../assets/icons/connections/clickhouse.svg';
import iconCsv from '../../assets/icons/connections/csv.svg';
import iconEqueo from '../../assets/icons/connections/equeo.svg';
import iconExtractor1C from '../../assets/icons/connections/extractor1c.svg';
import iconFile from '../../assets/icons/connections/file.svg';
import iconGoogleSheets from '../../assets/icons/connections/google-sheets.svg';
import iconGreenplum from '../../assets/icons/connections/greenplum.svg';
import iconKonturMarket from '../../assets/icons/connections/kontur-market.svg';
import iconKpIndex from '../../assets/icons/connections/kp-index.svg';
import iconMetrica from '../../assets/icons/connections/metrica.svg';
import iconMonitoring from '../../assets/icons/connections/monitoring.svg';
import iconMoySclad from '../../assets/icons/connections/moysklad.svg';
import iconMssql from '../../assets/icons/connections/mssql.svg';
import iconMysql from '../../assets/icons/connections/mysql.svg';
import iconOracle from '../../assets/icons/connections/oracle.svg';
import iconPostgres from '../../assets/icons/connections/postgres.svg';
import iconPromql from '../../assets/icons/connections/prometheus.svg';
import iconSchoolbookJournal from '../../assets/icons/connections/schoolbook-journal.svg';
import iconSmbHeatmaps from '../../assets/icons/connections/smb-heatmaps.svg';
import iconSnowflake from '../../assets/icons/connections/snowflake.svg';
import iconUndefined from '../../assets/icons/connections/undefined.svg';
import iconUsageTrackingYCDetailed from '../../assets/icons/connections/utyc-detailed.svg';
import iconUsageTrackingYCLight from '../../assets/icons/connections/utyc-light.svg';
import iconUsageTrackingYT from '../../assets/icons/connections/utyt.svg';
import iconYaMusicPodcast from '../../assets/icons/connections/ya-music-podcast.svg';
import iconYadocs from '../../assets/icons/connections/yadocs.svg';
import iconYDB from '../../assets/icons/connections/ydb.svg';
import iconYQ from '../../assets/icons/connections/yq.svg';
import iconYt from '../../assets/icons/connections/yt.svg';

// eslint-disable-next-line complexity
export const getConnectorIconDataWithoutDefault = (type?: string): IconData | undefined => {
    switch (type) {
        case ConnectorType.Clickhouse:
        case ConnectorType.ChFrozenBumpyRoads:
        case ConnectorType.ChFrozenCovid:
        case ConnectorType.ChFrozenDemo:
        case ConnectorType.ChFrozenDtp:
        case ConnectorType.ChFrozenGkh:
        case ConnectorType.ChFrozenHoreca:
        case ConnectorType.ChFrozenSamples:
        case ConnectorType.ChFrozenTransparency:
        case ConnectorType.ChFrozenWeather:
            return iconClickHouse;
        case ConnectorType.ChBillingAnalytics:
            return iconCHBA;
        case ConnectorType.ChGeoFiltered:
            return iconChGeoFiltered;
        case ConnectorAlias.CHYT:
            return iconChOverYt;
        case ConnectorType.ChOverYt:
            return iconChOverYtToken;
        case ConnectorType.ChOverYtUserAuth:
            return iconChOverYtUser;
        case ConnectorType.Chyt:
        case ConnectorType.ChytNb:
        case ConnectorType.ChytNb_v2:
            return iconChytYC;
        case ConnectorType.Csv:
            return iconCsv;
        case ConnectorType.Postgres:
            return iconPostgres;
        case ConnectorType.Greenplum:
            return iconGreenplum;
        case ConnectorType.Mysql:
            return iconMysql;
        case ConnectorType.Mssql:
            return iconMssql;
        case ConnectorType.Oracle:
            return iconOracle;
        case ConnectorType.Yt:
            return iconYt;
        case ConnectorType.MetrikaApi:
            return iconMetrica;
        case ConnectorType.AppMetrica:
            return iconAppMetrica;
        case ConnectorType.Chydb:
            return iconCHYDB;
        case ConnectorType.Ydb:
            return iconYDB;
        case ConnectorType.Yq:
            return iconYQ;
        case ConnectorType.ChYaMusicPodcastStats:
            return iconYaMusicPodcast;
        case ConnectorType.Gsheets:
            return iconGoogleSheets;
        case ConnectorType.GsheetsV2:
            return iconGoogleSheets;
        case ConnectorType.Moysklad:
            return iconMoySclad;
        case ConnectorType.Promql:
            return iconPromql;
        case ConnectorType.Monitoring:
        case ConnectorType.MonitoringExt:
        case ConnectorType.MonitoringV2:
            return iconMonitoring;
        case ConnectorType.Bitrix:
        case ConnectorType.Bitrix24:
            return iconBitrix;
        case ConnectorType.KpInterestIndex:
            return iconKpIndex;
        case ConnectorType.SchoolbookJournal:
            return iconSchoolbookJournal;
        case ConnectorType.File:
            return iconFile;
        case ConnectorType.SmbHeatmaps:
            return iconSmbHeatmaps;
        case ConnectorType.Bigquery:
            return iconBigQuery;
        case ConnectorType.UsageTrackingYT:
            return iconUsageTrackingYT;
        case ConnectorType.UsageAnalyticsDetailed:
            return iconUsageTrackingYCDetailed;
        case ConnectorType.UsageAnalyticsLight:
            return iconUsageTrackingYCLight;
        case ConnectorType.Snowflake:
            return iconSnowflake;
        case ConnectorType.Equeo:
            return iconEqueo;
        case ConnectorType.KonturMarket:
            return iconKonturMarket;
        case ConnectorType.Extractor1c:
            return iconExtractor1C;
        case ConnectorType.Yadocs:
            return iconYadocs;
        default:
            return undefined;
    }
};

export const getConnectorIconData = (type: string): IconData => {
    return getConnectorIconDataWithoutDefault(type) || iconUndefined;
};
