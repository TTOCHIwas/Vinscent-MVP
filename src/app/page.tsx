'use client';import React from 'react';
import { HeroSlide } from '@/components/home';
import MagazineCarousel3D from '@/components/home/MagazineCarousel3D';
import Introduction from '@/components/home/Introduction';
import { useHeroMagazines, useCarouselMagazines } from '@/lib/queries/magazines';
import { useHeroSlideNavigation, useCarouselNavigation } from '@/hooks/useMagazineNavigation';

export default function HomePage() {
  const { data: heroData, isLoading: heroLoading, error: heroError } = useHeroMagazines();
  const { data: carouselData, error: carouselError } = useCarouselMagazines();

  const { navigateFromHeroSlide } = useHeroSlideNavigation();
  const { navigateFromCarousel } = useCarouselNavigation();

  if (heroError || carouselError) {
    console.error('Data loading error:', { heroError, carouselError });
  }

  const heroMagazines = heroData?.success && Array.isArray(heroData.data) ? heroData.data : [];
  const carouselMagazines = carouselData?.success && Array.isArray(carouselData.data) ? carouselData.data : [];

  return (
    <div className="main-page">
      <section className="hero-section">
        <HeroSlide 
          magazines={heroMagazines} 
          loading={heroLoading}
          onSlideClick={navigateFromHeroSlide}
        />
      </section>

      <section className="magazine-carousel-section">
        <MagazineCarousel3D 
          magazines={carouselMagazines}
          onCellClick={navigateFromCarousel}
        />
      </section>

      <section className="introduction-section">
        <Introduction />
      </section>
    </div>
  );
}
