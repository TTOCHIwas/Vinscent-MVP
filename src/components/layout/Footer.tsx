import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface FooterProps {
  className?: string;
  minimal?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  className = '',
  minimal = false,
}) => {
  const currentYear = new Date().getFullYear();

  // 메인 메뉴 4개
  // const mainLinks = [
  //   { label: 'About us', href: '/about' },
  //   { label: 'Service', href: '/service' },
  //   { label: 'Portfolio', href: '/portfolio' },
  //   { label: 'Contact', href: '/contact' },
  // ];

  // 소셜 링크 4개
  const socialLinks = [
    { label: '@vinscent_delivery', href: 'https://www.instagram.com/vinscent_delivery?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', icon: 'instagram' },
    { label: '@vinscent_marketing', href: 'https://www.threads.com/@vinscent_marketing?igshid=NTc4MTIwNjQ2YQ%3D%3D', icon: 'threads' },
    { label: '@vinscent_page', href: 'https://www.youtube.com/@vinscent_page', icon: 'youtube' },
  ];

  if (minimal) {
    return (
      <footer className={`footer--minimal ${className}`}>
        <div className="footer__container footer__container--minimal">
          <p className="footer__copyright-text">© {currentYear} Vinscent. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`footer ${className}`}>
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__main">
            <div className='footer__brand__div'>
              <Link href="/" className="footer__logo">
                Vinscent
              </Link>
              <div className='divier'/>
              <p className="footer__tagline">
                blending scents, sharing stories<br />
                the art of finding your fragrance
              </p>
            </div>
            {/* <div className="footer__nav">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer__nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </div> */}
          </div>
          <div className='footer__sub'>
            <p className="footer__description">
              본래의 향에서 새로움을 찾다.<br />
              vinscent는 자신만의 향수 조합을 이야기하는 브랜드입니다.
            </p>
            <div className="footer__social">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image 
                    src={`/${link.icon}.svg`}
                    alt={link.icon}
                    width={16}
                    height={16}
                    className="footer__social-icon"
                  />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;