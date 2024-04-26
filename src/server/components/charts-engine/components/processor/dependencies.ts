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
