import React from 'react';
import Banner from '../components/Banner';
import MovieCard from '../components/MovieCard';
import { movies } from '../utils/mockData';
const Home: React.FC = () => {
  const nowShowing = movies.filter(movie => movie.isNowShowing);
  const comingSoon = movies.filter(movie => !movie.isNowShowing);
  return <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Now Showing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map(movie => <MovieCard key={movie.id} id={movie.id} title={movie.title} genre={movie.genre} duration={movie.duration} image={movie.image} />)}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Coming Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.map(movie => <MovieCard key={movie.id} id={movie.id} title={movie.title} genre={movie.genre} duration={movie.duration} image={movie.image} />)}
          </div>
        </section>
      </div>
    </div>;
};
export default Home;