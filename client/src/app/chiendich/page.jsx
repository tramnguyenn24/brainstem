'use client';
import React, { useState, useEffect, Suspense } from "react";
import Style from "./chiendich.module.css";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import Link from "next/link";
import { campaignService } from "../api/campaign/campaignService";
import { channelService } from "../api/channel/channelService";
import { staffService } from "../api/staff/staffService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";

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
  const [campaigns, setCampaigns] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'running',
    channelId: null,
    ownerStaffId: null,
    budget: 0,
    spend: 0,
    roi: 0
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [channels, setChannels] = useState([]);
  const [staff, setStaff] = useState([]);
  
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

  // Fetch channels and staff for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [channelsResponse, staffResponse] = await Promise.all([
          channelService.getChannels({ page: 1, size: 100 }),
          staffService.getStaffMembers({ page: 1, size: 100 })
        ]);
        
        if (channelsResponse && channelsResponse.items) {
          setChannels(channelsResponse.items);
        } else if (Array.isArray(channelsResponse)) {
          setChannels(channelsResponse);
        }
        
        if (staffResponse && staffResponse.items) {
          setStaff(staffResponse.items);
        } else if (Array.isArray(staffResponse)) {
          setStaff(staffResponse);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchCampaigns(currentPage, itemsPerPage, searchFilter, statusFilter);
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

  const fetchCampaigns = async (page, size, search = "", status = "") => {
    try {
      setLoading(true);
      const response = await campaignService.getCampaigns({ 
        page, 
        size, 
        search, 
        status,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      
      console.log("API Response (Campaigns):", response);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách chiến dịch");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setCampaigns([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        setCampaigns(response.items);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page - 1, // Convert to 0-based for pagination component
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Campaigns API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setCampaigns(response);
        setMetadata({
          page: 0,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setCampaigns([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách chiến dịch. Vui lòng thử lại!");
      setCampaigns([]);
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

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setEditForm({
      name: campaign.name || '',
      status: campaign.status || 'running',
      channelId: campaign.channelId || null,
      ownerStaffId: campaign.ownerStaffId || null,
      budget: campaign.budget || 0,
      spend: campaign.spend || 0,
      roi: campaign.roi || 0
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.name.trim()) {
      toast.error("Tên chiến dịch không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật chiến dịch...", { id: "edit-campaign" });
      
      const response = await campaignService.updateCampaign(selectedCampaign.id, {
        name: editForm.name,
        status: editForm.status,
        channelId: editForm.channelId ? Number(editForm.channelId) : null,
        ownerStaffId: editForm.ownerStaffId ? Number(editForm.ownerStaffId) : null,
        budget: editForm.budget ? Number(editForm.budget) : 0,
        spend: editForm.spend ? Number(editForm.spend) : 0,
        roi: editForm.roi ? Number(editForm.roi) : 0
      });
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật chiến dịch");
        toast.error(errorMessage, {
          id: "edit-campaign",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật chiến dịch "${editForm.name}" thành công!`, {
        id: "edit-campaign",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchCampaigns(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (err) {
      console.error("Error updating campaign:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật chiến dịch. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-campaign",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa chiến dịch...", { id: "delete-campaign" });
      
      const response = await campaignService.deleteCampaign(selectedCampaign.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa chiến dịch");
        toast.error(errorMessage, {
          id: "delete-campaign",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa chiến dịch "${selectedCampaign.name}" thành công!`, {
        id: "delete-campaign",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchCampaigns(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (err) {
      console.error("Error deleting campaign:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa chiến dịch. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-campaign",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (campaign) => {
    try {
      const campaignDetail = await campaignService.getCampaignById(campaign.id);
      
      // Kiểm tra lỗi từ response
      if (campaignDetail && (campaignDetail.code >= 400 || campaignDetail.error || campaignDetail.status >= 400)) {
        const errorMessage = getErrorMessage(campaignDetail, "Không thể tải chi tiết chiến dịch");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setSelectedCampaign(campaignDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching campaign details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết chiến dịch. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return Style.active;
      case 'paused': return Style.warning;
      case 'completed': return Style.completed;
      default: return Style.inactive;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'running': return 'Đang chạy';
      case 'paused': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      default: return status || 'N/A';
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <Suspense fallback={<div>Loading...</div>}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên chiến dịch..."
            onChange={handleSearch} 
            onSearch={handleSearch} 
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'running', label: 'Đang chạy' },
              { value: 'paused', label: 'Tạm dừng' },
              { value: 'completed', label: 'Hoàn thành' }
            ]}
          />
        </Suspense>
        <Link href="/chiendich/add">
          <button className={Style.addButton}>Thêm chiến dịch</button>
        </Link>
      </div>
    
      {/* Hiển thị kết quả tìm kiếm */}
      {searchFilter && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{searchFilter}</strong> | 
          Tìm thấy: <strong>{campaigns.length}</strong> chiến dịch
          {statusFilter && (
            <span> | Trạng thái: <strong>{getStatusText(statusFilter)}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên chiến dịch</td>
            <td>Kênh</td>
            <td>Người phụ trách</td>
            <td>Ngân sách</td>
            <td>Đã chi</td>
            <td>ROI</td>
            <td>Trạng thái</td>
            <td>Hành động</td>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>
                <div className={Style.name}>
                  {campaign.name}
                </div>
              </td>
              <td>{campaign.channelName || 'N/A'}</td>
              <td>{campaign.ownerStaffName || 'N/A'}</td>
              <td>
                {campaign.budget ? new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(campaign.budget) : '0 VNĐ'}
              </td>
              <td>
                {campaign.spend ? new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND' 
                }).format(campaign.spend) : '0 VNĐ'}
              </td>
              <td>{campaign.roi != null ? `${Number(campaign.roi).toFixed(2)}x` : '0x'}</td>
              <td>
                <span className={`${Style.status} ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
              </td>
              <td>
                <div className={Style.buttons}>
                  <button 
                    className={`${Style.button} ${Style.view}`}
                    onClick={() => handleView(campaign)}
                  >
                    Xem
                  </button>
                  <button 
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(campaign)}
                  >
                    Sửa
                  </button>
                  <button 
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(campaign)}
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
        <Suspense fallback={<div>Loading...</div>}>
          <Pagination metadata={metadata || { page: 0, totalPages: 1, count: campaigns.length, totalElements: campaigns.length }} />
        </Suspense>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Sửa chiến dịch</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Tên chiến dịch:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
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
                  <option value="running">Đang chạy</option>
                  <option value="paused">Tạm dừng</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Kênh:</label>
                <select
                  value={editForm.channelId || ''}
                  onChange={(e) => setEditForm({...editForm, channelId: e.target.value ? Number(e.target.value) : null})}
                >
                  <option value="">Chọn kênh</option>
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                  ))}
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Người phụ trách:</label>
                <select
                  value={editForm.ownerStaffId || ''}
                  onChange={(e) => setEditForm({...editForm, ownerStaffId: e.target.value ? Number(e.target.value) : null})}
                >
                  <option value="">Chọn nhân viên</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
                  ))}
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Ngân sách (VNĐ):</label>
                <input
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                  min="0"
                />
              </div>
              <div className={Style.formGroup}>
                <label>Đã chi (VNĐ):</label>
                <input
                  type="number"
                  value={editForm.spend}
                  onChange={(e) => setEditForm({...editForm, spend: e.target.value})}
                  min="0"
                />
              </div>
              <div className={Style.formGroup}>
                <label>ROI:</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.roi}
                  onChange={(e) => setEditForm({...editForm, roi: e.target.value})}
                  min="0"
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
            <h2>Xóa chiến dịch</h2>
            <p>Bạn có chắc chắn muốn xóa chiến dịch "{selectedCampaign?.name}"?</p>
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
            <h2>Chi tiết chiến dịch</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Tên chiến dịch:</label>
                <span>{selectedCampaign?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Trạng thái:</label>
                <span className={`${Style.status} ${getStatusColor(selectedCampaign?.status)}`}>
                  {getStatusText(selectedCampaign?.status)}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Kênh:</label>
                <span>{selectedCampaign?.channelName || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Người phụ trách:</label>
                <span>{selectedCampaign?.ownerStaffName || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngân sách:</label>
                <span>
                  {selectedCampaign?.budget ? new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(selectedCampaign.budget) : '0 VNĐ'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Đã chi:</label>
                <span>
                  {selectedCampaign?.spend ? new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(selectedCampaign.spend) : '0 VNĐ'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>ROI:</label>
                <span>{selectedCampaign?.roi != null ? `${Number(selectedCampaign.roi).toFixed(2)}x` : '0x'}</span>
              </div>
              {selectedCampaign?.createdAt && (
                <div className={Style.detailItem}>
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedCampaign.createdAt).toLocaleDateString('vi-VN')}</span>
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
  );
};

export default Page;

