#!/usr/bin/env node
'use strict';

const {readFileSync, writeFileSync, openSync} = require('fs');
const path = require('path');

const SECRETS_SECTION_START = '### TEMPLATE SECRETS BEGIN';
const SECRETS_SECTION_END = '### TEMPLATE SECRETS END';
const REPLACE_REGEXP = new RegExp(`^${SECRETS_SECTION_START}.*${SECRETS_SECTION_END}$`, 'ms', 's');

const installationName = process.env.SETUP_DEV_ENV_INSTALLATION;
const envName = process.env.ENV || 'development';
const templateName = `${installationName}/${envName}.env`;

const appPath = path.join(__dirname, '..');
const templateFilePath = path.join(appPath, `dev/env/${templateName}`);

const templateContent = readFileSync(templateFilePath).toString();
const secretsSection = `${SECRETS_SECTION_START}\n${templateContent}\n${SECRETS_SECTION_END}`;

let currentEnv;

try {
    currentEnv = readFileSync(path.join(appPath, '.env')).toString();
} catch (__) {
    openSync(path.join(appPath, '.env'), 'w');

    currentEnv = `${SECRETS_SECTION_START}\n${SECRETS_SECTION_END}`;
}

writeFileSync(path.join(appPath, '.env'), currentEnv.replace(REPLACE_REGEXP, secretsSection));
