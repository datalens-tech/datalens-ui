import React, {useState} from 'react';
import { TextInput, Button } from '@gravity-ui/uikit';

import block from 'bem-cn-lite';
import { I18n } from 'i18n';
import { opensourceEndpoints } from 'shared/endpoints/constants/opensource';
import {DataLensApiError} from 'ui';
import Utils from '../../../utils/utils';
import {useDispatch} from 'react-redux';

import {showToast} from 'store/actions/toaster';


const b = block('dl-collection-filters');
const AuthPage = ({setToken}) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const controlSize = 'm';

    function onAuth() {
        Utils.getAuthToken({login: login, password: password}).then((response)=> {
            if (response.data) {
                setToken(response.data.token);
            } else {
                dispatch(showToast({title: response?.err?.message, error: new Error(response?.err?.message), withReport: false}));
            }
        }).catch(error=>{
            dispatch(showToast({title: "Ошибка авторизации", error: new Error("Ошибка авторизации"), withReport: false}));
        });
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
        </div>
    </div>
}

export default AuthPage;