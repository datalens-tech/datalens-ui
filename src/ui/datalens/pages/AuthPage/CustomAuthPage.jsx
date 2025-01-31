import React, {useState} from 'react';
import { TextInput, Button } from '@gravity-ui/uikit';

import block from 'bem-cn-lite';
import Utils from '../../../utils/utils';
import {useDispatch} from 'react-redux';

import {showToast} from 'store/actions/toaster';
import { DL } from 'ui/constants';
import {I18n} from 'i18n';

const i18n = I18n.keyset('pages.auth');

const b = block('dl-collection-filters');
const CustomAuthPage = ({setToken}) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const controlSize = 'm';

    var oidc = DL.OIDC;
    var oidc_name = DL.OIDC_NAME;
    var oidc_base_url = DL.OIDC_BASE_URL;

    var oidc_2 = DL.OIDC_2;
    var oidc_name_2 = DL.OIDC_NAME_2;
    var oidc_base_url_2 = DL.OIDC_BASE_URL_2;

    var oidc_3 = DL.OIDC_3;
    var oidc_name_3 = DL.OIDC_NAME_3;
    var oidc_base_url_3 = DL.OIDC_BASE_URL_3;

    var oidc_4 = DL.OIDC_4;
    var oidc_name_4 = DL.OIDC_NAME_4;
    var oidc_base_url_4 = DL.OIDC_BASE_URL_4;

    function onAuth() {
        Utils.getAuthToken({login: encodeURIComponent(login), password: encodeURIComponent(password)}).then((response)=> {
            if (response.data) {
                setToken(response.data.token);
            } else {
                dispatch(showToast({title: response?.err?.message, error: new Error(response?.err?.message), withReport: false}));
            }
        }).catch(error=>{
            dispatch(showToast({title: i18n('error_auth_message'), error: new Error(i18n('error_auth_message')), withReport: false}));
        });
    }

    function onOIDCAuth() {
        window.location.href = oidc_base_url;
    }

    function onOIDC2Auth() {
        window.location.href = oidc_base_url_2;
    }

    function onOIDC3Auth() {
        window.location.href = oidc_base_url_3;
    }

    function onOIDC4Auth() {
        window.location.href = oidc_base_url_4;
    }

    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    }}>
        <div style={{ 
            displayAuthPage: 'flex',
            gap: '6px',
            flexDirection: 'column',
            minWidth: '240px',
            maxWidth: '400px',
            margin: 'auto',
            padding: '12px',
            border: 'solid #e5e5e5 1px',
            borderRadius: '6px',
        }}>
            <TextInput
                value={login}
                size={controlSize}
                onUpdate={setLogin}
                placeholder={i18n('label_login')}
                hasClear
            />
            <TextInput
                type={"password"}
                value={password}
                size={controlSize}
                onUpdate={setPassword}
                placeholder={i18n('label_password')}
                hasClear
            />
            <Button view="outlined" onClick={onAuth}>
            {i18n('label_enter')}
            </Button>
            {(oidc || oidc_2 || oidc_3 || oidc_4) && (
                 <div style={{textAlign:'center'}}><b>{i18n("description")}</b></div>
            )}
            {oidc && (<Button view="outlined" onClick={onOIDCAuth}>
                            {i18n('label_oidc', {oidcName: oidc_name})}
                        </Button>
            )}
            {oidc_2 && (<Button view="outlined" onClick={onOIDC2Auth}>
                            {i18n('label_oidc', {oidcName: oidc_name_2})}
                        </Button>
            )}
            {oidc_3 && (<Button view="outlined" onClick={onOIDC3Auth}>
                            {i18n('label_oidc', {oidcName: oidc_name_3})}
                        </Button>
            )}
            {oidc_4 && (<Button view="outlined" onClick={onOIDC4Auth}>
                            {i18n('label_oidc', {oidcName: oidc_name_4})}
                        </Button>
            )}
        </div>
    </div>
}

export default CustomAuthPage;