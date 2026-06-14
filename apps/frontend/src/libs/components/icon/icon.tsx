import clsx from 'clsx';

import { iconNameToIcon } from './libs/maps/maps.js';

type IconProperties = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  iconName: keyof typeof iconNameToIcon;
};

const Icon: React.FC<IconProperties> = ({
  alt,
  className,
  iconName,
  ...properties
}) => {
  const icon = iconNameToIcon[iconName];

  if (!icon) {
    throw new Error(`Icon with name "${iconName}" does not exist`);
  }

  return (
    <img
      alt={alt ?? iconName}
      className={clsx(className)}
      src={icon}
      {...properties}
    />
  );
};

export { Icon };
