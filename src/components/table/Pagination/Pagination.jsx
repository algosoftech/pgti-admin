import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './Pagination.css';

/**
 * ProfessionalPagination Component
 * 
 * A professional-grade pagination component with:
 * - Left: Items per page selector (dropdown)
 * - Center: Page numbers with ellipsis
 * - Right: Previous/Next navigation buttons
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.limit - Items per page
 * @param {number} props.count - Total number of items
 * @param {number} props.skip - Number of items skipped (for calculating range)
 * @param {Function} props.onPageChange - Callback when page changes (receives new page number)
 * @param {Function} props.onLimitChange - Callback when limit changes (receives new limit)
 * @param {Array<number>} props.limitOptions - Options for items per page (default: [10, 20, 50, 100])
 * @param {string} props.itemLabel - Label for items (default: "items", e.g., "Documents", "Banners")
 */
const ProfessionalPagination = ({
  currentPage = 1,
  totalPages = 1,
  limit = 10,
  count = 0,
  skip = 0,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50, 100],
  itemLabel = "items"
}) => {
  // Validate and sanitize props
  const safeTotalPages = Math.max(1, parseInt(totalPages, 10) || 1);
  const safeCurrentPage = Math.max(1, Math.min(parseInt(currentPage, 10) || 1, safeTotalPages));
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const safeCount = Math.max(0, parseInt(count, 10) || 0);
  const safeSkip = Math.max(0, parseInt(skip, 10) || 0);
  
  // Calculate display range
  const start = safeCount > 0 ? safeSkip + 1 : 0;
  const end = Math.min(safeSkip + safeLimit, safeCount);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // Show up to 7 page numbers
    
    if (safeTotalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, safeCurrentPage - 1);
      let endPage = Math.min(safeTotalPages - 1, safeCurrentPage + 1);
      
      // Adjust if we're near the start
      if (safeCurrentPage <= 3) {
        startPage = 2;
        endPage = Math.min(5, safeTotalPages - 1);
      }
      
      // Adjust if we're near the end
      if (safeCurrentPage >= safeTotalPages - 2) {
        startPage = Math.max(2, safeTotalPages - 4);
        endPage = safeTotalPages - 1;
      }
      
      // Add ellipsis before if needed
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after if needed
      if (endPage < safeTotalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      if (safeTotalPages > 1) {
        pages.push(safeTotalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < safeTotalPages;

  const handlePageClick = (page) => {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum !== safeCurrentPage && pageNum >= 1 && pageNum <= safeTotalPages && onPageChange) {
      onPageChange(pageNum);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    if (!isNaN(newLimit) && newLimit >= 1 && newLimit <= 100 && onLimitChange && newLimit !== safeLimit) {
      onLimitChange(newLimit);
      // Reset to page 1 when limit changes
      if (onPageChange) {
        onPageChange(1);
      }
    }
  };

  // Human-readable record range text
  const rangeText = safeCount === 0
    ? `0 ${itemLabel}`
    : `${start}–${end} of ${safeCount} ${itemLabel}`;

  return (
    <div className="professional-pagination">
      {/* Left: Items per page selector + record count */}
      <div className="pagination-items-per-page">
        <div className="items-per-page-selector">
          <select
            value={safeLimit}
            onChange={handleLimitChange}
            className="items-per-page-select"
          >
            {limitOptions
              .filter(opt => opt >= 1 && opt <= 100)
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
          <span className="items-per-page-label">per page</span>
          <FontAwesomeIcon icon={faChevronDown} className="items-per-page-icon" />
        </div>
        <span className="pagination-record-count">{rangeText}</span>
      </div>

      {/* Center: Page numbers */}
      {safeTotalPages > 0 && (
        <div className="pagination-pages">
          {pageNumbers.length > 0 ? (
            pageNumbers.map((page, index) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }
              
              const pageNum = parseInt(page, 10);
              const isActive = pageNum === safeCurrentPage;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`pagination-page-button ${isActive ? 'active' : ''}`}
                  disabled={isActive}
                  aria-label={`Go to page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })
          ) : (
            <button
              className="pagination-page-button active"
              disabled
              aria-label="Page 1"
              aria-current="page"
            >
              1
            </button>
          )}
        </div>
      )}

      {/* Right: Previous/Next buttons - Always show when there are pages */}
      {safeTotalPages > 0 && (
        <div className="pagination-navigation">
          <button
            onClick={() => handlePageClick(safeCurrentPage - 1)}
            disabled={!canGoPrevious}
            className="pagination-nav-button pagination-nav-prev"
            title={canGoPrevious ? "Go to previous page" : "Already on first page"}
            aria-label="Go to previous page"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span>Previous</span>
          </button>
          
          <button
            onClick={() => handlePageClick(safeCurrentPage + 1)}
            disabled={!canGoNext}
            className="pagination-nav-button pagination-nav-next"
            title={canGoNext ? "Go to next page" : "Already on last page"}
            aria-label="Go to next page"
          >
            <span>Next</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalPagination;
