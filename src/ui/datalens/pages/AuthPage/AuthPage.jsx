import React, {useState} from 'react';
import { TextInput, Button } from '@gravity-ui/uikit';

import block from 'bem-cn-lite';
import Utils from '../../../utils/utils';
import {useDispatch} from 'react-redux';

import {showToast} from 'store/actions/toaster';
import { DL } from 'ui/constants';


const b = block('dl-collection-filters');
const AuthPage = ({setToken}) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const controlSize = 'm';

    var oidc = DL.OIDC;
    var oidc_name = DL.OIDC_NAME;
    var oidc_base_url = DL.OIDC_BASE_URL;

    function onAuth() {
        Utils.getAuthToken({login: encodeURIComponent(login), password: encodeURIComponent(password)}).then((response)=> {
            if (response.data) {
                setToken(response.data.token);
            } else {
                dispatch(showToast({title: response?.err?.message, error: new Error(response?.err?.message), withReport: false}));
            }
        }).catch(error=>{
            dispatch(showToast({title: "Ошибка авторизации", error: new Error("Ошибка авторизации"), withReport: false}));
        });
    }

    function onOIDCAuth() {
        window.location.href = oidc_base_url;
    }

    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    }}>
        <div style={{ 
            display: 'flex',
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
                placeholder={"Логин"}
                hasClear
            />
            <TextInput
                type={"password"}
                value={password}
                size={controlSize}
                onUpdate={setPassword}
                placeholder={"Пароль"}
                hasClear
            />
            <Button view="outlined" onClick={onAuth}>
                Войти
            </Button>
            {oidc && (
                        <Button view="outlined" onClick={onOIDCAuth}>
                            {oidc_name}
                        </Button>
            )}
        </div>
    </div>
}

export default AuthPage;