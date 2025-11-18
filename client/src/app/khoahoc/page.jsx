'use client';
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import Link from "next/link";
import { courseService } from "../api/course/courseService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Style from "./khoahoc.module.css";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

// Format currency
const formatCurrency = (price) => {
  if (!price) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(price);
};

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [courses, setCourses] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    status: 'active'
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 1)
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Lấy các tham số lọc từ URL
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  // Sync state với URL parameters
  useEffect(() => {
    setSearchTerm(searchFilter);
    setSelectedStatus(statusFilter);
  }, [searchFilter, statusFilter]);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchCourses(currentPage, itemsPerPage, searchFilter, statusFilter);
  }, [currentPage, itemsPerPage, searchFilter, statusFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== searchFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ search: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, searchFilter]);

  // Cập nhật bộ lọc vào URL và quay về trang đầu tiên
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Cập nhật các tham số
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Khi thay đổi bộ lọc, quay về trang đầu tiên
    params.set("page", "1");
    
    // Cập nhật URL
    replace(`${pathname}?${params}`);
  };

  const fetchCourses = async (page, size, search = "", status = "") => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({ 
        page, 
        size, 
        search, 
        status,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      
      console.log("API Response (Courses):", response); // Debug thông tin API trả về
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách khóa học");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setCourses([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        setCourses(response.items);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page - 1, // Convert to 0-based for pagination component
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Courses API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setCourses(response);
        setMetadata({
          page: 0,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setCourses([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách khóa học. Vui lòng thử lại!");
      setCourses([]);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditForm({
      name: course.name || '',
      description: course.description || '',
      price: course.price || '',
      status: course.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.name.trim()) {
      toast.error("Tên khóa học không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật khóa học...", { id: "edit-course" });
      
      const response = await courseService.updateCourse(selectedCourse.id, {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price ? Number(editForm.price) : null,
        status: editForm.status
      });
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật khóa học");
        toast.error(errorMessage, {
          id: "edit-course",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật khóa học "${editForm.name}" thành công!`, {
        id: "edit-course",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchCourses(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (err) {
      console.error("Error updating course:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật khóa học. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-course",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa khóa học...", { id: "delete-course" });
      
      const response = await courseService.deleteCourse(selectedCourse.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa khóa học");
        toast.error(errorMessage, {
          id: "delete-course",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa khóa học "${selectedCourse.name}" thành công!`, {
        id: "delete-course",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchCourses(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (err) {
      console.error("Error deleting course:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa khóa học. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-course",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (course) => {
    try {
      const courseDetail = await courseService.getCourseById(course.id);
      
      // Kiểm tra lỗi từ response
      if (courseDetail && (courseDetail.code >= 400 || courseDetail.error || courseDetail.status >= 400)) {
        const errorMessage = getErrorMessage(courseDetail, "Không thể tải chi tiết khóa học");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setSelectedCourse(courseDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching course details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết khóa học. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Đang tải...</div>;

  return (
    <div className={Style.coursePage}>
      
      <div className={Style.container}>
        <div className={Style.top}>
            <Suspense fallback={<div>Đang tải...</div>}>
                <FilterableSearch 
                  placeholder="Tìm kiếm theo tên khóa học..."
                onChange={handleSearch} 
                onSearch={handleSearch} 
                  value={searchTerm}
                  statusFilter={selectedStatus}
                  onStatusChange={handleStatusChange}
                  statusOptions={[
                    { value: '', label: 'Tất cả trạng thái' },
                    { value: 'active', label: 'Hoạt động' },
                    { value: 'inactive', label: 'Không hoạt động' }
                  ]}
              />
            </Suspense>
            <Link href="/khoahoc/add">
              <button className={Style.addButton}>Thêm mới</button>
            </Link>
        </div>
      
        {/* Hiển thị kết quả tìm kiếm */}
        {searchFilter && (
          <div className={Style.searchInfo}>
            Kết quả tìm kiếm cho: <strong>{searchFilter}</strong> | 
            Tìm thấy: <strong>{courses.length}</strong> khóa học
            {statusFilter && (
              <span> | Trạng thái: <strong>{statusFilter === 'active' ? 'Hoạt động' : 'Không hoạt động'}</strong></span>
            )}
          </div>
        )}

        <table className={Style.table}>
          <thead>
            <tr>
              <td>Tên khóa học</td>
              <td>Mô tả</td>
              <td>Giá</td>
              <td>Trạng thái</td>
              <td>Hành động</td>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>
                  <div className={Style.courseName}>
                    {course.name}
                  </div>
                </td>
                <td>
                  <div className={Style.description}>
                    {course.description ? (course.description.length > 100 ? course.description.substring(0, 100) + '...' : course.description) : 'N/A'}
                  </div>
                </td>
                <td>{formatCurrency(course.price)}</td>
                <td>
                  <span className={`${Style.status} ${course.status === 'active' ? Style.active : Style.inactive}`}>
                    {course.status === 'active' ? 'Hoạt động' : course.status === 'inactive' ? 'Không hoạt động' : course.status || 'N/A'}
                  </span>
                </td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(course)}
                    >
                      Xem
                    </button>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(course)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(course)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      
        <div className={Style.darkBg}>
          <Suspense fallback={<div>Đang tải...</div>}>
            <Pagination metadata={metadata || { page: 0, totalPages: 1, count: courses.length, totalElements: courses.length }} />
          </Suspense>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Sửa khóa học</h2>
              <form onSubmit={handleEditSubmit}>
                <div className={Style.formGroup}>
                  <label>Tên khóa học:</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Mô tả:</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows="4"
                    placeholder="Nhập mô tả khóa học"
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Giá (VNĐ):</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    placeholder="Nhập giá (để trống nếu miễn phí)"
                    min="0"
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Trạng thái:</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    required
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
                <div className={Style.modalButtons}>
                  <button type="submit" className={Style.saveButton}>Lưu thay đổi</button>
                  <button 
                    type="button" 
                    className={Style.cancelButton}
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Xóa khóa học</h2>
              <p>Bạn có chắc chắn muốn xóa khóa học "{selectedCourse?.name}"?</p>
              <div className={Style.modalButtons}>
                <button 
                  className={Style.deleteButton}
                  onClick={handleDeleteConfirm}
                >
                  Xóa
                </button>
                <button 
                  className={Style.cancelButton}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Chi tiết khóa học</h2>
              <div className={Style.detailContent}>
                <div className={Style.detailItem}>
                  <label>Tên khóa học:</label>
                  <span>{selectedCourse?.name}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Mô tả:</label>
                  <span>{selectedCourse?.description || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Giá:</label>
                  <span>{formatCurrency(selectedCourse?.price)}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Trạng thái:</label>
                  <span className={`${Style.status} ${selectedCourse?.status === 'active' ? Style.active : Style.inactive}`}>
                    {selectedCourse?.status === 'active' ? 'Hoạt động' : selectedCourse?.status === 'inactive' ? 'Không hoạt động' : selectedCourse?.status || 'N/A'}
                  </span>
                </div>
                <div className={Style.detailItem}>
                  <label>Ngày tạo:</label>
                  <span>{selectedCourse?.createdAt ? new Date(selectedCourse.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Cập nhật lần cuối:</label>
                  <span>{selectedCourse?.updatedAt ? new Date(selectedCourse.updatedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
              <div className={Style.modalButtons}>
                <button 
                  className={Style.cancelButton}
                  onClick={() => setShowViewModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

