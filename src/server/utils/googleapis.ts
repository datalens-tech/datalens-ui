import https from 'https';

// eslint-disable-next-line import/no-extraneous-dependencies
import {GaxiosOptions} from 'gaxios';
// eslint-disable-next-line import/no-extraneous-dependencies
import {DefaultTransporter} from 'google-auth-library';

export class Ipv6Transporter extends DefaultTransporter {
    configure(opts?: GaxiosOptions): GaxiosOptions {
        const options = super.configure(opts);
        options.agent = new https.Agent({
            //@ts-ignore https://github.com/nodejs/node/blob/master/lib/_http_agent.js#L233
            family: 6,
        });
        return options;
    }
}
