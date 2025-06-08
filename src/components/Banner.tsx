import React, { useEffect, useState } from 'react';
const banners = [{
  id: 1,
  title: 'New Releases Every Week',
  subtitle: 'Check out our latest movies',
  image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  buttonText: 'Book Now'
}, {
  id: 2,
  title: 'Special Tuesday Discounts',
  subtitle: 'All tickets half price',
  image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  buttonText: 'Learn More'
}, {
  id: 3,
  title: 'Premium Experience',
  subtitle: 'Luxury seats and state-of-the-art sound',
  image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  buttonText: 'Upgrade Now'
}];
const Banner: React.FC = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return <div className="relative h-96 overflow-hidden">
      {banners.map((banner, index) => <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`} style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${banner.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: index === currentBanner ? 10 : 0
    }}>
          <div className="flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h2 className="text-4xl font-bold mb-2">{banner.title}</h2>
            <p className="text-xl mb-6">{banner.subtitle}</p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              {banner.buttonText}
            </button>
          </div>
        </div>)}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
        {banners.map((_, index) => <button key={index} className={`w-3 h-3 rounded-full ${index === currentBanner ? 'bg-white' : 'bg-gray-400'}`} onClick={() => setCurrentBanner(index)} />)}
      </div>
    </div>;
};
export default Banner;