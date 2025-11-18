"use client";
import React, { useState, useEffect } from "react";
import Style from "./nhanvien.module.css";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";
import { staffService } from "../api/staff/staffService";

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
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    department: '',
    status: 'active',
    email: '',
    phoneNumber: ''
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang và các bộ lọc từ URL
  const currentPage = parseInt(searchParams.get("page") || "0");
  const nameFilter = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const roleFilter = searchParams.get("role") || "";
  const departmentFilter = searchParams.get("department") || "";

  // Sync state với URL parameters
  useEffect(() => {
    setSearchTerm(nameFilter);
    setSelectedStatus(statusFilter);
    setSelectedRole(roleFilter);
    setSelectedDepartment(departmentFilter);
  }, [nameFilter, statusFilter, roleFilter, departmentFilter]);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchStaff(currentPage, itemsPerPage, nameFilter, statusFilter, roleFilter, departmentFilter);
  }, [currentPage, itemsPerPage, nameFilter, statusFilter, roleFilter, departmentFilter]);


  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== nameFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ search: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, nameFilter]);

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
    params.set("page", "0");
    
    // Cập nhật URL
    replace(`${pathname}?${params}`);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status: status });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    updateFilters({ role: role });
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    updateFilters({ department: department });
  };

  // Fetch staff members
  const fetchStaff = async (page, pageSize, search = "", status = "", role = "", department = "") => {
    try {
      setLoading(true);
      
      const response = await staffService.getStaffMembers({
        page: page + 1, // API sử dụng page bắt đầu từ 1
        size: pageSize,
        search: search,
        status: status,
        role: role,
        department: department
      });
      
      console.log("API Response (Staff):", response);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách nhân viên");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setStaffMembers([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        setStaffMembers(response.items);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page - 1, // Convert to 0-based for pagination component
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Staff API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setStaffMembers(response);
        setMetadata({
          page: page,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setStaffMembers([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaffMembers([]);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách nhân viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (staff) => {
    try {
      setLoading(true);
      
      // Get detailed staff info
      const staffDetail = await staffService.getStaffById(staff.id);
      
      // Kiểm tra lỗi từ response
      if (staffDetail && (staffDetail.code >= 400 || staffDetail.error || staffDetail.status >= 400)) {
        const errorMessage = getErrorMessage(staffDetail, "Không thể tải chi tiết nhân viên");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      // Set the selected staff
      setSelectedStaff(staffDetail || staff);
      
      // Set the form data
      setEditForm({
        name: (staffDetail || staff).name || (staffDetail || staff).fullName || '',
        role: (staffDetail || staff).role || '',
        department: (staffDetail || staff).department || '',
        status: (staffDetail || staff).status || 'active',
        email: (staffDetail || staff).email || '',
        phoneNumber: (staffDetail || staff).phoneNumber || (staffDetail || staff).phone || ''
      });
      
      // Show the edit modal
      setShowEditModal(true);
      
      toast.success(`Đang chỉnh sửa nhân viên: ${(staffDetail || staff).name || (staffDetail || staff).fullName}`, {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error("Error preparing staff edit form:", err);
      const errorMessage = getErrorMessage(err, "Không thể mở form chỉnh sửa. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.name.trim()) {
      toast.error("Tên nhân viên không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!editForm.role.trim()) {
      toast.error("Vai trò không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật nhân viên...", { id: "edit-staff" });
      
      const response = await staffService.updateStaff(selectedStaff.id, {
        name: editForm.name,
        role: editForm.role,
        department: editForm.department,
        status: editForm.status,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber
      });
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật nhân viên");
        toast.error(errorMessage, {
          id: "edit-staff",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật nhân viên "${editForm.name}" thành công!`, {
        id: "edit-staff",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchStaff(currentPage, itemsPerPage, nameFilter, statusFilter, roleFilter, departmentFilter);
    } catch (err) {
      console.error("Error updating staff:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật nhân viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-staff",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa nhân viên...", { id: "delete-staff" });
      
      const response = await staffService.deleteStaff(selectedStaff.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa nhân viên");
        toast.error(errorMessage, {
          id: "delete-staff",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa nhân viên "${selectedStaff.name || selectedStaff.fullName}" thành công!`, {
        id: "delete-staff",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchStaff(currentPage, itemsPerPage, nameFilter, statusFilter, roleFilter, departmentFilter);
    } catch (err) {
      console.error("Error deleting staff:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa nhân viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-staff",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (staff) => {
    try {
      const staffDetail = await staffService.getStaffById(staff.id);
      
      // Kiểm tra lỗi từ response
      if (staffDetail && (staffDetail.code >= 400 || staffDetail.error || staffDetail.status >= 400)) {
        const errorMessage = getErrorMessage(staffDetail, "Không thể tải chi tiết nhân viên");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setSelectedStaff(staffDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching staff details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết nhân viên. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Đang tải...</div>;

  return (
    <div className={Style.productt}>
      <div className={Style.header}>
        <h1></h1>
        <LogoutButton />
      </div>
      <div className={Style.container}>
      <div className={Style.top}>
        <h1>Quản lý nhân viên</h1>
        <div className={Style.topRight}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên nhân viên..." 
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
          <div className={Style.categoryFilter}>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className={Style.categorySelect}
            >
              <option value="">Tất cả vai trò</option>
              <option value="sales">Bán hàng</option>
              <option value="marketing">Marketing</option>
              <option value="admin">Quản trị</option>
            </select>
          </div>
          <div className={Style.categoryFilter}>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className={Style.categorySelect}
            >
              <option value="">Tất cả phòng ban</option>
              <option value="Sales">Bán hàng</option>
              <option value="Marketing">Marketing</option>
              <option value="Admin">Quản trị</option>
            </select>
          </div>
          <Link href="/nhanvien/add" className={Style.addButton}>
            Thêm nhân viên mới
          </Link>
        </div>
      </div>

      {/* Hiển thị loading indicator */}
      {loading && (
        <div className={Style.loadingOverlay}>
          <div className={Style.loadingSpinner}></div>
        </div>
      )}
      {/* Hiển thị kết quả tìm kiếm */}
      {(nameFilter || statusFilter || roleFilter || departmentFilter) && (
        <div className={Style.searchInfo}>
          {nameFilter && (
            <>Kết quả tìm kiếm cho: <strong>{nameFilter}</strong> | </>
          )}
          Tìm thấy: <strong>{staffMembers.length}</strong> nhân viên
          {statusFilter && (
            <span> | Trạng thái: <strong>{statusFilter}</strong></span>
          )}
          {roleFilter && (
            <span> | Vai trò: <strong>{roleFilter}</strong></span>
          )}
          {departmentFilter && (
            <span> | Phòng ban: <strong>{departmentFilter}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên</td>
            <td>Email</td>
            <td>Số điện thoại</td>
            <td>Vai trò</td>
            <td>Phòng ban</td>
            <td>Trạng thái</td>
            <td>Hành động</td>
          </tr>
        </thead>
        <tbody>
          {staffMembers.length === 0 ? (
            <tr>
              <td colSpan={7} className={Style.noData}>
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            staffMembers.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.name || staff.fullName}</td>
                <td>{staff.email || 'N/A'}</td>
                <td>{staff.phoneNumber || staff.phone || 'N/A'}</td>
                <td>{staff.role || 'N/A'}</td>
                <td>{staff.department || 'N/A'}</td>
                <td>
                  <span className={`${Style.status} ${staff.status === 'active' ? Style.active : Style.inactive}`}>
                    {staff.status === 'active' ? 'Hoạt động' : staff.status === 'inactive' ? 'Không hoạt động' : staff.status || 'N/A'}
                  </span>
                </td>
                <td>
                  <div className={Style.buttons}>
                    <button
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(staff)}
                    >
                      Xem
                    </button>
                    <button
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(staff)}
                    >
                      Sửa
                    </button>
                    <button
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(staff)}
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

      <div className={Style.pagination}>
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: staffMembers.length, totalElements: staffMembers.length }} />
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Sửa nhân viên</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Tên:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Vai trò:</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  required
                >
                  <option value="">Chọn vai trò</option>
                  <option value="sales">Bán hàng</option>
                  <option value="marketing">Marketing</option>
                  <option value="admin">Quản trị</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Phòng ban:</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                >
                  <option value="">Chọn phòng ban</option>
                  <option value="Sales">Bán hàng</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Admin">Quản trị</option>
                </select>
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
            <h2>Xóa nhân viên</h2>
            <p>Bạn có chắc chắn muốn xóa nhân viên "{selectedStaff?.name || selectedStaff?.fullName}"?</p>
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
            <h2>Chi tiết nhân viên</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Tên:</label>
                <span>{selectedStaff?.name || selectedStaff?.fullName}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Email:</label>
                <span>{selectedStaff?.email || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Số điện thoại:</label>
                <span>{selectedStaff?.phoneNumber || selectedStaff?.phone || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Vai trò:</label>
                <span>{selectedStaff?.role === 'sales' ? 'Bán hàng' : selectedStaff?.role === 'marketing' ? 'Marketing' : selectedStaff?.role === 'admin' ? 'Quản trị' : selectedStaff?.role || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Phòng ban:</label>
                <span>{selectedStaff?.department === 'Sales' ? 'Bán hàng' : selectedStaff?.department === 'Marketing' ? 'Marketing' : selectedStaff?.department === 'Admin' ? 'Quản trị' : selectedStaff?.department || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Trạng thái:</label>
                <span className={`${Style.status} ${selectedStaff?.status === "active" ? Style.active : Style.inactive}`}>
                  {selectedStaff?.status === 'active' ? 'Hoạt động' : selectedStaff?.status === 'inactive' ? 'Không hoạt động' : selectedStaff?.status || 'N/A'}
                </span>
              </div>
              {selectedStaff?.createdAt && (
                <div className={Style.detailItem}>
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedStaff.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
              {selectedStaff?.updatedAt && (
                <div className={Style.detailItem}>
                  <label>Ngày cập nhật:</label>
                  <span>{new Date(selectedStaff.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
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