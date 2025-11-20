"use client";

import styles from "./pagination.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdChevronRight, MdOutlineLastPage } from "react-icons/md";

const Pagination = ({ metadata }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  // Debug metadata
  console.log("Pagination received metadata:", metadata);

  if (!metadata) {
    console.warn("No metadata provided to Pagination component");
    return null;
  }

  // Lấy thông tin phân trang từ metadata
  const { page, totalPages, count, totalElements } = metadata;
  
  // Backend và URL đều dùng 1-based, không cần convert
  const currentPage = parseInt(page) || 1;
  const params = new URLSearchParams(searchParams);

  console.log("Current Page:", currentPage, "Total Pages:", totalPages);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Hàm xử lý khi chuyển trang
  const handleChangePage = (newPage) => {
    // URL và Backend đều dùng 1-based, giữ nguyên
    params.set("page", newPage);
    replace(`${pathname}?${params}`);
  };

  // Hàm để tạo mảng các trang cần hiển thị
  const getPageNumbers = () => {
    // Đảm bảo totalPages luôn ít nhất là 1
    const actualTotalPages = Math.max(1, totalPages);
    
    // Giới hạn số nút trang hiển thị (như trong hình mẫu)
    const visiblePageCount = Math.min(5, actualTotalPages);
    const pageNumbers = [];
    
    let startPage = Math.max(1, currentPage - Math.floor(visiblePageCount / 2));
    let endPage = startPage + visiblePageCount - 1;
    
    if (endPage > actualTotalPages) {
      endPage = actualTotalPages;
      startPage = Math.max(1, endPage - visiblePageCount + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Luôn hiển thị phân trang, kể cả khi chỉ có 1 trang
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        Hiển thị <strong>{count}</strong> / <strong>{totalElements}</strong> bản ghi
      </div>
      
      <div className={styles.paginationControls}>
        {getPageNumbers().map((pageNumber) => (
          <button
            key={`page-${pageNumber}`}
            className={`${styles.pageButton} ${currentPage === pageNumber ? styles.active : ''}`}
            onClick={() => handleChangePage(pageNumber)}
            disabled={currentPage === pageNumber}
            aria-label={`Page ${pageNumber}`}
          >
            {pageNumber}
          </button>
        ))}
        
        {hasNext && (
          <button
            className={styles.button}
            onClick={() => handleChangePage(currentPage + 1)}
            aria-label="Next page"
          >
            <MdChevronRight />
          </button>
        )}
        
        {hasNext && (
          <button
            className={styles.button}
            onClick={() => handleChangePage(totalPages)}
            aria-label="Last page"
          >
            <MdOutlineLastPage />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;