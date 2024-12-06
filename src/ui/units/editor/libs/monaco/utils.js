import inRange from 'lodash/inRange';

import {DL, URL_QUERY} from '../../../../constants';
import {getSdk} from '../../../../libs/schematic-sdk';
import {UrlSearch} from '../../../../utils';
import {DEFAULT_TAB_ID, EVENT_DRAW_PREVIEW, UNRELEASED_MODULE_MARK} from '../../constants/common';
import {copyTextToClipboard} from '../../utils/utils';

import {getTypes} from './types/types';

const LINE_SEPARATOR = '-';

/* eslint-disable no-bitwise*/
export class MonacoUtils {
    static getRequire(editor, position) {
        const WORD = 'require';
        const {lineNumber, column} = position || editor.getPosition();
        const lineContent = editor.getModel().getLineContent(lineNumber);
        if (!lineContent.includes(WORD)) {
            return null;
        }
        const re = /require\([^)]{3,}\)/g;
        const found = (() => {
            let execResult;
            while ((execResult = re.exec(lineContent)) !== null) {
                const index = execResult.index;
                const substing = execResult[0];
                if (inRange(column - 1, index, index + substing.length)) {
                    return substing;
                }
            }
            return null;
        })();
        if (!found) {
            return null;
        }
        let key = found.slice(WORD.length + 2, -2);
        if (key.endsWith(UNRELEASED_MODULE_MARK)) {
            key = key.slice(0, -UNRELEASED_MODULE_MARK.length);
        }
        return {origin: found, key};
    }

    static highlightLines(editor, monaco, id) {
        const urlSearch = new UrlSearch(window.location.search);
        const linesQuery = urlSearch.get(URL_QUERY.HIGHLIGHT_LINES);
        const tab = urlSearch.getNormalized(URL_QUERY.ACTIVE_TAB) || DEFAULT_TAB_ID;
        if (linesQuery && tab === id) {
            let lines = linesQuery.includes(LINE_SEPARATOR)
                ? linesQuery.split(LINE_SEPARATOR)
                : [linesQuery, linesQuery];
            lines = lines.map((l) => Number(l));
            editor.deltaDecorations(
                [],
                [
                    {
                        range: new monaco.Range(lines[0], 1, lines[1], 1),
                        options: {
                            isWholeLine: true,
                            className: 'js-highlight-line',
                        },
                    },
                ],
            );
            editor.revealLineInCenter(lines[0]);
        }
    }

    static highlighRange(editor, monaco, range, oldDecorations = []) {
        let decorations;
        if (range) {
            const monacoRange = new monaco.Range(...range);
            decorations = editor.deltaDecorations(oldDecorations, [
                {
                    range: monacoRange,
                    options: {
                        className: 'js-highlight-decoration',
                    },
                },
            ]);
            editor.revealRangeInCenter(monacoRange);
        } else {
            decorations = editor.deltaDecorations(oldDecorations, []);
        }
        return decorations;
    }

    static makeTabUrl(editor, id, getRevId) {
        const url = new URL(window.location.href);
        const {startLineNumber, endLineNumber} = editor.getSelection();
        url.searchParams.set(URL_QUERY.ACTIVE_TAB, id);
        url.searchParams.set(
            URL_QUERY.HIGHLIGHT_LINES,
            `${startLineNumber}${LINE_SEPARATOR}${endLineNumber}`,
        );
        const revId = getRevId();
        if (revId) {
            url.searchParams.set(URL_QUERY.REV_ID_OLD, revId);
        }
        copyTextToClipboard(url.href);
    }

    static addActionMakeTabUrl(editor, monaco, id, getRevId) {
        editor.addAction({
            id: 'copy-tab-link',
            label: 'Copy Tab Link',
            precondition: null,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KEY_T],
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run() {
                MonacoUtils.makeTabUrl(editor, id, getRevId);
                return null;
            },
        });
    }

    static addModuleClickAction(editor, onModuleClick) {
        editor.onMouseDown(async ({event, target}) => {
            const matchRequire = MonacoUtils.getRequire(editor, target.position);
            if (matchRequire && (event.metaKey || event.ctrlKey)) {
                if (event.altKey) {
                    onModuleClick(matchRequire);
                } else {
                    try {
                        // fix module resolve without navigation service
                        const {entryId} = await getSdk().us.getEntryByKey({key: matchRequire.key});
                        window.open(`/editor/${entryId}`, '_blank');
                    } catch (error) {
                        window.open(`${DL.ENDPOINTS.charts}/editor/${matchRequire.key}`, '_blank');
                    }
                }
            }
        });
    }

    static addKeybinds(editor, monaco) {
        // CtrlCmd Enter redrawing the chart
        // Previously, I had to disable the standard combination in monaco, since the event did not pop up
        //  https://github.com/microsoft/monaco-editor/issues/287#issuecomment-521166743
        // editor._standaloneKeybindingService.addDynamicKeybinding('-editor.action.insertLineAfter')
        // but in the version monaco@0.21.3 this causes errors in the console
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            window.dispatchEvent(
                new CustomEvent(EVENT_DRAW_PREVIEW, {
                    bubbles: true,
                }),
            );
        });
    }

    static addTypes(editor, monaco, id, language) {
        return monaco.languages.typescript.javascriptDefaults.addExtraLib(
            getTypes({language, tab: id}),
        );
    }

    static setDefaults(monaco) {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            ...monaco.languages.typescript.javascriptDefaults.getDiagnosticsOptions(),
            diagnosticCodesToIgnore: [80001], // disable convert CommonJS module to ES6
        });
    }
}
