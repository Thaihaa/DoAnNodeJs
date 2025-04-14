import React from 'react';
import Hero from '../components/Hero';
import LocationSection from '../components/LocationSection';
import PromotionBanner from '../components/PromotionBanner';
import SubscribeSection from '../components/SubscribeSection';

const HomePage: React.FC = () => {
  return (
    <>
      <PromotionBanner />
      <LocationSection />
      <SubscribeSection />
    </>
  );
};

export default HomePage; 