import React from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const RolesPagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    onPageChange(pageNumber);
  };

  if (totalPages <= 1) {
      return null; 
  }


  const pageNumbers = [];
  const maxPagesToShow = 5; // Límite de números a mostrar directamente
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Ajusta si el final se calculó antes del inicio debido a pocas páginas totales
   if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
   }


  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination aria-label="Roles pagination" className="d-flex justify-content-center mt-3">
      {/* Botón Primera Página (Opcional) */}
      {/* <PaginationItem disabled={currentPage === 1}>
        <PaginationLink first onClick={() => handlePageClick(1)} />
      </PaginationItem> */}

      {/* Botón Anterior */}
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink previous onClick={handlePrevious} />
      </PaginationItem>

      {/* Números de Página */}
       {/* Mostrar '...' al inicio si es necesario */}
       {startPage > 1 && (
            <PaginationItem disabled>
                <PaginationLink>...</PaginationLink>
            </PaginationItem>
       )}

      {pageNumbers.map(number => (
        <PaginationItem key={number} active={number === currentPage}>
          <PaginationLink onClick={() => handlePageClick(number)}>
            {number}
          </PaginationLink>
        </PaginationItem>
      ))}

        {/* Mostrar '...' al final si es necesario */}
        {endPage < totalPages && (
            <PaginationItem disabled>
                <PaginationLink>...</PaginationLink>
            </PaginationItem>
        )}

      {/* Botón Siguiente */}
      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink next onClick={handleNext} />
      </PaginationItem>

       {/* Botón Última Página (Opcional) */}
       {/* <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink last onClick={() => handlePageClick(totalPages)} />
       </PaginationItem> */}
    </Pagination>
  );
};

export default RolesPagination;