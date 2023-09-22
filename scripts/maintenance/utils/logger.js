const fs = require('fs');

const MAINTENANCE_LOGS_DIR = process.env.MAINTENANCE_LOGS_DIR;
if (!MAINTENANCE_LOGS_DIR) {
    throw new Error('MAINTENANCE_LOGS_DIR directory path should be specified');
}

function getTimeNow() {
    const now = new Date().toISOString();
    return now.substring(11);
}

const now = new Date().toISOString();
const stream = fs.createWriteStream(
    `${MAINTENANCE_LOGS_DIR}/dc_${now.replace(/[-:]/g, '').replace(/\./g, '_')}.log`,
    {
        flags: 'a',
    },
);

function logger({type = 'info', message}) {
    switch (type) {
        case 'info':
            stream.write(`[INFO] -  ${getTimeNow()}: `);
            stream.write(message);
            break;
        case 'error':
            stream.write(`[ERROR] - ${getTimeNow()}: `);
            stream.write(String(message));
            break;
        default:
            stream.write(`[INFO] -  ${getTimeNow()}: `);
            stream.write(message);
    }
    stream.write('\n');
}

module.exports = {
    logger,
};
