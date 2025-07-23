import React, { useEffect, useState } from 'react';
import { getScreeningSeats } from '../utils/seats';

type Seat = {
  seatNumber: string;
  status: 'available' | 'booked' | 'reserved';
};

type SeatProps = {
  id: string;
  status: 'available' | 'selected' | 'booked' | 'reserved';
  onSelect: (id: string) => void;
};

const Seat: React.FC<SeatProps> = ({
  id,
  status,
  onSelect
}) => {
  const getColorClass = () => {
    switch (status) {
      case 'available':
        return 'bg-gray-200 hover:bg-blue-300 cursor-pointer';
      case 'selected':
        return 'bg-blue-500 text-white';
      case 'booked':
        return 'bg-red-600 text-white cursor-not-allowed opacity-50';
      case 'reserved':
        return 'bg-yellow-600 text-white cursor-not-allowed opacity-50';
      default:
        return 'bg-gray-400 cursor-not-allowed opacity-50';
    }
  };
  return <button className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium ${getColorClass()}`} onClick={() => status !== 'booked' && status !== 'reserved' && onSelect(id)} disabled={status === 'booked' || status === 'reserved'}>
    {id}
  </button>;
};

type SeatGridProps = {
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  screeningId: string;
};

const SeatGrid: React.FC<SeatGridProps> = ({
  selectedSeats,
  onSeatSelect,
  screeningId
}) => {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, 'available' | 'booked' | 'reserved'>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        console.log('Fetching seats for screeningId:', screeningId);
        const seats = await getScreeningSeats(screeningId);
        console.log('API response seats:', seats);

        const newSeatStatuses: Record<string, 'available' | 'booked' | 'reserved'> = {};
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 8;

        // Initialize all seats as available first
        rows.forEach(row => {
          Array.from({ length: seatsPerRow }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            newSeatStatuses[seatId] = 'available';
          });
        });

        // Update statuses based on API response
        seats.forEach(seat => {
          if (seat.seatNumber && (seat.status === 'booked' || seat.status === 'reserved')) {
            newSeatStatuses[seat.seatNumber] = seat.status;
          }
        });
        setSeatStatuses(newSeatStatuses);
        setError(null);
      } catch (err) {
        setError('Failed to load seats. Please try again later.');
        console.error('Error loading seats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [screeningId]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 8;

  const getSeatStatus = (seatId: string): 'available' | 'selected' | 'booked' | 'reserved' => {
    if (selectedSeats.includes(seatId)) return 'selected';
    const statusFromAPI = seatStatuses[seatId];
    if (statusFromAPI === 'booked') return 'booked';
    if (statusFromAPI === 'reserved') return 'reserved';
    return 'available';
  };

  if (loading) {
    return <div className="w-full max-w-3xl mx-auto text-center py-8">
      <p>Loading seats...</p>
    </div>;
  }

  if (error) {
    return <div className="w-full max-w-3xl mx-auto text-center py-8 text-red-600">
      <p>{error}</p>
    </div>;
  }

  return <div className="w-full max-w-3xl mx-auto">
    <div className="mb-8 p-4 bg-gray-800 text-white text-center rounded-lg">
      <div className="w-full h-2 bg-gray-600 rounded-lg mb-8"></div>
      <p className="text-sm">Màn hình</p>
    </div>
    <div className="space-y-4">
      {rows.map(row => <div key={row} className="flex items-center">
        <div className="w-6 text-center font-medium mr-2">{row}</div>
        <div className="grid grid-cols-8 gap-2 flex-1">
          {Array.from({
            length: seatsPerRow
          }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            return <Seat key={seatId} id={seatId} status={getSeatStatus(seatId)} onSelect={onSeatSelect} />;
          })}
        </div>
      </div>)}
    </div>
    <div className="mt-8 flex justify-center space-x-8">
      <div className="flex items-center">
        <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
        <span>Ghế trống</span>
      </div>
      <div className="flex items-center">
        <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
        <span>Ghế chọn</span>
      </div>
      <div className="flex items-center">
        <div className="w-6 h-6 bg-yellow-600 rounded mr-2"></div>
        <span>Ghế đang đặt</span>
      </div>
      <div className="flex items-center">
        <div className="w-6 h-6 bg-red-600 rounded mr-2"></div>
        <span>Ghế đã thanh toán</span>
      </div>
    </div>
  </div>;
};

export default SeatGrid;