'use client';
import React, { useState, useEffect, Suspense } from "react";
import Style from "./media.module.css";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import Link from "next/link";
import { mediaService } from "../api/media/mediaService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
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
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [media, setMedia] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    url: '',
    description: '',
    fileSize: '',
    mimeType: '',
    status: 'active'
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 1)
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Lấy các tham số lọc từ URL
  const searchFilter = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const statusFilter = searchParams.get("status") || "";

  // Sync state với URL parameters
  useEffect(() => {
    setSearchTerm(searchFilter);
    setSelectedType(typeFilter);
    setSelectedStatus(statusFilter);
  }, [searchFilter, typeFilter, statusFilter]);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchMedia(currentPage, itemsPerPage, searchFilter, typeFilter, statusFilter);
  }, [currentPage, itemsPerPage, searchFilter, typeFilter, statusFilter]);

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

  const fetchMedia = async (page, size, search = "", type = "", status = "") => {
    try {
      setLoading(true);
      const response = await mediaService.getMedia({ 
        page, 
        size, 
        search, 
        type,
        status,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      
      console.log("API Response (Media):", response);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách media");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setMedia([]);
        return;
      }
      
      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        setMedia(response.items);
        
        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page - 1, // Convert to 0-based for pagination component
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Media API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setMedia(response);
        setMetadata({
          page: 0,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setMedia([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách media. Vui lòng thử lại!");
      setMedia([]);
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

  const handleTypeChange = (type) => {
    setSelectedType(type);
    updateFilters({ type });
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleEdit = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setEditForm({
      name: mediaItem.name || '',
      type: mediaItem.type || '',
      url: mediaItem.url || '',
      description: mediaItem.description || '',
      fileSize: mediaItem.fileSize || '',
      mimeType: mediaItem.mimeType || '',
      status: mediaItem.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editForm.name.trim()) {
      toast.error("Tên media không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }
    
    try {
      toast.loading("Đang cập nhật media...", { id: "edit-media" });
      
      const response = await mediaService.updateMedia(selectedMedia.id, {
        name: editForm.name,
        type: editForm.type || null,
        url: editForm.url || null,
        description: editForm.description || null,
        fileSize: editForm.fileSize ? Number(editForm.fileSize) : null,
        mimeType: editForm.mimeType || null,
        status: editForm.status || 'active'
      });
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật media");
        toast.error(errorMessage, {
          id: "edit-media",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã cập nhật media "${editForm.name}" thành công!`, {
        id: "edit-media",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchMedia(currentPage, itemsPerPage, searchFilter, typeFilter, statusFilter);
    } catch (err) {
      console.error("Error updating media:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật media. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-media",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa media...", { id: "delete-media" });
      
      const response = await mediaService.deleteMedia(selectedMedia.id);
      
      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa media");
        toast.error(errorMessage, {
          id: "delete-media",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      toast.success(`Đã xóa media "${selectedMedia.name}" thành công!`, {
        id: "delete-media",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchMedia(currentPage, itemsPerPage, searchFilter, typeFilter, statusFilter);
    } catch (err) {
      console.error("Error deleting media:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa media. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-media",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (mediaItem) => {
    try {
      const mediaDetail = await mediaService.getMediaById(mediaItem.id);
      
      // Kiểm tra lỗi từ response
      if (mediaDetail && (mediaDetail.code >= 400 || mediaDetail.error || mediaDetail.status >= 400)) {
        const errorMessage = getErrorMessage(mediaDetail, "Không thể tải chi tiết media");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      setSelectedMedia(mediaDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching media details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết media. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return Style.active;
      case 'inactive': return Style.inactive;
      case 'archived': return Style.archived;
      default: return Style.inactive;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'archived': return 'Đã lưu trữ';
      default: return status || 'N/A';
    }
  };

  const getTypeText = (type) => {
    switch(type) {
      case 'image': return 'Hình ảnh';
      case 'video': return 'Video';
      case 'document': return 'Tài liệu';
      case 'audio': return 'Âm thanh';
      default: return type || 'Khác';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <Suspense fallback={<div>Loading...</div>}>
          <FilterableSearch 
            placeholder="Tìm kiếm theo tên media..."
            onChange={handleSearch} 
            onSearch={handleSearch} 
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' },
              { value: 'archived', label: 'Đã lưu trữ' }
            ]}
          />
        </Suspense>
        <div className={Style.filterGroup}>
          <select
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={Style.typeFilter}
          >
            <option value="">Tất cả loại</option>
            <option value="image">Hình ảnh</option>
            <option value="video">Video</option>
            <option value="document">Tài liệu</option>
            <option value="audio">Âm thanh</option>
          </select>
        </div>
        <Link href="/media/add">
          <button className={Style.addButton}>Thêm media</button>
        </Link>
      </div>
    
      {/* Hiển thị kết quả tìm kiếm */}
      {(searchFilter || typeFilter || statusFilter) && (
        <div className={Style.searchInfo}>
          {searchFilter && (
            <span>Kết quả tìm kiếm cho: <strong>{searchFilter}</strong> | </span>
          )}
          Tìm thấy: <strong>{media.length}</strong> media
          {typeFilter && (
            <span> | Loại: <strong>{getTypeText(typeFilter)}</strong></span>
          )}
          {statusFilter && (
            <span> | Trạng thái: <strong>{getStatusText(statusFilter)}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên media</td>
            <td>Loại</td>
            <td>URL</td>
            <td>Mô tả</td>
            <td>Kích thước</td>
            <td>Trạng thái</td>
            <td>Hành động</td>
          </tr>
        </thead>
        <tbody>
          {media.length === 0 ? (
            <tr>
              <td colSpan="7" className={Style.noData}>
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            media.map((mediaItem) => (
              <tr key={mediaItem.id}>
                <td>
                  <div className={Style.name}>
                    {mediaItem.name}
                  </div>
                </td>
                <td>{getTypeText(mediaItem.type)}</td>
                <td>
                  {mediaItem.url ? (
                    <a href={mediaItem.url} target="_blank" rel="noopener noreferrer" className={Style.urlLink}>
                      Xem
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className={Style.description}>
                  {mediaItem.description || 'N/A'}
                </td>
                <td>{formatFileSize(mediaItem.fileSize)}</td>
                <td>
                  <span className={`${Style.status} ${getStatusColor(mediaItem.status)}`}>
                    {getStatusText(mediaItem.status)}
                  </span>
                </td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(mediaItem)}
                    >
                      Xem
                    </button>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(mediaItem)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(mediaItem)}
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
        <Suspense fallback={<div>Loading...</div>}>
          <Pagination metadata={metadata || { page: 0, totalPages: 1, count: media.length, totalElements: media.length }} />
        </Suspense>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Sửa media</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Tên media:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Loại:</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                >
                  <option value="">Chọn loại</option>
                  <option value="image">Hình ảnh</option>
                  <option value="video">Video</option>
                  <option value="document">Tài liệu</option>
                  <option value="audio">Âm thanh</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>URL:</label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div className={Style.formGroup}>
                <label>Mô tả:</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className={Style.formGroup}>
                <label>Kích thước file (bytes):</label>
                <input
                  type="number"
                  value={editForm.fileSize}
                  onChange={(e) => setEditForm({...editForm, fileSize: e.target.value})}
                  min="0"
                />
              </div>
              <div className={Style.formGroup}>
                <label>MIME Type:</label>
                <input
                  type="text"
                  value={editForm.mimeType}
                  onChange={(e) => setEditForm({...editForm, mimeType: e.target.value})}
                  placeholder="image/jpeg, video/mp4, etc."
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
                  <option value="archived">Đã lưu trữ</option>
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
            <h2>Xóa media</h2>
            <p>Bạn có chắc chắn muốn xóa media "{selectedMedia?.name}"?</p>
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
            <h2>Chi tiết media</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Tên media:</label>
                <span>{selectedMedia?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Loại:</label>
                <span>{getTypeText(selectedMedia?.type)}</span>
              </div>
              <div className={Style.detailItem}>
                <label>URL:</label>
                <span>
                  {selectedMedia?.url ? (
                    <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer" className={Style.urlLink}>
                      {selectedMedia.url}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Mô tả:</label>
                <span>{selectedMedia?.description || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Kích thước:</label>
                <span>{formatFileSize(selectedMedia?.fileSize)}</span>
              </div>
              <div className={Style.detailItem}>
                <label>MIME Type:</label>
                <span>{selectedMedia?.mimeType || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Trạng thái:</label>
                <span className={`${Style.status} ${getStatusColor(selectedMedia?.status)}`}>
                  {getStatusText(selectedMedia?.status)}
                </span>
              </div>
              {selectedMedia?.createdAt && (
                <div className={Style.detailItem}>
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedMedia.createdAt).toLocaleDateString('vi-VN')}</span>
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

