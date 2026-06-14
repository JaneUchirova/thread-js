import emailIcon from '~/assets/icons/email.svg';
import passwordIcon from '~/assets/icons/password.svg';
import { IconName } from '~/libs/enums/enums.js';
import { type ValueOf } from '~/libs/types/types.js';

const iconNameToIcon: Record<ValueOf<typeof IconName>, string> = {
  [IconName.EMAIL]: emailIcon,
  [IconName.PASSWORD]: passwordIcon
};

export { iconNameToIcon };
