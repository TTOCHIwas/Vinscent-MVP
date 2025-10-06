import React from 'react';

/**
 * IntroductionItem 컴포넌트 props 인터페이스
 */
interface IntroductionItemProps {
  imageSrc: string;
  title: string;
  description: string;
}

/**
 * IntroductionItem 컴포넌트
 * 이미지와 제목, 설명을 표시하는 개별 소개 아이템
 */
const IntroductionItem: React.FC<IntroductionItemProps> = ({
  imageSrc,
  title,
  description,
}) => {
  return (
    <div className="introduction-item">
      <div className="introduction-item__image">
        <img src={imageSrc} alt="" />
      </div>
      <div className="introduction-item__content">
        <h3 className="introduction-item__title">{title}</h3>
        <p className="introduction-item__description">{description}</p>
      </div>
    </div>
  );
};

export default IntroductionItem;