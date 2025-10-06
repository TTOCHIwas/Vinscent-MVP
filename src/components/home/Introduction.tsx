import IntroductionItem from './IntroductionItem';

/**
 * Introduction 섹션 데이터 타입
 */
interface IntroductionData {
  imageSrc: string;
  title: string;
  description: string;
}

/**
 * Introduction 컴포넌트 props 인터페이스
 */
interface IntroductionProps {
  items?: IntroductionData[];
}

/**
 * 기본 임시 데이터
 */
const defaultItems: IntroductionData[] = [
  {
    imageSrc: '/temp-image-1.svg',
    title: 'Luminous essence',
    description: 'A soft beam of light reveals a golden essence, crafted for those who seek beauty in the smallest details. This is more than perfume — it is a ritual of self-indulgence, a silent celebration of your unique presence. Embrace the glow, wear the story.',
  },
  {
    imageSrc: '/temp-image-2.svg',
    title: 'Timeless Rituals',
    description: 'Every bottle holds a story — a ritual that begins with a single drop and lingers through your day. Find scents that echo your every mood, designed to transform even the smallest moments into something exquisite. From the first light of morning to the hush of evening, discover the art of wearing fragrance, your way.',
  },
  {
    imageSrc: '/temp-image-3.svg',
    title: 'Moments in a Bottle',
    description: 'More than a fragrance, each bottle is a repository of memories and moods. Layer your scents, mix and match, and carry a piece of timeless elegance wherever you go. This is more than perfume — it is a ritual of self-indulgence. A celebration of your story, drop by drop.',
  },
];

/**
 * Introduction 컴포넌트
 * 3개의 IntroductionItem을 포함하는 소개 섹션
 */
const Introduction: React.FC<IntroductionProps> = ({
  items = defaultItems,
}) => {
  return (
    <section className="introduction">
      <p className='introduction-title'>INTRODUCTION</p>
      {items.map((item, index) => (
        <IntroductionItem
          key={index}
          imageSrc={item.imageSrc}
          title={item.title}
          description={item.description}
        />
      ))}
    </section>
  );
};

export default Introduction;