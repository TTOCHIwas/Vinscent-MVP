import React, { HTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';

/**
 * Type definitions for Card component variants and configurations
 */
type CardSize = 'sm' | 'md' | 'lg';
type CardVariant = 'elevated' | 'outlined' | 'filled';
type CardType = 'default' | 'magazine';
type CardElement = HTMLDivElement | HTMLAnchorElement;

/**
 * Base props interface shared by all Card variants
 */
interface BaseCardProps {
  size?: CardSize;
  variant?: CardVariant;
  type?: CardType;
  clickable?: boolean;
  horizontal?: boolean;
  selected?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props interface for div-based Card component
 */
interface DivCardProps extends BaseCardProps, Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  as?: 'div';
}

/**
 * Props interface for anchor-based Card component
 */
interface LinkCardProps extends BaseCardProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'type'> {
  as: 'a';
  href: string;
}

type CardPropsWithAs = DivCardProps | LinkCardProps;

/**
 * Root Card component that can render as either a div or anchor element
 * Supports multiple variants, sizes, and types with flexible styling options
 * 
 * @param props - Card props with polymorphic 'as' prop support
 * @param ref - React ref for the underlying DOM element
 * @returns JSX element (div or anchor) with card styling and behavior
 */
const CardRoot = forwardRef<CardElement, CardPropsWithAs>(
  (props, ref) => {
    const {
      as: Component = 'div',
      size = 'md',
      variant = 'outlined',
      type = 'default',
      clickable = false,
      horizontal = false,
      selected = false,
      loading = false,
      className = '',
      children,
      ...restProps
    } = props;

    // 클래스명 조합
    const cardClasses = [
      'card',
      `card--size-${size}`,
      `card--variant-${variant}`,
      clickable && 'card--clickable',
      horizontal && 'card--horizontal',
      type !== 'default' && `card--${type}`,
      selected && 'is-selected',
      loading && 'is-loading',
      className
    ].filter(Boolean).join(' ');

    // 공통 props
    const commonProps = {
      className: cardClasses,
      role: clickable ? 'button' : undefined,
      tabIndex: clickable ? 0 : undefined,
    };

    // Div Card 렌더링
    if (Component === 'div') {
      const { ...divProps } = restProps as DivCardProps;
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          {...commonProps}
          {...divProps}
        >
          {children}
        </div>
      );
    }

    // Link Card 렌더링
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...commonProps}
        {...(restProps as LinkCardProps)}
      >
        {children}
      </a>
    );
  }
);

CardRoot.displayName = 'Card';

// ===== Card Header =====
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`card__header ${className}`} {...props}>
    {children}
  </div>
);

// ===== Card Title =====
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ 
  as: Component = 'h3', 
  children, 
  className = '', 
  ...props 
}) => (
  <Component className={`card__title ${className}`} {...props}>
    {children}
  </Component>
);

// ===== Card Subtitle =====
interface CardSubtitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

const CardSubtitle: React.FC<CardSubtitleProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <p className={`card__subtitle ${className}`} {...props}>
    {children}
  </p>
);

// ===== Card Media =====
interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  position?: 'top' | 'bottom';
  children?: React.ReactNode;
}

const CardMedia: React.FC<CardMediaProps> = ({ 
  src, 
  alt = '', 
  position = 'top',
  children,
  className = '', 
  ...props 
}) => (
  <div 
    className={`card__media ${position === 'bottom' ? 'card__media--bottom' : ''} ${className}`} 
    {...props}
  >
    {src ? (
      <img src={src} alt={alt} loading="lazy" />
    ) : (
      children
    )}
  </div>
);

// ===== Card Content =====
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div className={`card__content ${className}`} {...props}>
    {children}
  </div>
);

// ===== Card Actions =====
interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center' | 'between';
  children?: React.ReactNode;
}

const CardActions: React.FC<CardActionsProps> = ({ 
  align = 'start', 
  children, 
  className = '', 
  ...props 
}) => (
  <div 
    className={`card__actions ${align !== 'start' ? `card__actions--${align}` : ''} ${className}`} 
    {...props}
  >
    {children}
  </div>
);

// ===== Card Badge =====
interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

const CardBadge: React.FC<CardBadgeProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <span className={`card__badge ${className}`} {...props}>
    {children}
  </span>
);

// ===== Magazine Card 특화 컴포넌트 =====
interface MagazineAuthorProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  avatar?: string;
  date?: string;
}

const MagazineAuthor: React.FC<MagazineAuthorProps> = ({ 
  name, 
  avatar, 
  date,
  className = '',
  ...props 
}) => (
  <div className={`card__author ${className}`} {...props}>
    {avatar && (
      <img src={avatar} alt={name} className="card__author-avatar" />
    )}
    <span>{name}</span>
    {date && <span> · {date}</span>}
  </div>
);

// ===== Card Grid =====
interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  className = '', 
  style,
  ...props 
}) => (
  <div 
    className={`card-grid ${className}`} 
    style={style}
    {...props}
  >
    {children}
  </div>
);

// ===== Compound Component 구성 =====
const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Subtitle: CardSubtitle,
  Media: CardMedia,
  Content: CardContent,
  Actions: CardActions,
  Badge: CardBadge,
  Author: MagazineAuthor,
  Grid: CardGrid,
});

export default Card;
