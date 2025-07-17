import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...', totalPages);
      }
    }
    // Loại bỏ số trùng nhau và giữ nguyên thứ tự
    return pages.filter((item, idx) => pages.indexOf(item) === idx);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &laquo;
      </button>
      {getPageNumbers().map((page, idx) =>
        typeof page === 'number' ? (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {page}
          </button>
        ) : (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
