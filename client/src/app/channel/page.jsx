'use client';
import React, { useState, useEffect, Suspense } from "react";
import Style from "./channel.module.css";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import { channelService } from "../api/channel/channelService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  const [channels, setChannels] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    status: 'active'
  });
  const [addForm, setAddForm] = useState({
    name: '',
    type: '',
    status: 'active'
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCampaignsModal, setShowCampaignsModal] = useState(false);
  const [selectedChannelCampaigns, setSelectedChannelCampaigns] = useState([]);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    setSearchTerm(searchFilter);
    setSelectedStatus(statusFilter);
  }, [searchFilter, statusFilter]);

  useEffect(() => {
    fetchChannels(currentPage, itemsPerPage, searchFilter, statusFilter);
  }, [currentPage, itemsPerPage, searchFilter, statusFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== searchFilter) {
        updateFilters({ search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, searchFilter]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    replace(`${pathname}?${params}`);
  };

  const fetchChannels = async (page, size, search = "", status = "") => {
    try {
      setLoading(true);
      const response = await channelService.getChannelsWithStats({ 
        page, 
        size, 
        search, 
        status,
        sortBy: 'name',
        sortDirection: 'asc'
      });
      
      if (response && response.items) {
        setChannels(response.items);
        setMetadata({
          page: response.page - 1,
          totalPages: response.totalPages,
          count: response.items.length,
          totalElements: response.totalItems
        });
      } else {
        setChannels([]);
        setMetadata({ page: 0, totalPages: 1, count: 0, totalElements: 0 });
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách kênh. Vui lòng thử lại!");
      setChannels([]);
      toast.error(errorMessage, { duration: 4000, position: "top-center" });
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

  const handleAdd = () => {
    setAddForm({ name: '', type: '', status: 'active' });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      toast.error("Tên kênh không được để trống!");
      return;
    }
    
    try {
      toast.loading("Đang thêm kênh...", { id: "add-channel" });
      const response = await channelService.addChannel(addForm);
      
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể thêm kênh");
        toast.error(errorMessage, { id: "add-channel", duration: 4000, position: "top-center" });
        return;
      }
      
      toast.success("Đã thêm kênh thành công!", { id: "add-channel", duration: 3000, position: "top-center" });
      setShowAddModal(false);
      fetchChannels(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (error) {
      console.error('Error adding channel:', error);
      const errorMessage = getErrorMessage(error, 'Không thể thêm kênh. Vui lòng thử lại.');
      toast.error(errorMessage, { id: "add-channel", duration: 4000, position: "top-center" });
    }
  };

  const handleEdit = (channel) => {
    setSelectedChannel(channel);
    setEditForm({
      name: channel.name || '',
      type: channel.type || '',
      status: channel.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error("Tên kênh không được để trống!");
      return;
    }
    
    try {
      toast.loading("Đang cập nhật kênh...", { id: "edit-channel" });
      const response = await channelService.updateChannel(selectedChannel.id, editForm);
      
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật kênh");
        toast.error(errorMessage, { id: "edit-channel", duration: 4000, position: "top-center" });
        return;
      }
      
      toast.success(`Đã cập nhật kênh "${editForm.name}" thành công!`, {
        id: "edit-channel",
        duration: 3000,
        position: "top-center"
      });
      setShowEditModal(false);
      fetchChannels(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (error) {
      console.error("Error updating channel:", error);
      const errorMessage = getErrorMessage(error, "Không thể cập nhật kênh. Vui lòng thử lại!");
      toast.error(errorMessage, { id: "edit-channel", duration: 4000, position: "top-center" });
    }
  };

  const handleDelete = (channel) => {
    setSelectedChannel(channel);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa kênh...", { id: "delete-channel" });
      const response = await channelService.deleteChannel(selectedChannel.id);
      
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa kênh");
        toast.error(errorMessage, { id: "delete-channel", duration: 4000, position: "top-center" });
        return;
      }
      
      toast.success(`Đã xóa kênh "${selectedChannel.name}" thành công!`, {
        id: "delete-channel",
        duration: 3000,
        position: "top-center"
      });
      setShowDeleteModal(false);
      fetchChannels(currentPage, itemsPerPage, searchFilter, statusFilter);
    } catch (error) {
      console.error("Error deleting channel:", error);
      const errorMessage = getErrorMessage(error, "Không thể xóa kênh. Vui lòng thử lại!");
      toast.error(errorMessage, { id: "delete-channel", duration: 4000, position: "top-center" });
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return Style.available;
      case 'inactive': return Style.unavailable;
      default: return Style.unavailable;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không hoạt động';
    }
  };

  const handleRunningCampaignsClick = (channel) => {
    if (channel.runningCampaigns && channel.runningCampaigns.length > 0) {
      setSelectedChannelCampaigns(channel.runningCampaigns);
      setShowCampaignsModal(true);
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Quản lý Kênh Truyền thông</h1>
        <div className={Style.topRight}>
          <Suspense fallback={<div>Loading...</div>}>
            <FilterableSearch 
              placeholder="Tìm kiếm theo tên kênh..."
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
          <button className={Style.addButton} onClick={handleAdd}>
            Thêm kênh
          </button>
        </div>
      </div>
    
      {searchFilter && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{searchFilter}</strong> | 
          Tìm thấy: <strong>{channels.length}</strong> kênh
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên kênh</td>
            <td>Loại</td>
            <td>Trạng thái</td>
            <td>Chiến dịch đang chạy</td>
            <td>Học viên mới</td>
            <td>Tỷ lệ chuyển đổi (leads → học viên)</td>
            <td>Doanh thu</td>
            <td>Thao tác</td>
          </tr>
        </thead>
        <tbody>
          {channels.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                Chưa có kênh nào. Hãy thêm kênh mới!
              </td>
            </tr>
          ) : (
            channels.map((channel) => (
              <tr key={channel.id}>
                <td>
                  <div className={Style.nameCell}>
                    <strong>{channel.name}</strong>
                  </div>
                </td>
                <td>{channel.type || 'N/A'}</td>
                <td>
                  <span className={`${Style.status} ${getStatusColor(channel.status)}`}>
                    {getStatusText(channel.status)}
                  </span>
                </td>
                <td>
                  {channel.runningCampaignsCount > 0 ? (
                    <span 
                      className={Style.runningCampaignsLink}
                      onClick={() => handleRunningCampaignsClick(channel)}
                      style={{ cursor: 'pointer', color: '#4ecdc4', textDecoration: 'underline' }}
                    >
                      {channel.runningCampaignsCount}
                    </span>
                  ) : (
                    <span className={Style.statNumber}>0</span>
                  )}
                </td>
                <td>
                  <span className={Style.statNumber}>{channel.newStudentsCount || 0}</span>
                </td>
                <td>
                  <span className={Style.statNumber}>
                    {channel.conversionRate != null ? `${Number(channel.conversionRate).toFixed(2)}%` : '0%'}
                  </span>
                </td>
                <td>
                  <span className={Style.revenue}>{formatCurrency(channel.revenue || 0)}</span>
                </td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(channel)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(channel)}
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: channels.length, totalElements: channels.length }} />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Thêm kênh mới</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={Style.formGroup}>
                <label>Tên kênh: <span className={Style.required}>*</span></label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  placeholder="Nhập tên kênh"
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Loại:</label>
                <input
                  type="text"
                  value={addForm.type}
                  onChange={(e) => setAddForm({...addForm, type: e.target.value})}
                  placeholder="Nhập loại kênh (tùy chọn)"
                />
              </div>
              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({...addForm, status: e.target.value})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.submitButton}>
                  Thêm kênh
                </button>
                <button 
                  type="button" 
                  className={Style.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Sửa kênh</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Tên kênh: <span className={Style.required}>*</span></label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Loại:</label>
                <input
                  type="text"
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                />
              </div>
              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div className={Style.modalButtons}>
                <button type="submit" className={Style.submitButton}>
                  Cập nhật
                </button>
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
            <h2>Xóa kênh</h2>
            <p>Bạn có chắc chắn muốn xóa kênh "{selectedChannel?.name}"?</p>
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

      {/* Campaigns Modal */}
      {showCampaignsModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Danh sách Chiến dịch đang chạy</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
              {selectedChannelCampaigns.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#8391a2', padding: '20px' }}>
                  Không có chiến dịch nào đang chạy
                </p>
              ) : (
                <table className={Style.table} style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <td>ID</td>
                      <td>Tên chiến dịch</td>
                      <td>Trạng thái</td>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChannelCampaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td>{campaign.id}</td>
                        <td>
                          <strong>{campaign.name}</strong>
                        </td>
                        <td>
                          <span className={`${Style.status} ${Style.available}`}>
                            Đang chạy
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className={Style.modalButtons}>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowCampaignsModal(false)}
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

