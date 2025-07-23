import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, TagIcon } from 'lucide-react';
type MovieCardProps = {
  id: string;
  title: string;
  genre: string;
  duration: string;
  image: string;
};
const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  genre,
  duration,
  image
}) => {
  return <Link to={`/movie/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:transform group-hover:scale-105">
        <div className="relative h-64">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-4 text-white">
              <span className="inline-block px-2 py-1 bg-red-600 text-xs font-semibold rounded mb-2">
                Book Now
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
            {title}
          </h3>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center">
              <TagIcon size={16} className="mr-1" />
              <span>{genre}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-1" />
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>;
};
export default MovieCard;