import React from 'react';

/**
 * 매거진 콘텐츠 섹션 컴포넌트
 * @description 메인 콘텐츠와 이미지 섹션들을 표시합니다.
 */

interface MagazineImageData {
  id: number;
  imageUrl: string;
  imageOrder: number;
  imageCaption?: string | null;
  imageSource?: string | null;
  imageDescription?: string | null;
  magazineId: number;
}

interface MagazineContentSectionProps {
  mainContent?: string | null;    // 메인 콘텐츠 텍스트
  images: MagazineImageData[];    // 이미지 섹션들
  magazineTitle: string;          // 대체 텍스트용
  className?: string;
}

const MagazineContentSection: React.FC<MagazineContentSectionProps> = ({
  mainContent,
  images,
  magazineTitle,
  className = ''
}) => {
  return (
    <main className={`magazine-detail__content ${className}`}>
      
      {/* 메인 콘텐츠 텍스트 (있다면) */}
      {mainContent && (
        <div className="magazine-detail__main-content">
          <p>{mainContent}</p>
        </div>
      )}

      {/* 이미지 섹션들 */}
      <div className="magazine-detail__sections">
        {images.map((image) => (
          <section key={image.id} className="magazine-detail__section">
            
            {/* 이미지 */}
            <figure className="magazine-detail__image-figure">
              <img
                src={image.imageUrl}
                alt={image.imageCaption || magazineTitle}
                className="magazine-detail__image"
                loading="lazy"
              />
              
              {/* 이미지 출처 */}
              {image.imageSource && (
                <figcaption className="magazine-detail__image-source">
                  {image.imageSource}
                </figcaption>
              )}
            </figure>

            {/* 이미지 캡션/제목 */}
            {image.imageCaption && (
              <h3 className="magazine-detail__section-title">
                {image.imageCaption}
              </h3>
            )}

            {/* 이미지 설명/내용 */}
            {image.imageDescription && (
              <div className="magazine-detail__section-content">
                <p>{image.imageDescription}</p>
              </div>
            )}
            
          </section>
        ))}
      </div>
    </main>
  );
};

export default MagazineContentSection;