'use client';

interface MagazineImage {
  id: number;
  imageUrl: string;
  imageOrder: number;
  magazineId: number;
  createdDate?: Date;
  updatedDate?: Date;
}

interface MagazineCarouselCard {
  id: number;
  title: string;
  category: 'official' | 'unofficial';
  brandId: number;
  brandTitle: string;
  createdDate: Date;
  thumbnail: MagazineImage;
}

interface CarouselCellProps {
  magazine: MagazineCarouselCard;
  isCenter: boolean;
  onClick?: (magazine: MagazineCarouselCard) => void;
}

const CarouselCell: React.FC<CarouselCellProps> = ({ magazine, isCenter, onClick }) => {
  const handleClick = () => {
    onClick?.(magazine);
  };

  const hasImage = magazine.thumbnail?.imageUrl && magazine.thumbnail.imageUrl.trim() !== '';

  return (
    <li 
      className={`carousel-cell ${isCenter ? 'is-center' : ''} ${hasImage ? 'has-image' : 'no-image'}`}
      onClick={handleClick}
      style={{
        backgroundImage: hasImage ? `url(${magazine.thumbnail.imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="carousel-cell__overlay" />
    </li>
  );
};

export default CarouselCell;