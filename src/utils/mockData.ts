// Mock data for movies
export const movies = [{
  id: '1',
  title: 'Inception',
  genre: 'Sci-Fi',
  duration: '148 min',
  description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  trailer: 'YoHD9XEInc0',
  releaseDate: '2023-11-15',
  isNowShowing: true
}, {
  id: '2',
  title: 'Interstellar',
  genre: 'Adventure',
  duration: '169 min',
  description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  trailer: 'zSWdZVtXT7E',
  releaseDate: '2023-11-20',
  isNowShowing: true
}, {
  id: '3',
  title: 'The Dark Knight',
  genre: 'Action',
  duration: '152 min',
  description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  trailer: 'EXeTwQWrcwY',
  releaseDate: '2023-11-25',
  isNowShowing: true
}, {
  id: '4',
  title: 'Avatar 2',
  genre: 'Fantasy',
  duration: '192 min',
  description: "Jake Sully lives with his newfound family formed on the planet of Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their planet.",
  image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  trailer: 'd9MyW72ELq0',
  releaseDate: '2023-12-15',
  isNowShowing: false
}, {
  id: '5',
  title: 'Dune: Part Two',
  genre: 'Sci-Fi',
  duration: '165 min',
  description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
  image: 'https://images.unsplash.com/photo-1617581629397-a72507c3de5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  trailer: 'Way3EzvLxKk',
  releaseDate: '2023-12-20',
  isNowShowing: false
}];
// Mock data for showtimes
export const showtimes = [{
  id: '1',
  movieId: '1',
  date: '2023-11-15',
  time: '10:00 AM',
  theater: 'Theater 1'
}, {
  id: '2',
  movieId: '1',
  date: '2023-11-15',
  time: '1:00 PM',
  theater: 'Theater 2'
}, {
  id: '3',
  movieId: '1',
  date: '2023-11-15',
  time: '4:00 PM',
  theater: 'Theater 1'
}, {
  id: '4',
  movieId: '1',
  date: '2023-11-15',
  time: '7:00 PM',
  theater: 'Theater 3'
}, {
  id: '5',
  movieId: '2',
  date: '2023-11-15',
  time: '11:00 AM',
  theater: 'Theater 4'
}, {
  id: '6',
  movieId: '2',
  date: '2023-11-15',
  time: '2:00 PM',
  theater: 'Theater 2'
}, {
  id: '7',
  movieId: '2',
  date: '2023-11-15',
  time: '5:00 PM',
  theater: 'Theater 3'
}, {
  id: '8',
  movieId: '2',
  date: '2023-11-15',
  time: '8:00 PM',
  theater: 'Theater 1'
}, {
  id: '9',
  movieId: '3',
  date: '2023-11-15',
  time: '10:30 AM',
  theater: 'Theater 2'
}, {
  id: '10',
  movieId: '3',
  date: '2023-11-15',
  time: '1:30 PM',
  theater: 'Theater 3'
}, {
  id: '11',
  movieId: '3',
  date: '2023-11-15',
  time: '4:30 PM',
  theater: 'Theater 4'
}, {
  id: '12',
  movieId: '3',
  date: '2023-11-15',
  time: '7:30 PM',
  theater: 'Theater 2'
}];
// Mock data for bookings
export const bookings = [{
  id: '1',
  userId: '1',
  movieId: '1',
  showtimeId: '1',
  seats: ['A1', 'A2'],
  totalPrice: 30,
  date: '2023-11-10',
  status: 'completed'
}, {
  id: '2',
  userId: '2',
  movieId: '2',
  showtimeId: '5',
  seats: ['B3', 'B4', 'B5'],
  totalPrice: 45,
  date: '2023-11-12',
  status: 'completed'
}];
// Mock data for revenue
export const revenueData = [{
  month: 'Jan',
  revenue: 4000
}, {
  month: 'Feb',
  revenue: 3000
}, {
  month: 'Mar',
  revenue: 5000
}, {
  month: 'Apr',
  revenue: 2780
}, {
  month: 'May',
  revenue: 1890
}, {
  month: 'Jun',
  revenue: 2390
}, {
  month: 'Jul',
  revenue: 3490
}, {
  month: 'Aug',
  revenue: 4000
}, {
  month: 'Sep',
  revenue: 2500
}, {
  month: 'Oct',
  revenue: 1500
}, {
  month: 'Nov',
  revenue: 5000
}, {
  month: 'Dec',
  revenue: 3500
}];