'use client';

import Link from 'next/link';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`header ${className}`}>
      <div className="header__container">
        <Link href="/" className="header__logo">
          Vinscent
        </Link>
      </div>
    </header>
  );
};

export default Header;