import React, {useState} from 'react';
import { TextInput, Button } from '@gravity-ui/uikit';

import block from 'bem-cn-lite';
import { I18n } from 'i18n';
import { opensourceEndpoints } from 'shared/endpoints/constants/opensource';
import { response } from 'express';

const b = block('dl-collection-filters');


const AuthPage = ({setToken}) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const controlSize = 'm';

    const NODE_RPC_URL = opensourceEndpoints.development.api.rpc;
    const Execute = (url, options) => {
        return new Promise((resolve, reject) => {
            fetch(`${NODE_RPC_URL}/${url}`, {
                mode: 'cors',
                ...options
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(json => {
                            if (json.length >= 1) json = json[0];
                            if (json.meta) {
                                if (json.meta.success) resolve(json);
                                else {
                                    if (json.code === 401) logout();
                                    reject({
                                        status: json.code,
                                        msg: json.meta.msg
                                    });
                                }
                            } else resolve(json);
                        });
                    } else {
                        reject({
                            status: response.status,
                            msg: response.statusText
                        });
                    }
                })
                .catch(() => {
                    reject({
                        status: 500,
                        msg: 'Ошибка! Повторите попытку'
                    });
                });
        });
    }
    function onAuth() {
        Execute('auth', {
            method: 'POST',
            body: `UserName=${login}&Password=${password}`,
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).then(response=>{
            debugger;
            setToken("sda")
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