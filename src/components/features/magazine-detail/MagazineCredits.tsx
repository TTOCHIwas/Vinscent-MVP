import React from 'react';

/**
 * 매거진 크레딧 정보 컴포넌트
 * @description 에디터, 디자이너, 포토그래퍼 등의 크레딧 정보를 표시합니다.
 */

interface MagazineCreditItem {
  role: string;        // "에디터", "디자이너", "포토그래퍼" 등
  name: string;        // 담당자 이름
}

interface MagazineCreditsProps {
  credits: MagazineCreditItem[];
  className?: string;
}

const MagazineCredits: React.FC<MagazineCreditsProps> = ({ 
  credits, 
  className = '' 
}) => {
  if (!credits || credits.length === 0) {
    return null;
  }

  return (
    <section className={`magazine-detail__credits ${className}`}>
      <h3 className="magazine-detail__credits-title">Credit</h3>
      <div className="magazine-detail__credits-list">
        {credits.map((credit, index) => (
          <div key={index} className="magazine-detail__credit-item">
            <span className="magazine-detail__credit-role">{credit.role}</span>
            <span className="magazine-detail__credit-name">{credit.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MagazineCredits;