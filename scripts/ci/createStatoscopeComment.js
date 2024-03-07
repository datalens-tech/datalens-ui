const fs = require('fs');

const lodashTemplate = require('lodash/template');

const createPRComment = require('./createPRComment');

const template = fs.readFileSync('./scripts/ci/statoscope-comment.tmpl', 'utf8');
const compiledTemplate = lodashTemplate(template);

module.exports = async ({github, context, core, downloadLink}) => {
    const data = JSON.parse(fs.readFileSync('result.json', 'utf8'));
    data.downloadLink = downloadLink;
    const body = compiledTemplate(data);

    await createPRComment({github, context, core, body});
};
