import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';

// ===== 타입 정의 =====
type ButtonSize = 'xxs' |'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

// 공통 Props
interface BaseButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

// Button Props
interface ButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  as?: 'button';
}

// Link Button Props
interface LinkButtonProps extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  as: 'a';
  href: string;
}

type ButtonPropsWithAs = ButtonProps | LinkButtonProps;
const ButtonRoot = forwardRef<ButtonElement, ButtonPropsWithAs>(
  (props, ref) => {
    const {
      as: Component = 'button',
      size = 'md',
      variant = 'primary',
      fullWidth = false,
      loading = false,
      iconOnly = false,
      className = '',
      disabled,
      children,
      ...restProps
    } = props;

    // 클래스명 조합
    const buttonClasses = [
      'button',
      `button--size-${size}`,
      `button--variant-${variant}`,
      fullWidth && 'button--full',
      iconOnly && 'button--icon-only',
      loading && 'is-loading',
      disabled && 'is-disabled',
      className
    ].filter(Boolean).join(' ');

    // 공통 props
    const commonProps = {
      className: buttonClasses,
      'aria-busy': loading || undefined,
    };

    // Button 렌더링
    if (Component === 'button') {
      const { ...buttonProps } = restProps as ButtonProps;
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled || loading}
          {...commonProps}
          {...buttonProps}
        >
          {children}
        </button>
      );
    }

    // Link Button 렌더링
    const { ...linkProps } = restProps as LinkButtonProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-disabled={disabled || loading}
        {...commonProps}
        {...linkProps}
      >
        {children}
      </a>
    );
  }
);

ButtonRoot.displayName = 'Button';

// ===== Button Group 컴포넌트 =====
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  attached?: boolean;
  vertical?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  attached = false,
  vertical = false,
  className = '',
  children,
  ...props
}) => {
  const groupClasses = [
    'button-group',
    attached && 'button-group--attached',
    vertical && 'button-group--vertical',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses} {...props}>
      {children}
    </div>
  );
};

// ===== Compound Component 구성 =====
const Button = Object.assign(ButtonRoot, {
  Group: ButtonGroup,
});

export default Button;

