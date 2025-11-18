"use client";
import React, { useState, useEffect } from "react";
import Style from "./hvtiemnang.module.css";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { leadService } from "../api/lead/leadService";
import { campaignService } from "../api/campaign/campaignService";
import { courseService } from "../api/course/courseService";
import Image from "next/image";
import LogoutButton from "@/app/components/LogoutButton/LogoutButton";
import Link from "next/link";
import toast from "react-hot-toast";

const Page = () => {
  
  // Utility function to extract error message from API response
  const getErrorMessage = (error, defaultMessage) => {
    // Check if error has response data with message
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Check if error object has message property directly (API response)
    if (error?.message) {
      return error.message;
    }
    
    // Check if error is response object with code/status
    if (error?.code >= 400 || error?.status >= 400) {
      return error.message || `Lỗi ${error.code || error.status}`;
    }
    
    // Check if error is string
    if (typeof error === 'string') {
      return error;
    }
    
    // Debug log for unhandled error formats
    console.log("Unhandled error format:", error);
    
    // Fallback to default message
    return defaultMessage;
  };
  const [leads, setLeads] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [campaignNameSearch, setCampaignNameSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SDT: '',
    NgaySinh: '',
    GioiTinh: '',
    TrangThai: '',
    MaCD: ''
  });
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");
  
  // Lấy các tham số lọc từ URL
  const nameFilter = searchParams.get("name") || "";
  const statusFilter = searchParams.get("status") || "";
  const campaignNameFilter = searchParams.get("campaignName") || "";

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignService.getCampaigns({ page: 1, size: 100 });
        if (response && response.data) {
          setCampaigns(response.data);
        } else if (Array.isArray(response)) {
          setCampaigns(response);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      }
    };
    fetchCampaigns();
  }, []);

  // Sync state với URL parameters
  useEffect(() => {
    setSearchTerm(nameFilter);
    setSelectedStatus(statusFilter);
    setCampaignNameSearch(campaignNameFilter);
  }, [nameFilter, statusFilter, campaignNameFilter]);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter, campaignNameFilter);
  }, [currentPage, itemsPerPage, nameFilter, statusFilter, campaignNameFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== nameFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ name: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, nameFilter]);

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
    params.set("page", "0");
    
    // Cập nhật URL
    replace(`${pathname}?${params}`);
  };

  const fetchLeads = async (page, pageSize, name = "", state = "", campaignName = "") => {
    try {
      setLoading(true);
      
      // Sử dụng leadService để lấy dữ liệu từ API
      const response = await leadService.getLeads({
        page: page + 1, // API sử dụng page bắt đầu từ 1
        size: pageSize,
        search: name,
        status: state,
        campaignName: campaignName
      });
      
      console.log("API Response (Leads):", response);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách học viên tiềm năng");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setLeads([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        setLeads(response.items);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page - 1, // Convert to 0-based for pagination component
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Leads API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setLeads(response);
        setMetadata({
          page: page,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setLeads([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setLeads([]);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách học viên tiềm năng. Vui lòng thử lại!");
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


  const handleEdit = async (lead) => {
    try {
      setSelectedLead(lead);
      setFormData({
        HoTen: lead.fullName || lead.HoTen || '',
        Email: lead.email || lead.Email || '',
        SDT: lead.phone || lead.phoneNumber || lead.SDT || '',
        NgaySinh: lead.birthDate || lead.NgaySinh || '',
        GioiTinh: lead.gender || lead.GioiTinh || '',
        TrangThai: lead.status || lead.TrangThai || 'new',
        MaCD: lead.campaignId || lead.MaCD || ''
      });
      setShowEditModal(true);
      
      toast.success(`Đang chỉnh sửa học viên tiềm năng: ${lead.fullName || lead.HoTen}`, {
        duration: 2000,
        position: "top-right"
      });
    } catch (err) {
      console.error("Error preparing edit form:", err);
      const errorMessage = getErrorMessage(err, "Không thể mở form chỉnh sửa. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  const handleView = async (lead) => {
    try {
      setSelectedLead(lead);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching lead details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleConvert = async (lead) => {
    setSelectedLead(lead);
    setSelectedCourseId(null);
    setShowConvertModal(true);
    
    // Fetch courses when opening convert modal
    try {
      const coursesResponse = await courseService.getCourses({ 
        page: 1, 
        size: 100,
        status: 'active'
      });
      if (coursesResponse && coursesResponse.items) {
        setCourses(coursesResponse.items);
      } else if (Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Không thể tải danh sách khóa học", {
        duration: 3000,
        position: "top-center"
      });
    }
  };

  // Function để lấy class CSS cho trạng thái
  const getStatusClass = (status) => {
    switch (status) {
      case 'INTERESTED':
        return Style.interested;
      case 'CONTACTED':
        return Style.contacted;
      case 'QUALIFIED':
        return Style.qualified;
      case 'CONVERTED':
        return Style.converted;
      case 'LOST':
        return Style.lost;
      default:
        return Style.default;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.HoTen.trim()) {
      toast.error("Họ tên không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    if (!formData.Email.trim()) {
      toast.error("Email không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật học viên tiềm năng...", { id: "edit-lead" });
      
      const response = await leadService.updateLead(selectedLead.id, {
        fullName: formData.HoTen.trim(),
        email: formData.Email.trim(),
        phone: formData.SDT.trim(),
        status: formData.TrangThai || 'new',
        interestLevel: 'medium',
        campaignId: formData.MaCD ? Number(formData.MaCD) : null
      });
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật học viên tiềm năng");
        toast.error(errorMessage, {
          id: "edit-lead",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật học viên tiềm năng "${formData.HoTen}" thành công!`, {
        id: "edit-lead",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter, campaignNameFilter);
    } catch (err) {
      console.error("Error updating lead:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-lead",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa học viên tiềm năng...", { id: "delete-lead" });
      
      const response = await leadService.deleteLead(selectedLead.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa học viên tiềm năng");
        toast.error(errorMessage, {
          id: "delete-lead",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa học viên tiềm năng "${selectedLead?.fullName || selectedLead?.HoTen}" thành công!`, {
        id: "delete-lead",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter, campaignNameFilter);
    } catch (err) {
      console.error("Error deleting lead:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa học viên tiềm năng. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-lead",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.categoryy}>
      
      <div className={Style.container}>
      <div className={Style.top}>
        <h1>Quản lý Học viên Tiềm năng (Leads)</h1>
        <div className={Style.topRight}>
          <div className={Style.searchGroup}>
            <FilterableSearch 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              onChange={handleSearch}
              onSearch={handleSearch}
              value={searchTerm}
              statusFilter={selectedStatus}
              onStatusChange={handleStatusChange}
              statusOptions={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'INTERESTED', label: 'Quan tâm' },
                { value: 'CONTACTED', label: 'Đã liên hệ' },
                { value: 'QUALIFIED', label: 'Đủ điều kiện' },
                { value: 'CONVERTED', label: 'Đã chuyển đổi' },
                { value: 'LOST', label: 'Mất liên lạc' }
              ]}
            />
          </div>
          <div className={Style.searchGroup}>
            <FilterableSearch 
              placeholder="Tìm kiếm theo tên chiến dịch (CD)..." 
              onChange={handleCampaignNameSearch}
              onSearch={handleCampaignNameSearch}
              value={campaignNameSearch}
              statusFilter={undefined}
              onStatusChange={undefined}
              statusOptions={undefined}
            />
          </div>
          <Link href="/hvtiemnang/add" className={Style.addButton}>
            Thêm Lead mới
          </Link>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {(nameFilter || campaignNameFilter) && (
        <div className={Style.searchInfo}>
          {nameFilter && (
            <span>Kết quả tìm kiếm: <strong>{nameFilter}</strong></span>
          )}
          {campaignNameFilter && (
            <span>{nameFilter ? ' | ' : ''}Tên CD: <strong>{campaignNameFilter}</strong></span>
          )}
          <span> | Tìm thấy: <strong>{leads.length}</strong> học viên tiềm năng</span>
          {selectedStatus && (
            <span> | Trạng thái: <strong>{selectedStatus}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Họ tên</td>
            <td>Email</td>
            <td>Số điện thoại</td>
            <td>Ngày sinh</td>
            <td>Giới tính</td>
            <td>Trạng thái</td>
            <td>Chiến dịch</td>
            <td>Thao tác</td>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={8} className={Style.noData}>
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
              return (
                <tr key={lead.id || lead.MaHVTN}>
                  <td>{lead.fullName || lead.HoTen}</td>
                  <td>{lead.email || lead.Email}</td>
                  <td>{lead.phone || lead.phoneNumber || lead.SDT}</td>
                  <td>{lead.birthDate || lead.NgaySinh ? new Date(lead.birthDate || lead.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>{lead.gender || lead.GioiTinh || 'N/A'}</td>
                  <td>
                    <span className={`${Style.status} ${getStatusClass(lead.status || lead.TrangThai)}`}>
                      {lead.status === 'new' ? 'Mới' : lead.status === 'contacted' ? 'Đã liên hệ' : lead.status === 'qualified' ? 'Đủ điều kiện' : lead.status === 'converted' ? 'Đã chuyển đổi' : lead.status === 'lost' ? 'Mất liên lạc' : lead.status || lead.TrangThai || 'N/A'}
                    </span>
                  </td>
                  <td>{lead.campaignName || 'N/A'}</td>
                  <td>
                    <div className={Style.buttons}>
                      <button 
                        className={`${Style.button} ${Style.view}`}
                        onClick={() => handleView(lead)}
                      >
                        Xem
                      </button>
                      <button 
                        className={`${Style.button} ${Style.edit}`}
                        onClick={() => handleEdit(lead)}
                      >
                        Sửa
                      </button>
                      <button 
                        className={`${Style.button} ${Style.convert}`}
                        onClick={() => handleConvert(lead)}
                      >
                        Chuyển đổi
                      </button>
                      <button 
                        className={`${Style.button} ${Style.delete}`}
                        onClick={() => handleDelete(lead)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className={Style.darkBg}>
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: leads.length, totalElements: leads.length }} />
      </div>

      {/* Add Modal */}
      

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chỉnh sửa Học viên Tiềm năng</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={formData.HoTen}
                  onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Số điện thoại:</label>
                <input
                  type="tel"
                  value={formData.SDT}
                  onChange={(e) => setFormData({...formData, SDT: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  value={formData.NgaySinh}
                  onChange={(e) => setFormData({...formData, NgaySinh: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Giới tính:</label>
                <select 
                  value={formData.GioiTinh}
                  onChange={(e) => setFormData({...formData, GioiTinh: e.target.value})}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select 
                  value={formData.TrangThai}
                  onChange={(e) => setFormData({...formData, TrangThai: e.target.value})}
                >
                  <option value="INTERESTED">Quan tâm</option>
                  <option value="CONTACTED">Đã liên hệ</option>
                  <option value="QUALIFIED">Đủ điều kiện</option>
                  <option value="CONVERTED">Đã chuyển đổi</option>
                  <option value="LOST">Mất liên lạc</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Chiến dịch:</label>
                <select 
                  value={formData.MaCD}
                  onChange={(e) => setFormData({...formData, MaCD: e.target.value})}
                >
                  <option value="">Chọn chiến dịch</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id || campaign.MaCD} value={campaign.id || campaign.MaCD}>
                      {campaign.name || campaign.TenCD}
                    </option>
                  ))}
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
            <h2>Xóa Học viên Tiềm năng</h2>
            <p>Bạn có chắc chắn muốn xóa {selectedLead?.HoTen}?</p>
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
            <h2>Chi tiết Học viên Tiềm năng</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Họ tên:</label>
                <span>{selectedLead?.HoTen}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Email:</label>
                <span>{selectedLead?.Email}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Số điện thoại:</label>
                <span>{selectedLead?.SDT}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngày sinh:</label>
                <span>{new Date(selectedLead?.NgaySinh).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Giới tính:</label>
                <span>{selectedLead?.GioiTinh}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Trạng thái:</label>
                <span className={`${Style.status} ${getStatusClass(selectedLead?.TrangThai)}`}>
                  {selectedLead?.TrangThai}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Chiến dịch:</label>
                <span>{selectedLead?.campaignName || campaigns.find(c => (c.id || c.MaCD) === (selectedLead?.campaignId || selectedLead?.MaCD))?.name || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngày đăng ký:</label>
                <span>{new Date(selectedLead?.NgayDangKy).toLocaleString('vi-VN')}</span>
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

      {/* Convert Modal */}
      {showConvertModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chuyển đổi thành Học viên</h2>
            <p>Bạn có chắc chắn muốn chuyển đổi <strong>{selectedLead?.fullName || selectedLead?.HoTen}</strong> thành học viên chính thức?</p>
            
            {/* Form chọn khóa học */}
            <div className={Style.formGroup} style={{marginBottom: '20px', marginTop: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#dee2e6'}}>
                Chọn khóa học: <span style={{color: '#ef4444'}}>*</span>
              </label>
              <select
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#313a46',
                  border: '1px solid #404954',
                  borderRadius: '6px',
                  color: '#dee2e6',
                  fontSize: '0.875rem'
                }}
                required
              >
                <option value="">-- Chọn khóa học --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} {course.price ? `- ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}` : ''}
                  </option>
                ))}
              </select>
              <div style={{fontSize: '0.75rem', color: '#8391a2', marginTop: '8px'}}>
                <small>* Doanh thu sẽ được tính từ giá khóa học đã chọn</small>
              </div>
            </div>

            <div className={Style.modalButtons}>
              <button 
                className={Style.convertButton}
                onClick={async () => {
                  if (!selectedCourseId) {
                    toast.error("Vui lòng chọn khóa học trước khi chuyển đổi!", {
                      duration: 3000,
                      position: "top-center"
                    });
                    return;
                  }
                  
                  try {
                    toast.loading("Đang chuyển đổi học viên tiềm năng...", { id: "convert-lead" });
                    
                    const response = await leadService.convertLead(selectedLead.id, { courseId: selectedCourseId });
                    
                    // Kiểm tra lỗi từ response
                    if (response && (response.code >= 400 || response.error || response.status >= 400)) {
                      const errorMessage = getErrorMessage(response, "Không thể chuyển đổi học viên tiềm năng");
                      toast.error(errorMessage, {
                        id: "convert-lead",
                        duration: 4000,
                        position: "top-center"
                      });
                      return;
                    }
                    
                    const selectedCourse = courses.find(c => c.id === selectedCourseId);
                    const coursePrice = selectedCourse?.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCourse.price) : '';
                    
                    toast.success(`Đã chuyển đổi ${selectedLead?.fullName || selectedLead?.HoTen} thành học viên chính thức! ${coursePrice ? `(Khóa học: ${selectedCourse.name})` : ''}`, {
                      id: "convert-lead",
                      duration: 4000,
                      position: "top-center"
                    });
                    
                    setShowConvertModal(false);
                    setSelectedCourseId(null);
                    fetchLeads(currentPage, itemsPerPage, nameFilter, statusFilter, campaignNameFilter);
                  } catch (err) {
                    console.error("Error converting lead:", err);
                    const errorMessage = getErrorMessage(err, "Không thể chuyển đổi học viên tiềm năng. Vui lòng thử lại!");
                    toast.error(errorMessage, {
                      id: "convert-lead",
                      duration: 4000,
                      position: "top-center"
                    });
                  }
                }}
              >
                Chuyển đổi
              </button>
              <button 
                className={Style.cancelButton}
                onClick={() => {
                  setShowConvertModal(false);
                  setSelectedCourseId(null);
                }}
              >
                Hủy
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