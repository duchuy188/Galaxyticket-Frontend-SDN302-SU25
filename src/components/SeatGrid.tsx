import React from 'react';
type SeatProps = {
  id: string;
  status: 'available' | 'selected' | 'unavailable';
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
      case 'unavailable':
        return 'bg-gray-400 cursor-not-allowed opacity-50';
    }
  };
  return <button className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium ${getColorClass()}`} onClick={() => status !== 'unavailable' && onSelect(id)} disabled={status === 'unavailable'}>
      {id}
    </button>;
};
type SeatGridProps = {
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
};
const SeatGrid: React.FC<SeatGridProps> = ({
  selectedSeats,
  onSeatSelect
}) => {
  // Mock unavailable seats
  const unavailableSeats = ['A3', 'B5', 'C2', 'C3', 'D4', 'E5', 'F2'];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 8;
  const getSeatStatus = (seatId: string): 'available' | 'selected' | 'unavailable' => {
    if (unavailableSeats.includes(seatId)) return 'unavailable';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };
  return <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 p-4 bg-gray-800 text-white text-center rounded-lg">
        <div className="w-full h-2 bg-gray-600 rounded-lg mb-8"></div>
        <p className="text-sm">SCREEN</p>
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
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-400 opacity-50 rounded mr-2"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>;
};
export default SeatGrid;