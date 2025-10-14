import http from 'http';
import https from 'https';

export const getAgents = ({family}: {family: 4 | 6}) => {
    return {
        httpAgent: new http.Agent({
            //@ts-ignore https://github.com/nodejs/node/blob/master/lib/_http_agent.js#L233
            family,
        }),
        httpsAgent: new https.Agent({
            //@ts-ignore https://github.com/nodejs/node/blob/master/lib/_http_agent.js#L233
            family,
        }),
    };
};
