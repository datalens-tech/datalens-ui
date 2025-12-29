import React from 'react';

import {Link, List, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import SplitPane from 'react-split-pane';
import {DocSectionQa} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import type {
    DataLensFunctionsDocGroupTocItem,
    DocsTocItemLastLevel,
} from 'ui/registry/units/common/types/functions/getFunctionsDocumentation';
import {formDocsEndpointDL} from 'ui/utils/docs';

import {I18n} from '../../../../i18n';
import {DL, SPLIT_PANE_RESIZER_CLASSNAME} from '../../../constants';
import logger from '../../../libs/logger';
import type SDK from '../../../libs/sdk';
import {registry} from '../../../registry';
import {YfmWrapper} from '../../YfmWrapper/YfmWrapper';
import {LEFT_PANE_MAX_WIDTH, LEFT_PANE_MIN_WIDTH} from '../constants';

import {fetchFunctionsDocumentation, getFunctionsDocumentation} from './helpers';

interface DocSectionProps {
    sdk: SDK;
}

interface FunctionsGroupDocListItem extends DataLensFunctionsDocGroupTocItem {
    opened: boolean;
    items: FunctionDocListItem[];
}

interface FunctionDocListItem extends DocsTocItemLastLevel {
    selected: boolean;
}

interface DocSectionState {
    groupedFunctions: FunctionsGroupDocListItem[];
    docItems: DocItem[];
    filter: string;
    functionDoc: {html: string} | null;
    functionLoading: boolean;
    allFunctionsLoading: boolean;
    selectedItem?: FunctionDocListItem;
}

type DocItem = FunctionsGroupDocListItem | FunctionDocListItem;

type UpdateEvent = 'init' | 'click' | 'filter';

const b = block('dl-field-editor');
const i18n = I18n.keyset('component.dl-field-editor.view');
const ITEM_HEIGHT = 28;

const EmptyState: React.FC = () => {
    const isExternalLink = DL.ENDPOINTS.public;

    const docsUrl = formDocsEndpointDL('/concepts/calculations/formula-syntax');

    return (
        <PlaceholderIllustration
            className={b('empty-state')}
            name={'template'}
            title={i18n('label_doc-formula-is-empty')}
            description={
                <div>
                    <div>
                        <Link target="_blank" href={docsUrl}>
                            {i18n('label_doc-formula-is-empty-description-syntax-link')}
                        </Link>
                    </div>
                    {isExternalLink && (
                        <div>
                            <Link target="_blank" href={`${isExternalLink}/9fms9uae7ip02?tab=87P`}>
                                {i18n('label_doc-formula-is-empty-description-examples-link')}
                            </Link>
                        </div>
                    )}
                </div>
            }
        />
    );
};

class DocSection extends React.Component<DocSectionProps, DocSectionState> {
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: DocSectionProps) {
        super(props);

        this.ref = React.createRef();

        this.state = {
            groupedFunctions: [],
            docItems: [],
            filter: '',
            functionDoc: null,
            functionLoading: false,
            allFunctionsLoading: false,
            selectedItem: undefined,
        };
    }

    async componentDidMount() {
        this.fetchAllFunctions();
    }

    render() {
        const {
            filter,
            functionDoc,
            docItems,
            groupedFunctions,
            selectedItem,
            functionLoading,
            allFunctionsLoading,
        } = this.state;

        return (
            <div ref={this.ref} className={b('doc')}>
                {allFunctionsLoading ? (
                    <div className={b('doc-loader')}>
                        <Loader size="m" />
                    </div>
                ) : (
                    <SplitPane
                        resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                        split={'vertical'}
                        defaultSize={LEFT_PANE_MIN_WIDTH}
                        minSize={LEFT_PANE_MIN_WIDTH}
                        maxSize={LEFT_PANE_MAX_WIDTH}
                        pane2Style={{
                            overflowY: 'auto',
                            backgroundColor: 'var(--g-color-base-generic-ultralight)',
                        }}
                    >
                        <div className={b('doc-list')}>
                            <List
                                items={docItems}
                                itemHeight={ITEM_HEIGHT}
                                filter={filter}
                                filterPlaceholder={i18n('label_doc-list-placeholder')}
                                renderItem={this.renderList}
                                onItemClick={this.onDocItemClick}
                                onFilterUpdate={(newFilter: string) => {
                                    this.setState({
                                        filter: newFilter,
                                        docItems: this.getDocItems(
                                            newFilter,
                                            groupedFunctions,
                                            'filter',
                                        ),
                                    });
                                }}
                            />
                        </div>
                        <div className={b('doc-item-wrap')}>
                            {functionLoading ? (
                                <div className={b('doc-loader')}>
                                    <Loader size="m" />
                                </div>
                            ) : (
                                <React.Fragment>
                                    {selectedItem ? (
                                        <React.Fragment>
                                            <div
                                                className={b('doc-item-title')}
                                                data-qa={DocSectionQa.Title}
                                            >
                                                {selectedItem?.name}
                                            </div>
                                            <YfmWrapper
                                                className={b('doc-item')}
                                                setByInnerHtml={true}
                                                content={functionDoc?.html || ''}
                                                noMagicLinks={true}
                                            />
                                        </React.Fragment>
                                    ) : (
                                        <EmptyState />
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    </SplitPane>
                )}
            </div>
        );
    }

    renderList(item: DocItem) {
        const isGroup = Boolean((item as FunctionsGroupDocListItem).items);

        const mods = {
            group: isGroup,
            function: !isGroup,
            selected: Boolean((item as FunctionDocListItem).selected),
        };

        const qa = isGroup ? DocSectionQa.Group : DocSectionQa.Item;

        return (
            <div id={item.id} className={b('doc-list-item', mods)} data-qa={qa}>
                {item.name}
            </div>
        );
    }

    fetchAllFunctions = async () => {
        const {filter} = this.state;

        this.setState({allFunctionsLoading: true});

        try {
            const result = await getFunctionsDocumentation();
            const groupedFunctions = this.getGroupedFunctions(result);

            this.setState({
                groupedFunctions,
                docItems: this.getDocItems(filter, groupedFunctions, 'init'),
                allFunctionsLoading: false,
            });
        } catch (error) {
            logger.logError('DocSection: doc functions list failed', error);
            this.setState({allFunctionsLoading: false});
        }
    };

    fetchFunctionDoc = async (item: FunctionDocListItem) => {
        const {datalensDocs} = DL.ENDPOINTS;

        this.setState({functionLoading: true});

        try {
            const {href} = item;

            const {getFieldEditorDocPath} = registry.docs.functions.getAll();
            const path = getFieldEditorDocPath(href);

            const functionDoc = await fetchFunctionsDocumentation(datalensDocs, path);

            this.setState({
                functionDoc,
                functionLoading: false,
            });
        } catch (error) {
            logger.logError('DocSection: function doc failed', error);
            this.setState({functionLoading: false});
        }
    };

    getListContainer = (): HTMLDivElement | null => {
        if (!this.ref.current) {
            return null;
        }

        return this.ref.current.querySelector(
            '.g-list__items > div:first-of-type > div:first-of-type',
        );
    };

    /* The List component does not give out any control capabilities to
    scroll list of elements, so you have to pull out the container
    and scroll it manually. setTimeout is needed to make a scroll event
    guaranteed to work after the appearance of new items of the list in the dom */
    scrollItemToTop = (index: number) => {
        setTimeout(() => {
            this.getListContainer()?.scrollTo({
                left: 0,
                top: ITEM_HEIGHT * index,
                behavior: 'smooth',
            });
        }, 0);
    };

    getGroupedFunctions(
        functions: DataLensFunctionsDocGroupTocItem[],
    ): FunctionsGroupDocListItem[] {
        return functions.map((group) => {
            const extendedItems: FunctionDocListItem[] = group.items
                .filter(this.checkFunctionHref)
                .map((item: DocsTocItemLastLevel) => {
                    return {
                        ...item,
                        selected: false,
                    };
                });

            const extendedGroup: FunctionsGroupDocListItem = {
                ...group,
                items: extendedItems,
                opened: false,
            };

            return extendedGroup;
        });
    }

    getDocItems(
        filter: string,
        groupedFunctions: FunctionsGroupDocListItem[],
        updeteEvent: UpdateEvent,
    ): DocItem[] {
        return groupedFunctions.reduce((acc: DocItem[], group: FunctionsGroupDocListItem) => {
            if (filter) {
                const filterInLowerCase = filter.toLowerCase();
                const filteredItems = group.items.filter(({name}) => {
                    return name.toLowerCase().indexOf(filterInLowerCase) !== -1;
                });

                if (filteredItems.length && updeteEvent === 'click' && !group.opened) {
                    acc.push(group);
                } else if (filteredItems.length) {
                    group.opened = true;
                    acc.push(group, ...filteredItems);
                }

                return acc;
            }

            if (updeteEvent === 'filter') {
                group.opened = false;
            }

            acc.push(group);

            if (group.opened) {
                group.items.forEach((item) => {
                    acc.push(item);
                });
            }

            return acc;
        }, []);
    }

    checkFunctionHref({href}: DocsTocItemLastLevel) {
        return !/-functions$/.test(href);
    }

    onGroupDocItemClick = (groupItem: FunctionsGroupDocListItem, index: number) => {
        const {filter, groupedFunctions} = this.state;
        const nextGroupedFunctions = [...groupedFunctions];
        const updatedItemIndex = nextGroupedFunctions.findIndex(({id}) => id === groupItem.id);
        const isOpening = !groupItem.opened;

        if (updatedItemIndex === -1) {
            return;
        }

        nextGroupedFunctions[updatedItemIndex].opened = !groupItem.opened;

        this.setState(
            {
                groupedFunctions: nextGroupedFunctions,
                docItems: this.getDocItems(filter, nextGroupedFunctions, 'click'),
            },
            () => {
                if (isOpening) {
                    this.scrollItemToTop(index);
                }
            },
        );
    };

    onFunctionDocItemClick = (item: FunctionDocListItem) => {
        const {filter, groupedFunctions} = this.state;
        const nextGroupedFunctions = [...groupedFunctions];

        let selectedItem: DocSectionState['selectedItem'];

        nextGroupedFunctions.forEach((group) => {
            group.items.forEach((func) => {
                func.selected = false;
            });
        });

        const updatedGroupItemIndex = nextGroupedFunctions.findIndex((group) => {
            const index = group.items.findIndex(({id}) => id === item.id);

            if (index !== -1) {
                selectedItem = group.items[index];
                group.items[index].selected = true;
            }

            return index !== -1;
        });

        if (updatedGroupItemIndex !== -1 && selectedItem?.id !== this.state.selectedItem?.id) {
            this.fetchFunctionDoc(item);

            this.setState({
                selectedItem,
                groupedFunctions: nextGroupedFunctions,
                docItems: this.getDocItems(filter, nextGroupedFunctions, 'click'),
            });
        }
    };

    onDocItemClick = (item: DocItem, index: number) => {
        if ((item as FunctionsGroupDocListItem).items) {
            this.onGroupDocItemClick(item as FunctionsGroupDocListItem, index);

            return;
        }

        this.onFunctionDocItemClick(item as FunctionDocListItem);
    };
}

export default DocSection;
