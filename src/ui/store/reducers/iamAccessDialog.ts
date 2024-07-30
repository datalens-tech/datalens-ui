import type {
    SubjectClaims,
    SubjectDetails,
    GetClaimsResponse,
    ListCollectionAccessBindingsResponse,
    ListWorkbookAccessBindingsResponse,
    ListAccessBindingsResultItem,
} from '../../../shared/schema/extensions/types';
import {
    RESET_STATE,
    LIST_ACCESS_BINDINGS_LOADING,
    LIST_ACCESS_BINDINGS_SUCCESS,
    LIST_ACCESS_BINDINGS_FAILED,
    UPDATE_ACCESS_BINDINGS_LOADING,
    UPDATE_ACCESS_BINDINGS_SUCCESS,
    UPDATE_ACCESS_BINDINGS_FAILED,
    UPDATE_LIST_ACCESS_BINDINGS_INLINE,
    GET_COLLECTION_BREADCRUMBS_LOADING,
    GET_COLLECTION_BREADCRUMBS_SUCCESS,
    GET_COLLECTION_BREADCRUMBS_FAILED,
    GET_CLAIMS_LOADING,
    GET_CLAIMS_SUCCESS,
    GET_CLAIMS_FAILED,
    SUGGEST_BATCH_LIST_MEMBERS_LOADING,
    SUGGEST_BATCH_LIST_MEMBERS_SUCCESS,
    SUGGEST_BATCH_LIST_MEMBERS_FAILED,
} from '../constants/iamAccessDialog';
import type {IamAccessDialogAction} from '../actions/iamAccessDialog';
import type {
    GetDatalensOperationResponse,
    GetCollectionBreadcrumbsResponse,
} from '../../../shared/schema';

export type IamAccessDialogState = {
    listAccessBindings: {
        isLoading: boolean;
        data: ListCollectionAccessBindingsResponse | ListWorkbookAccessBindingsResponse | null;
        error: Error | null;
    };
    updateAccessBindings: {
        isLoading: boolean;
        data: GetDatalensOperationResponse | null;
        error: Error | null;
    };
    getCollectionBreadcrumbs: {
        isLoading: boolean;
        data: GetCollectionBreadcrumbsResponse | null;
        error: Error | null;
    };
    getClaims: {
        isLoading: boolean;
        data: GetClaimsResponse | null;
        error: Error | null;
    };
    itemsGetClaims: SubjectDetails[];
    itemsAccessBindings: ListAccessBindingsResultItem[];
    suggestBatchListMembers: {
        isLoading: boolean;
        data: SubjectClaims[] | null;
        error: Error | null;
    };
};

const initialState: IamAccessDialogState = {
    listAccessBindings: {
        isLoading: false,
        data: null,
        error: null,
    },
    itemsAccessBindings: [],
    itemsGetClaims: [],
    updateAccessBindings: {
        isLoading: false,
        data: null,
        error: null,
    },
    getCollectionBreadcrumbs: {
        isLoading: false,
        data: null,
        error: null,
    },
    getClaims: {
        isLoading: false,
        data: null,
        error: null,
    },
    suggestBatchListMembers: {
        isLoading: false,
        data: null,
        error: null,
    },
};

// eslint-disable-next-line complexity
export const iamAccessDialogReducer = (
    state: IamAccessDialogState = initialState,
    action: IamAccessDialogAction,
) => {
    switch (action.type) {
        case RESET_STATE: {
            return initialState;
        }

        case LIST_ACCESS_BINDINGS_LOADING: {
            return {
                ...state,
                listAccessBindings: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }

        case LIST_ACCESS_BINDINGS_SUCCESS: {
            const updatedListAccessBindings = state.itemsAccessBindings?.map((item) => {
                const updatedItem = {...item};

                action.data?.forEach((curItem) => {
                    if (curItem.resource.id === updatedItem.resource.id) {
                        updatedItem.response = {
                            ...curItem.response,
                            accessBindings: [
                                ...curItem.response.accessBindings,
                                ...updatedItem.response.accessBindings,
                            ],
                        };
                    }
                });

                return updatedItem;
            });

            return {
                ...state,
                listAccessBindings: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                itemsAccessBindings: updatedListAccessBindings?.length
                    ? updatedListAccessBindings
                    : action.data,
            };
        }

        case LIST_ACCESS_BINDINGS_FAILED: {
            return {
                ...state,
                listAccessBindings: {
                    ...state.listAccessBindings,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case UPDATE_LIST_ACCESS_BINDINGS_INLINE: {
            const updatedListAccessBindings = state.listAccessBindings.data?.map((item) => {
                const accessBinding = item;
                if (accessBinding.resource.id === action.data.resourceId) {
                    accessBinding.response.accessBindings =
                        accessBinding.response.accessBindings.map((res) => {
                            const response = res;

                            if (response.subject.id === action.data.subjectId) {
                                response.roleId = action.data.roleId;
                            }

                            return response;
                        });
                }

                return accessBinding;
            });

            return {
                ...state,
                listAccessBindings: {
                    ...state.listAccessBindings,
                    data: updatedListAccessBindings,
                },
            };
        }

        case UPDATE_ACCESS_BINDINGS_LOADING: {
            return {
                ...state,
                updateAccessBindings: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case UPDATE_ACCESS_BINDINGS_SUCCESS: {
            return {
                ...state,
                updateAccessBindings: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case UPDATE_ACCESS_BINDINGS_FAILED: {
            return {
                ...state,
                updateAccessBindings: {
                    ...state.updateAccessBindings,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case GET_COLLECTION_BREADCRUMBS_LOADING: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_BREADCRUMBS_SUCCESS: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case GET_COLLECTION_BREADCRUMBS_FAILED: {
            return {
                ...state,
                getCollectionBreadcrumbs: {
                    ...state.getCollectionBreadcrumbs,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case GET_CLAIMS_LOADING: {
            return {
                ...state,
                getClaims: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case GET_CLAIMS_SUCCESS: {
            const itemsGetClaimsIds = state.itemsGetClaims.map((item) => item.subjectClaims.sub);
            const newItemsGetClaims: SubjectDetails[] = [];

            action.data.subjectDetails.forEach((item) => {
                if (!itemsGetClaimsIds.includes(item.subjectClaims.sub)) {
                    newItemsGetClaims.push(item);
                }
            });

            return {
                ...state,
                getClaims: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
                itemsGetClaims: [...state.itemsGetClaims, ...newItemsGetClaims],
            };
        }
        case GET_CLAIMS_FAILED: {
            return {
                ...state,
                getClaims: {
                    ...state.getClaims,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        case SUGGEST_BATCH_LIST_MEMBERS_LOADING: {
            return {
                ...state,
                suggestBatchListMembers: {
                    isLoading: true,
                    data: null,
                    error: null,
                },
            };
        }
        case SUGGEST_BATCH_LIST_MEMBERS_SUCCESS: {
            return {
                ...state,
                suggestBatchListMembers: {
                    isLoading: false,
                    data: action.data,
                    error: null,
                },
            };
        }
        case SUGGEST_BATCH_LIST_MEMBERS_FAILED: {
            return {
                ...state,
                suggestBatchListMembers: {
                    ...state.suggestBatchListMembers,
                    isLoading: false,
                    error: action.error,
                },
            };
        }

        default: {
            return state;
        }
    }
};
