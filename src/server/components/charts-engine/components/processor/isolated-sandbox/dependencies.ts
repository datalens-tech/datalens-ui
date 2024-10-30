import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import {isObject, isString} from 'lodash';

import type {ChartsEngine} from '../../..';
import type {WorkbookId} from '../../../../../../shared';
import {resolveConfig as storageResolveConfig} from '../../storage';
import type {ResolvedConfig} from '../../storage/types';

export const extractDependencies = ({code}: {code: string}) => {
    // eslint-disable-next-line security/detect-unsafe-regex
    const REQUIRE_REGEXP = /require\(["']([\w. &/_@-]+)["']\)(\.\w+)*;?\s*$/gm;

    // eslint-disable-next-line security/detect-unsafe-regex
    const codeWOComments = code.replace(/((?:\/\*(?:[^*]|(?:\*+[^*/]))*\*+\/)|(?:\/\/.*))/g, '');

    const modules: string[] = [];
    let match;
    while ((match = REQUIRE_REGEXP.exec(codeWOComments)) !== null) {
        modules.push(match[1].toLowerCase());
    }

    return modules;
};

export class DepsResolveError extends Error {
    description?: string;
}

export const resolveDependencies = async ({
    chartsEngine,
    config,
    subrequestHeaders,
    req,
    ctx,
    workbookId,
}: {
    chartsEngine: ChartsEngine;
    subrequestHeaders: Record<string, string>;
    config: {data: Record<string, string>; key: string};
    req: Request;
    ctx: AppContext;
    workbookId?: WorkbookId;
}): Promise<ResolvedConfig[]> => {
    const code = Object.keys(config.data).reduce((acc, tabName) => {
        return `${acc}\n${config.data[tabName]}`;
    }, '');

    const deps = extractDependencies({code});

    const modulesDeps: Record<string, string[]> = {};
    const fetchedModules: Record<string, ResolvedConfig> = {};

    async function resolveDeps(depsList: string[]): Promise<ResolvedConfig[]> {
        const filteredDepsList = depsList.filter(
            (dep) => !Object.keys(chartsEngine.nativeModules).includes(dep),
        );

        const uniqDeps = Array.from(new Set(filteredDepsList.map((dep) => dep)));
        const depsPromises = uniqDeps.map(async (name) => {
            // eslint-disable-next-line prefer-const
            let [path, version] = name.split('@');

            const unreleased = version === 'saved';

            if (!/^\//.test(path)) {
                path = `/${path}`;
            }

            const resolvedConfig = await storageResolveConfig(ctx, {
                unreleased,
                headers: {...subrequestHeaders},
                key: path,
                requestId: req.id,
                workbookId, // for the future, when we will resolve deps by entryId
            });

            resolvedConfig.key = name;

            return resolvedConfig;
        });

        ctx.log('CE_RESOLVING_DEPS', {depsList});
        const resolvedModules = await Promise.all(depsPromises);

        const modulesToFetch = new Set<string>();
        resolvedModules.forEach((module) => {
            module.key = module.key.toLowerCase();
            const name = module.key;
            if (module.meta.stype !== 'module') {
                const errorText = `required script "${name}": is not a module`;
                const moduleTypeError = new DepsResolveError(errorText);
                moduleTypeError.description = errorText;

                throw moduleTypeError;
            }
            fetchedModules[name] = module;
            const moduleCode = isObject(module.data) && 'js' in module.data ? module.data.js : '';
            modulesDeps[name] = extractDependencies({
                code: isString(moduleCode) ? moduleCode : '',
            });
            modulesDeps[name].forEach((moduleName) => modulesToFetch.add(moduleName));
            ctx.log('CE_DEPS_EXTRACTED', {
                moduleName: name,
                deps: modulesDeps[name],
            });
        });

        modulesToFetch.forEach((name) => {
            if (fetchedModules[name]) {
                modulesToFetch.delete(name);
            }
        });
        const fetchList = Array.from(modulesToFetch);

        if (fetchList.length) {
            ctx.log('CE_FETCHING_MODULES', {modules: fetchList});
            return resolveDeps(fetchList);
        } else {
            ctx.log('CE_ALL_DEPS_RESOLVED');
            return Object.keys(fetchedModules).reduce<ResolvedConfig[]>((acc, moduleName) => {
                acc.push(fetchedModules[moduleName]);
                return acc;
            }, []);
        }
    }

    const resolvedModules = await resolveDeps(deps);
    ctx.log('CE_RESULTING_DEPS', {modulesDeps});

    // Check for circular dependency and setup execution order
    const levels: Record<string, number> = {};
    const inProgress = {[config.key]: true};

    if (!Object.keys(deps).length) {
        return [];
    }

    function getModuleLevel(name: string) {
        const moduleDeps = modulesDeps[name] || [];

        if (levels[name]) {
            return levels[name];
        } else if (inProgress[name] || moduleDeps.includes(name)) {
            const errorText = `cyclic dependencies in module "${name}"`;
            const depsResolveError = new DepsResolveError(errorText);
            depsResolveError.description = errorText;

            throw depsResolveError;
        } else {
            inProgress[name] = true;
            let maxLevel = 0;

            moduleDeps.forEach((depsName: string) => {
                const dependencyLevel = getModuleLevel(depsName);
                if (dependencyLevel >= maxLevel) {
                    maxLevel = dependencyLevel + 1;
                }
            });
            inProgress[name] = false;
            levels[name] = maxLevel;
            return levels[name];
        }
    }

    resolvedModules.forEach((module) => {
        if (!levels[module.key]) {
            levels[module.key] = getModuleLevel(module.key);
        }
    });

    return resolvedModules.sort((a, b) => levels[a.key] - levels[b.key]);
};
