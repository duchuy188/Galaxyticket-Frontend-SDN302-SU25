import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import MovieCard from '../components/MovieCard';
import { Movie, getMovies } from '../utils/movie';

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const nowShowing = Array.isArray(movies) ? movies.filter(movie => movie.showingStatus === 'now-showing') : [];
  const comingSoon = Array.isArray(movies) ? movies.filter(movie => movie.showingStatus === 'coming-soon') : [];

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Now Showing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map(movie => (
              <MovieCard
                key={movie._id}
                id={movie._id}
                title={movie.title}
                genre={movie.genre}
                duration={movie.duration.toString()}
                image={movie.posterUrl}
              />
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Coming Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.map(movie => (
              <MovieCard
                key={movie._id}
                id={movie._id}
                title={movie.title}
                genre={movie.genre}
                duration={movie.duration.toString()}
                image={movie.posterUrl}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;