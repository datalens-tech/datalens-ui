import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';

import ConsoleGroup from './Group/Group';
import {Inspector} from './Inspector/Inspector';
import StackTrace from './StackTrace/StackTrace';
import {MAX_ARRAY_LENGTH} from './constants';
import {cropArrays} from './helpers';
import theme from './theme';

import './Console.scss';

const b = block('console-viewer');
const i18n = I18n.keyset('component.editor-console.view');

function PrintApiRunLogs({logs}) {
    if (!logs) {
        return null;
    }

    const engineLogs = JSON.parse(logs, (key, value) => {
        if (value === '__ee_special_value__NaN') {
            return NaN;
        }
        if (value === '__ee_special_value__Infinity') {
            return Infinity;
        }
        if (value === '__ee_special_value__-Infinity') {
            return -Infinity;
        }
        return value;
    });

    return Object.keys(engineLogs).map((logType) => {
        const typedLogs = engineLogs[logType];
        return (
            <React.Fragment key={logType}>
                {typedLogs.length ? (
                    <React.Fragment>
                        <ConsoleGroup name={logType}>
                            {typedLogs.map((log, i) => {
                                let cropped = false;
                                const logValues = log.map((logItem) => {
                                    const value = cropArrays(logItem.value);
                                    if (value.cropped) {
                                        cropped = true;
                                    }
                                    return value.result;
                                });
                                return (
                                    <React.Fragment key={i}>
                                        {cropped && (
                                            <div className={b('line', {warn: true})}>
                                                {i18n('label_max-length-array', {
                                                    length: MAX_ARRAY_LENGTH,
                                                })}
                                            </div>
                                        )}
                                        <div className={b('line')}>
                                            {logValues.map((value, j) => (
                                                <div className={b('line-item')} key={j}>
                                                    <Inspector theme={theme} data={value} />
                                                </div>
                                            ))}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </ConsoleGroup>
                    </React.Fragment>
                ) : null}
            </React.Fragment>
        );
    });
}

const Console = ({logsData}) => {
    const {stackTrace, logs} = logsData;

    return (
        <div className={b()}>
            <PrintApiRunLogs logs={logs} />
            <StackTrace stackTrace={stackTrace} />
        </div>
    );
};

Console.propTypes = {
    logsData: PropTypes.shape({
        logs: PropTypes.string,
        stackTrace: PropTypes.string,
    }),
};

export default React.memo(Console);
