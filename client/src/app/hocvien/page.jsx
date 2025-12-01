'use client';
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import Image from "next/image";
import Link from "next/link";
import { studentService } from "../api/student/studentService";
import images from "../img/index";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";
import Style from "./users.module.css";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [campaignNameSearch, setCampaignNameSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'active',
    enrollmentStatus: 'pending',
    campaignId: null,
    channelId: null,
    assignedStaffId: null,
    newStudent: false
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    newStudentsCount: 0
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 1)
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Lấy các tham số lọc từ URL
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const campaignNameFilter = searchParams.get("campaignName") || "";

  // Sync state với URL parameters
  useEffect(() => {
    setSearchTerm(searchFilter);
    setSelectedStatus(statusFilter);
    setCampaignNameSearch(campaignNameFilter);
  }, [searchFilter, statusFilter, campaignNameFilter]);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchStudents(currentPage, itemsPerPage, searchFilter, statusFilter, campaignNameFilter);
  }, [currentPage, itemsPerPage, searchFilter, statusFilter, campaignNameFilter]);

  // Fetch statistics on mount, khi khoảng ngày hoặc bộ lọc thay đổi
  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, searchFilter, statusFilter, campaignNameFilter]);

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

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (campaignNameSearch !== campaignNameFilter) {
        // Cập nhật URL với từ khóa tìm kiếm chiến dịch
        updateFilters({ campaignName: campaignNameSearch });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [campaignNameSearch, campaignNameFilter]);

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

  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const response = await studentService.getStudentSummary({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        search: searchFilter,
        status: statusFilter,
        campaignName: campaignNameFilter
      });
      
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        console.error("Error fetching statistics:", response);
        return;
      }
      
      // Nếu có filter thời gian, dùng total và newStudentsCount (đã lọc theo filter + thời gian)
      // Nếu không có filter thời gian, dùng totalAll và newStudentsCountAll (đã lọc theo filter, không giới hạn thời gian)
      // Cả hai đều đã được lọc theo search/status/campaignName
      const hasDateFilter = dateRange.startDate || dateRange.endDate;
      setStatistics({
        total: hasDateFilter 
          ? (response?.total || 0)  // Có filter thời gian: dùng total (đã lọc theo filter + thời gian)
          : (response?.totalAll || response?.total || 0), // Không có filter thời gian: dùng totalAll (đã lọc theo filter)
        newStudentsCount: hasDateFilter
          ? (response?.newStudentsCount || 0)  // Có filter thời gian: dùng newStudentsCount
          : (response?.newStudentsCountAll || response?.newStudentsCount || 0) // Không có filter thời gian: dùng newStudentsCountAll
      });
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setStatisticsLoading(false);
    }
  };

  const fetchStudents = async (page, size, search = "", status = "", campaignName = "") => {
    try {
      setLoading(true);
      const response = await studentService.getStudents({ 
        page, 
        size, 
        search, 
        status,
        campaignName,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      
      console.log("API Response (Students):", response); // Debug thông tin API trả về
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách học viên");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setStudents([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        setStudents(response.items);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page, // Backend trả về 1-based, giữ nguyên
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Students API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setStudents(response);
        setMetadata({
          page: 1,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setStudents([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách học viên. Vui lòng thử lại!");
      setStudents([]);
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

  const handleCampaignNameSearch = (value) => {
    setCampaignNameSearch(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({
      fullName: student.fullName || '',
      email: student.email || '',
      phone: student.phone || '',
      status: student.status || 'active',
      enrollmentStatus: student.enrollmentStatus || 'pending',
      campaignId: student.campaignId || null,
      channelId: student.channelId || null,
      assignedStaffId: student.assignedStaffId || null,
      newStudent: student.newStudent || false
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.fullName.trim()) {
      toast.error("Họ tên không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    if (!editForm.email.trim()) {
      toast.error("Email không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error("Email không đúng định dạng!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật học viên...", { id: "edit-student" });
      
      const response = await studentService.updateStudent(selectedStudent.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
        enrollmentStatus: editForm.enrollmentStatus,
        campaignId: editForm.campaignId,
        channelId: editForm.channelId,
        assignedStaffId: editForm.assignedStaffId,
        newStudent: editForm.newStudent
      });
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật học viên");
        toast.error(errorMessage, {
          id: "edit-student",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật học viên "${editForm.fullName}" thành công!`, {
        id: "edit-student",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchStudents(currentPage, itemsPerPage, searchFilter, statusFilter, campaignNameFilter);
      fetchStatistics();
    } catch (err) {
      console.error("Error updating student:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật học viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-student",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa học viên...", { id: "delete-student" });
      
      const response = await studentService.deleteStudent(selectedStudent.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa học viên");
        toast.error(errorMessage, {
          id: "delete-student",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa học viên "${selectedStudent.fullName}" thành công!`, {
        id: "delete-student",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchStudents(currentPage, itemsPerPage, searchFilter, statusFilter, campaignNameFilter);
      fetchStatistics();
    } catch (err) {
      console.error("Error deleting student:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa học viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-student",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (student) => {
    try {
      const studentDetail = await studentService.getStudentById(student.id);
      
      // Kiểm tra lỗi từ response
      if (studentDetail && (studentDetail.code >= 400 || studentDetail.error || studentDetail.status >= 400)) {
        const errorMessage = getErrorMessage(studentDetail, "Không thể tải chi tiết học viên");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setSelectedStudent(studentDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching student details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết học viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Đang tải...</div>;

  return (
    <div className={Style.userr}>
      
      <div className={Style.container}>
        {/* Statistics Cards */}
        <div className={Style.statisticsSection}>
          <div className={Style.statisticsHeader}>
            <h2>Thống kê nhanh</h2>
            <div className={Style.dateFilter}>
              <div className={Style.dateGroup}>
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className={Style.dateInput}
                />
              </div>
              <div className={Style.dateGroup}>
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className={Style.dateInput}
                />
              </div>
            </div>
          </div>
          <div className={Style.statisticsCards}>
            <div className={Style.statCard}>
              <div className={Style.statCardIcon}>👥</div>
              <div className={Style.statCardContent}>
                <h3>Tổng số học viên</h3>
                <p className={Style.statCardValue}>
                  {statisticsLoading ? '...' : statistics.total.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className={Style.statCard}>
              <div className={Style.statCardIcon}>🆕</div>
              <div className={Style.statCardContent}>
                <h3>Số học viên mới</h3>
                <p className={Style.statCardValue}>
                  {statisticsLoading ? '...' : statistics.newStudentsCount.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={Style.top}>
            <Suspense fallback={<div>Đang tải...</div>}>
                <FilterableSearch 
                  placeholder="Tìm kiếm theo tên, email, username, hoặc số điện thoại..."
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
            <div className={Style.searchGroup}>
              <Suspense fallback={<div>Đang tải...</div>}>
                <FilterableSearch 
                  placeholder="Tìm kiếm theo tên chiến dịch (CD)..."
                  onChange={handleCampaignNameSearch} 
                  onSearch={handleCampaignNameSearch} 
                  value={campaignNameSearch}
                />
              </Suspense>
            </div>
            <Link href="/hocvien/add">
              <button className={Style.addButton}>Thêm mới</button>
            </Link>
        </div>
      
        <table className={Style.table}>
          <thead>
            <tr>
              <td>Họ tên</td>
              <td>Email</td>
              <td>Số điện thoại</td>
              <td>Trạng thái</td>
              <td>Trạng thái đăng ký</td>
              <td>Chiến dịch</td>
              <td>Hành động</td>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--textSoft)' }}>
                  Không có dữ liệu học viên
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className={Style.user}>
                      {student.fullName}
                    </div>
                  </td>
                  <td>{student.email || 'N/A'}</td>
                  <td>{student.phone || 'N/A'}</td>
                  <td>
                    <span className={`${Style.status} ${student.status === 'active' ? Style.active : Style.inactive}`}>
                      {student.status === 'active' ? 'Hoạt động' : student.status === 'inactive' ? 'Không hoạt động' : student.status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`${Style.status} ${student.enrollmentStatus === 'enrolled' ? Style.active : Style.inactive}`}>
                      {student.enrollmentStatus === 'pending' ? 'Chờ xử lý' : student.enrollmentStatus === 'enrolled' ? 'Đã đăng ký' : student.enrollmentStatus === 'completed' ? 'Hoàn thành' : student.enrollmentStatus || 'N/A'}
                    </span>
                  </td>
                  <td>{student.campaignName || 'N/A'}</td>
                  <td>
                    <div className={Style.buttons}>
                      <button 
                        className={`${Style.button} ${Style.view}`}
                        onClick={() => handleView(student)}
                      >
                        Xem
                      </button>
                      <button 
                        className={`${Style.button} ${Style.edit}`}
                        onClick={() => handleEdit(student)}
                      >
                        Sửa
                      </button>
                      <button 
                        className={`${Style.button} ${Style.delete}`}
                        onClick={() => handleDelete(student)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      
        <div className={Style.darkBg}>
          <Suspense fallback={<div>Đang tải...</div>}>
            <Pagination metadata={metadata || { page: 1, totalPages: 1, count: students.length, totalElements: students.length }} />
          </Suspense>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <h2>Sửa học viên</h2>
              <form onSubmit={handleEditSubmit}>
                <div className={Style.formGroup}>
                  <label>Họ tên:</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    required
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
                <div className={Style.formGroup}>
                  <label>Trạng thái đăng ký:</label>
                  <select
                    value={editForm.enrollmentStatus}
                    onChange={(e) => setEditForm({...editForm, enrollmentStatus: e.target.value})}
                    required
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="enrolled">Đã đăng ký</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>
                <div className={Style.formGroup}>
                  <label>Học viên mới:</label>
                  <input
                    type="checkbox"
                    checked={editForm.newStudent}
                    onChange={(e) => setEditForm({...editForm, newStudent: e.target.checked})}
                  />
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
              <h2>Xóa học viên</h2>
              <p>Bạn có chắc chắn muốn xóa học viên "{selectedStudent?.fullName}"?</p>
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
              <h2>Chi tiết học viên</h2>
              <div className={Style.detailContent}>
                <div className={Style.detailItem}>
                  <label>Họ tên:</label>
                  <span>{selectedStudent?.fullName}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Email:</label>
                  <span>{selectedStudent?.email || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Số điện thoại:</label>
                  <span>{selectedStudent?.phone || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Trạng thái:</label>
                  <span className={`${Style.status} ${selectedStudent?.status === 'active' ? Style.active : Style.inactive}`}>
                    {selectedStudent?.status === 'active' ? 'Hoạt động' : selectedStudent?.status === 'inactive' ? 'Không hoạt động' : selectedStudent?.status || 'N/A'}
                  </span>
                </div>
                <div className={Style.detailItem}>
                  <label>Trạng thái đăng ký:</label>
                  <span className={`${Style.status} ${selectedStudent?.enrollmentStatus === 'enrolled' ? Style.active : Style.inactive}`}>
                    {selectedStudent?.enrollmentStatus === 'pending' ? 'Chờ xử lý' : selectedStudent?.enrollmentStatus === 'enrolled' ? 'Đã đăng ký' : selectedStudent?.enrollmentStatus === 'completed' ? 'Hoàn thành' : selectedStudent?.enrollmentStatus || 'N/A'}
                  </span>
                </div>
                <div className={Style.detailItem}>
                  <label>Chiến dịch:</label>
                  <span>{selectedStudent?.campaignName || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Kênh:</label>
                  <span>{selectedStudent?.channelName || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Nhân viên phụ trách:</label>
                  <span>{selectedStudent?.assignedStaffName || 'N/A'}</span>
                </div>
                <div className={Style.detailItem}>
                  <label>Học viên mới:</label>
                  <span>{selectedStudent?.newStudent ? 'Có' : 'Không'}</span>
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