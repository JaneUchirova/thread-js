import { ErrorMessage } from '@hookform/error-message';
import clsx from 'clsx';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController
} from 'react-hook-form';

import { Icon } from '~/libs/components/components.js';
import { type IconName } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

import styles from './styles.module.scss';

type InputProperties<T extends FieldValues> = {
  className?: string;
  control: Control<T>;
  disabled?: boolean;
  errors?: object;
  iconName?: ValueOf<typeof IconName>;
  name: FieldPath<T>;
  placeholder: string;
  rows?: number;
  type?: 'email' | 'password' | 'submit' | 'text';
};

const Input = <T extends FieldValues>({
  className,
  control,
  disabled,
  errors = {},
  iconName,
  name,
  placeholder,
  rows,
  type = 'text'
}: InputProperties<T>): React.ReactElement => {
  const { field } = useController<T>({ control, name });
  const isTextarea = Boolean(rows);

  return (
    <div className={styles['inputWrapper']}>
      <div className={styles['inputContainer']}>
        {isTextarea ? (
          <textarea
            {...field}
            className={clsx(styles['textArea'], className)}
            name={name}
            placeholder={placeholder}
            rows={rows}
          />
        ) : (
          <>
            {iconName && (
              <Icon className={styles['icon']} iconName={iconName} />
            )}
            <input
              {...field}
              className={clsx(
                styles['input'],
                iconName && styles['inputWithIcon'],
                className
              )}
              disabled={disabled}
              placeholder={placeholder}
              type={type}
            />
          </>
        )}
      </div>
      <span className={styles['errorWrapper']}>
        <ErrorMessage errors={errors} name={name} />
      </span>
    </div>
  );
};

export { Input };
