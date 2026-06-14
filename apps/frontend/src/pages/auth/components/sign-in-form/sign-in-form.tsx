import { Button, Input, NavLink } from '~/libs/components/components.js';
import { AppRoute, ButtonColor, IconName } from '~/libs/enums/enums.js';
import { useAppForm } from '~/libs/hooks/hooks.js';
import { type UserSignInRequestDto } from '~/modules/auth/auth.js';
import { signIn as signInValidationSchema } from '~/modules/auth/libs/validation-schemas/validation-schemas.js';
import { UserPayloadKey } from '~/modules/user/user.js';

import { DEFAULT_SIGN_IN_PAYLOAD } from './libs/common/constants.js';
import styles from './styles.module.scss';

type Properties = {
  onSubmit: (payload: UserSignInRequestDto) => void;
};

const SignInForm: React.FC<Properties> = ({ onSubmit }) => {
  const { control, errors, handleSubmit } = useAppForm({
    defaultValues: DEFAULT_SIGN_IN_PAYLOAD,
    validationSchema: signInValidationSchema
  });

  const handleFormSubmit = (values: UserSignInRequestDto): void => {
    onSubmit(values);
  };

  return (
    <>
      <h2 className={styles['title']}>Login to your account</h2>
      <form name="loginForm" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className={styles['fieldset']}>
          <Input
            control={control}
            errors={errors}
            iconName={IconName.EMAIL}
            name={UserPayloadKey.EMAIL}
            placeholder="Email"
            type="email"
          />
          <Input
            control={control}
            errors={errors}
            iconName={IconName.PASSWORD}
            name={UserPayloadKey.PASSWORD}
            placeholder="Password"
            type="password"
          />
          <Button color={ButtonColor.TEAL} isFluid isPrimary type="submit">
            Sign In
          </Button>
        </fieldset>
      </form>
      <div>
        <span>New to us?</span>
        <NavLink to={AppRoute.SIGN_UP}>Sign Up</NavLink>
      </div>
    </>
  );
};

export { SignInForm };
