import * as React from 'react';

import {Alert, Button, Flex, Text, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {InterpolatedText} from 'ui/components/InterpolatedText/InterpolatedText';
import {showToast} from 'ui/store/actions/toaster';
import {Email} from 'ui/units/auth/components/formControls/Email';
import {FirstName} from 'ui/units/auth/components/formControls/FirstName';
import {LastName} from 'ui/units/auth/components/formControls/LastName';
import {Login} from 'ui/units/auth/components/formControls/Login';
import {Password} from 'ui/units/auth/components/formControls/Password';
import {Roles} from 'ui/units/auth/components/formControls/Roles';
import {
    resetUserInfoForm,
    resetUserInfoFormValidation,
    validateFormValues,
} from 'ui/units/auth/store/actions/userInfoForm';
import {selectUserInfoFormValues} from 'ui/units/auth/store/selectors/userInfoForm';

import {createUser, resetCreateUser} from '../../store/actions/serviceSettings';
import {selecCreateUserIsLoading} from '../../store/selectors/serviceSettings';

const i18n = I18n.keyset('service-settings.create-user.view');

export const CreateUserForm = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation<{from: string | undefined}>();

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const userInfo = useSelector(selectUserInfoFormValues);

    const isLoading = useSelector(selecCreateUserIsLoading);

    const handleSuccessCreate = () => {
        dispatch(showToast({title: i18n('label_success-user-creation'), type: 'success'}));

        if (location?.state?.from === '/settings/users') {
            history.goBack();
            return;
        }
        dispatch(resetCreateUser());
    };

    const handleUserCreate = () => {
        dispatch(
            validateFormValues({
                onSuccess: () => {
                    dispatch(createUser({onSuccess: handleSuccessCreate, userData: userInfo}));
                },
                onError: setErrorMessage,
            }),
        );
    };

    React.useEffect(() => {
        return () => {
            dispatch(resetCreateUser());
            dispatch(resetUserInfoForm());
        };
    }, [dispatch]);

    const handleFormChange = () => {
        if (errorMessage) {
            setErrorMessage(null);
            dispatch(resetUserInfoFormValidation());
        }
    };

    return (
        <Flex direction="column" gap={8} width={630}>
            <Text as={'h3' as const} className={spacing({my: 0})} variant="subheader-3">
                {i18n('title_create-user')}
            </Text>
            <Flex gap={4} direction="column">
                {errorMessage && (
                    <Alert theme="danger" message={<InterpolatedText text={errorMessage} br />} />
                )}
                <Flex gap={3} as="form" direction="column" onChange={handleFormChange}>
                    <Login />
                    <FirstName />
                    <LastName />
                    <Email />
                    <Roles />
                    <Password showGenerateButton={true} />
                </Flex>
            </Flex>
            <Flex gap={2}>
                <Button loading={isLoading} view="action" onClick={handleUserCreate}>
                    {i18n('button_create')}
                </Button>
                <Link to="/settings/users">
                    <Button>{i18n('button_cancel')}</Button>
                </Link>
            </Flex>
        </Flex>
    );
};
