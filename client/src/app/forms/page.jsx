"use client";
import React, { useState, useEffect } from "react";
import Style from "./forms.module.css";
import { formService } from "../api/form/formService";
import { campaignService } from "../api/campaign/campaignService";
import { Pagination, Search } from "../ui/dashboard/dashboardindex";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";

const FormsPage = () => {
  const [forms, setForms] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    tenForm: '',
    moTa: '',
    maChienDich: '',
    trangThai: 'ACTIVE',
    cacTruong: [
      { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên' },
      { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập email' },
      { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' }
    ],
    cauHinh: {
      mauSac: '#5d57c9',
      kichThuoc: 'medium',
      hienThiTieuDe: true,
      hienThiMoTa: true,
      nutSubmit: 'Gửi',
      nutReset: 'Làm lại'
    }
  });
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [formErrors, setFormErrors] = useState({
    tenForm: '',
    moTa: '',
    maChienDich: ''
  });
  const [campaigns, setCampaigns] = useState([]);
  
  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Lấy trang hiện tại từ URL (API bắt đầu từ 0)
  const currentPage = parseInt(searchParams.get("page") || "0");

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignService.getCampaigns({ page: 1, size: 100 });
        if (response && response.items) {
          setCampaigns(response.items);
        } else if (response && response.data) {
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

  // Effect khi trang thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchForms(currentPage, itemsPerPage, debouncedSearchTerm);
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        // Khi tìm kiếm, quay về trang đầu tiên
        const params = new URLSearchParams(searchParams);
        params.set("page", "0");
        replace(`${pathname}?${params}`);
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, pathname, replace, searchParams]);

  const fetchForms = async (page, pageSize, search = "") => {
    try {
      setLoading(true);
      
      // Sử dụng formService để lấy dữ liệu từ API
      const response = await formService.getForms({
        page: page + 1, // API sử dụng page bắt đầu từ 1
        size: pageSize,
        search: search,
        status: ''
      });
      
      // Xử lý response từ API
      // API trả về: { page, size, totalItems, totalPages, items }
      if (response && response.items && Array.isArray(response.items)) {
        setForms(response.items);
        setMetadata({
          page: (response.page || 1) - 1, // Convert to 0-based for pagination component
          totalPages: response.totalPages || 1,
          count: response.items.length,
          totalElements: response.totalItems || 0
        });
      } else if (response && response.data && Array.isArray(response.data)) {
        // Fallback for different response structure
        setForms(response.data);
        setMetadata(response.metadata || {
          page: page,
          totalPages: Math.ceil((response.metadata?.totalElements || 0) / pageSize),
          count: response.data.length,
          totalElements: response.metadata?.totalElements || 0
        });
      } else if (Array.isArray(response)) {
        setForms(response);
        setMetadata({
          page: page,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.warn("Unexpected API response format:", response);
        setForms([]);
        setMetadata({
          page: page,
          totalPages: 1,
          count: 0,
          totalElements: 0
        });
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setForms([]);
      const errorMessage = "Không thể tải danh sách form. Vui lòng thử lại!";
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

  const handleAdd = () => {
    setFormData({
      tenForm: '',
      moTa: '',
      maChienDich: '',
      trangThai: 'ACTIVE',
      cacTruong: [
        { tenTruong: 'Họ tên', loaiTruong: 'text', batBuoc: true, placeholder: 'Nhập họ tên' },
        { tenTruong: 'Email', loaiTruong: 'email', batBuoc: true, placeholder: 'Nhập email' },
        { tenTruong: 'Số điện thoại', loaiTruong: 'tel', batBuoc: true, placeholder: 'Nhập số điện thoại' }
      ],
      cauHinh: {
        mauSac: '#5d57c9',
        kichThuoc: 'medium',
        hienThiTieuDe: true,
        hienThiMoTa: true,
        nutSubmit: 'Gửi',
        nutReset: 'Làm lại'
      }
    });
    setShowAddModal(true);
  };

  // Tự động thêm trường hỏi về kênh truyền thông khi chọn chiến dịch
  useEffect(() => {
    if (formData.maChienDich) {
      const hasChannelField = formData.cacTruong.some(field => 
        field.tenTruong.toLowerCase().includes('kênh') || 
        field.tenTruong.toLowerCase().includes('channel')
      );
      
      if (!hasChannelField) {
        setFormData(prev => ({
          ...prev,
          cacTruong: [
            ...prev.cacTruong,
            { 
              tenTruong: 'Bạn biết chiến dịch qua kênh nào?', 
              loaiTruong: 'select', 
              batBuoc: false, 
              placeholder: 'Chọn kênh truyền thông',
              options: ['FB ads', 'Zalo OA', 'Người quen giới thiệu']
            }
          ]
        }));
      }
    }
  }, [formData.maChienDich]);

  const handleEdit = async (form) => {
    try {
      // Fetch form details from API
      const formDetail = await formService.getFormById(form.id);
      const formToEdit = formDetail || form;
      
      setSelectedForm(formToEdit);
      const settings = formToEdit.settings || formToEdit.CauHinh || {};
      setFormData({
        tenForm: formToEdit.name || formToEdit.TenForm || '',
        moTa: formToEdit.description || formToEdit.MoTa || settings.description || '',
        maChienDich: (formToEdit.campaignId || formToEdit.MaChienDich || settings.campaignId || '').toString(),
        trangThai: formToEdit.status || formToEdit.TrangThai || 'active',
        cacTruong: formToEdit.fields || formToEdit.CacTruong || [],
        cauHinh: settings
      });
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching form details:", err);
      toast.error("Không thể tải chi tiết form. Vui lòng thử lại!");
    }
  };

  const handleDelete = (form) => {
    setSelectedForm(form);
    setShowDeleteModal(true);
  };

  const handleEmbed = async (form) => {
    try {
      // Fetch embed code from API
      const embedData = await formService.getFormEmbed(form.id);
      
      // Đảm bảo có embedUrl và embedCode
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const embedUrl = embedData.embedUrl || `${baseUrl}/forms/embed/${form.id}`;
      const embedCode = embedData.embedCode || `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`;
      
      setSelectedForm({ 
        ...form, 
        embedCode: embedCode,
        EmbedCode: embedCode, // Backward compatibility
        embedUrl: embedUrl,
        scriptEmbedCode: embedData.scriptEmbedCode
      });
      setShowEmbedModal(true);
    } catch (err) {
      console.error("Error fetching embed code:", err);
      toast.error("Không thể tải embed code. Vui lòng thử lại!");
    }
  };

  const handleView = async (form) => {
    try {
      // Fetch form details from API
      const formDetail = await formService.getFormById(form.id);
      setSelectedForm(formDetail || form);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching form details:", err);
      toast.error("Không thể tải chi tiết form. Vui lòng thử lại!");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.tenForm.trim()) {
      toast.error("Tên form không được để trống!");
      return;
    }
    if (!formData.moTa.trim()) {
      toast.error("Mô tả không được để trống!");
      return;
    }
    if (!formData.maChienDich) {
      toast.error("Vui lòng chọn chiến dịch!");
      return;
    }
    
    try {
      toast.loading("Đang tạo form...", { id: "add-form" });
      
      // Map form data to API format
      const formPayload = {
        name: formData.tenForm,
        description: formData.moTa,
        status: formData.trangThai === 'ACTIVE' ? 'active' : 'inactive',
        campaignId: formData.maChienDich ? Number(formData.maChienDich) : null,
        fields: formData.cacTruong.map(field => ({
          id: field.id || field.tenTruong.toLowerCase().replace(/\s+/g, ''),
          label: field.tenTruong,
          type: field.loaiTruong,
          required: field.batBuoc,
          placeholder: field.placeholder,
          options: field.options || (field.loaiTruong === 'select' ? [] : undefined)
        })),
        settings: {
          ...formData.cauHinh,
          description: formData.moTa,
          campaignId: formData.maChienDich ? Number(formData.maChienDich) : null
        }
      };
      
      const response = await formService.createForm(formPayload);
      
      toast.success("Đã tạo form thành công!", {
        id: "add-form",
        duration: 3000,
        position: "top-center"
      });
      
      setShowAddModal(false);
      fetchForms(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error adding form:", err);
      toast.error("Không thể tạo form. Vui lòng thử lại!", {
        id: "add-form",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast.loading("Đang cập nhật form...", { id: "edit-form" });
      
      // Map form data to API format
      const formPayload = {
        name: formData.tenForm,
        description: formData.moTa,
        status: formData.trangThai === 'ACTIVE' ? 'active' : 'inactive',
        campaignId: formData.maChienDich ? Number(formData.maChienDich) : null,
        fields: formData.cacTruong.map(field => ({
          id: field.id || field.tenTruong.toLowerCase().replace(/\s+/g, ''),
          label: field.tenTruong,
          type: field.loaiTruong,
          required: field.batBuoc,
          placeholder: field.placeholder,
          options: field.options || (field.loaiTruong === 'select' ? [] : undefined)
        })),
        settings: {
          ...formData.cauHinh,
          description: formData.moTa,
          campaignId: formData.maChienDich ? Number(formData.maChienDich) : null
        }
      };
      
      await formService.updateForm(selectedForm.id, formPayload);
      
      toast.success("Đã cập nhật form thành công!", {
        id: "edit-form",
        duration: 3000,
        position: "top-center"
      });
      
      setShowEditModal(false);
      fetchForms(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error updating form:", err);
      toast.error("Không thể cập nhật form. Vui lòng thử lại!", {
        id: "edit-form",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa form...", { id: "delete-form" });
      
      await formService.deleteForm(selectedForm.id);
      
      toast.success("Đã xóa form thành công!", {
        id: "delete-form",
        duration: 3000,
        position: "top-center"
      });
      
      setShowDeleteModal(false);
      fetchForms(currentPage, itemsPerPage);
    } catch (err) {
      console.error("Error deleting form:", err);
      toast.error("Không thể xóa form. Vui lòng thử lại!", {
        id: "delete-form",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      cacTruong: [...prev.cacTruong, { tenTruong: '', loaiTruong: 'text', batBuoc: false, placeholder: '' }]
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      cacTruong: prev.cacTruong.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cacTruong: prev.cacTruong.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  return (
    <div className={Style.container}>
      <div className={Style.top}>
        <h1>Quản lý Form</h1>
        <div className={Style.topRight}>
          <Search 
            placeholder="Tìm kiếm theo tên hoặc mô tả form..." 
            onChange={handleSearch}
            onSearch={handleSearch}
          />
          <button className={Style.addButton} onClick={handleAdd}>
            Tạo Form mới
          </button>
        </div>
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {debouncedSearchTerm && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{debouncedSearchTerm}</strong> | 
          Tìm thấy: <strong>{forms.length}</strong> form
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên Form</td>
            <td>Mô tả</td>
            <td>Chiến dịch</td>
            <td>Trạng thái</td>
            <td>Số trường</td>
            <td>Ngày tạo</td>
            <td>Thao tác</td>
          </tr>
        </thead>
        <tbody>
          {forms.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                Chưa có form nào. Hãy tạo form mới!
              </td>
            </tr>
          ) : (
            forms.map((form) => {
              // Get campaignId from settings if not in root
              const campaignId = form.campaignId || form.MaChienDich || (form.settings?.campaignId);
              const campaignIdNum = campaignId ? Number(campaignId) : null;
              const campaign = campaigns.find(c => (c.id || c.MaCD) === campaignIdNum);
              // Get description from settings if not in root
              const description = form.description || form.MoTa || (form.settings?.description || '');
              
              return (
                <tr key={form.id || form.MaForm}>
                  <td>{form.name || form.TenForm}</td>
                  <td>{description}</td>
                  <td>{campaign?.name || campaign?.TenCD || 'N/A'}</td>
                <td>
                  <span className={`${Style.status} ${(form.status || form.TrangThai) === 'active' || (form.status || form.TrangThai) === 'ACTIVE' ? Style.available : Style.unavailable}`}>
                    {(form.status || form.TrangThai) === 'active' || (form.status || form.TrangThai) === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td>{(form.fields || form.CacTruong || []).length} trường</td>
                <td>{form.createdAt ? new Date(form.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>
                  <div className={Style.buttons}>
                    <button 
                      className={`${Style.button} ${Style.view}`}
                      onClick={() => handleView(form)}
                    >
                      Xem
                    </button>
                    <button 
                      className={`${Style.button} ${Style.edit}`}
                      onClick={() => handleEdit(form)}
                    >
                      Sửa
                    </button>
                    <button 
                      className={`${Style.button} ${Style.embed}`}
                      onClick={() => handleEmbed(form)}
                    >
                      Embed
                    </button>
                    <button 
                      className={`${Style.button} ${Style.delete}`}
                      onClick={() => handleDelete(form)}
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
        <Pagination metadata={metadata || { page: 0, totalPages: 1, count: forms.length, totalElements: forms.length }} />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal} style={{ maxWidth: '800px' }}>
            <h2>Tạo Form mới</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={Style.formGroup}>
                <label>Tên Form:</label>
                <input
                  type="text"
                  value={formData.tenForm}
                  onChange={(e) => setFormData({...formData, tenForm: e.target.value})}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>Mô tả:</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({...formData, moTa: e.target.value})}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>Chiến dịch:</label>
                <select
                  value={formData.maChienDich}
                  onChange={(e) => setFormData({...formData, maChienDich: e.target.value})}
                  required
                >
                  <option value="">Chọn chiến dịch</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id || campaign.MaCD} value={campaign.id || campaign.MaCD}>
                      {campaign.name || campaign.TenCD}
                    </option>
                  ))}
                </select>
              </div>

              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({...formData, trangThai: e.target.value})}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                </select>
              </div>

              <div className={Style.formGroup}>
                <label>Các trường form:</label>
                {formData.cacTruong.map((field, index) => (
                  <div key={index} className={Style.fieldRow}>
                    <input
                      type="text"
                      placeholder="Tên trường"
                      value={field.tenTruong}
                      onChange={(e) => updateField(index, 'tenTruong', e.target.value)}
                    />
                    <select
                      value={field.loaiTruong}
                      onChange={(e) => updateField(index, 'loaiTruong', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="tel">Số điện thoại</option>
                      <option value="date">Ngày</option>
                      <option value="number">Số</option>
                      <option value="select">Dropdown</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Placeholder"
                      value={field.placeholder}
                      onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                    />
                    {field.loaiTruong === 'select' && (
                      <input
                        type="text"
                        placeholder="Options (phân cách bằng dấu phẩy)"
                        value={Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')}
                        onChange={(e) => {
                          const options = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt);
                          updateField(index, 'options', options);
                        }}
                        style={{ flex: 1 }}
                      />
                    )}
                    <label>
                      <input
                        type="checkbox"
                        checked={field.batBuoc}
                        onChange={(e) => updateField(index, 'batBuoc', e.target.checked)}
                      />
                      Bắt buộc
                    </label>
                    <button type="button" onClick={() => removeField(index)} className={Style.removeButton}>
                      Xóa
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addField} className={Style.addFieldButton}>
                  Thêm trường
                </button>
              </div>

              <div className={Style.modalButtons}>
                <button type="submit" className={Style.submitButton}>
                  Tạo Form
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

      {/* Embed Modal */}
      {showEmbedModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Embed Code - {selectedForm?.name || selectedForm?.TenForm}</h2>
            <p>Copy đoạn code dưới đây để nhúng form vào website của bạn:</p>
            
            {/* Iframe Embed Code */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Option 1: Iframe (Đơn giản nhất)
              </label>
              <div className={Style.embedCodeContainer}>
                <textarea
                  value={selectedForm?.embedCode || selectedForm?.EmbedCode || ''}
                  readOnly
                  className={Style.embedCode}
                  rows={3}
                />
                <button 
                  className={Style.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedForm?.embedCode || selectedForm?.EmbedCode || '');
                    toast.success('Đã copy iframe code!');
                  }}
                >
                  Copy Iframe
                </button>
              </div>
            </div>

            {/* Script Embed Code */}
            {selectedForm?.scriptEmbedCode && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Option 2: Script Tag (Linh hoạt hơn)
                </label>
                <div className={Style.embedCodeContainer}>
                  <textarea
                    value={selectedForm.scriptEmbedCode}
                    readOnly
                    className={Style.embedCode}
                    rows={8}
                  />
                  <button 
                    className={Style.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedForm.scriptEmbedCode);
                      toast.success('Đã copy script code!');
                    }}
                  >
                    Copy Script
                  </button>
                </div>
              </div>
            )}

            {/* Direct URL */}
            {selectedForm?.embedUrl && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Direct URL:
                </label>
                <div className={Style.embedCodeContainer}>
                  <input
                    type="text"
                    value={selectedForm.embedUrl}
                    readOnly
                    className={Style.embedCode}
                    style={{ padding: '10px', fontSize: '14px' }}
                  />
                  <button 
                    className={Style.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedForm.embedUrl);
                      toast.success('Đã copy URL!');
                    }}
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className={Style.previewContainer}>
              <h3>Preview:</h3>
              <div className={Style.previewFrame}>
                {selectedForm?.embedUrl ? (
                  <iframe
                    src={selectedForm.embedUrl}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    title="Form Preview"
                  />
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
                    Preview sẽ hiển thị ở đây
                  </div>
                )}
              </div>
            </div>

            <div className={Style.modalButtons}>
              <button 
                className={Style.cancelButton}
                onClick={() => setShowEmbedModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Chi tiết Form</h2>
            <div className={Style.viewContent}>
              <p><strong>Tên Form:</strong> {selectedForm?.name || selectedForm?.TenForm}</p>
              <p><strong>Mô tả:</strong> {selectedForm?.description || selectedForm?.MoTa}</p>
              <p><strong>Chiến dịch:</strong> {campaigns.find(c => (c.id || c.MaCD) === (selectedForm?.campaignId || selectedForm?.MaChienDich))?.name || campaigns.find(c => (c.id || c.MaCD) === (selectedForm?.campaignId || selectedForm?.MaChienDich))?.TenCD || 'N/A'}</p>
              <p><strong>Trạng thái:</strong> {(selectedForm?.status || selectedForm?.TrangThai) === 'active' || (selectedForm?.status || selectedForm?.TrangThai) === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}</p>
              <p><strong>Số trường:</strong> {(selectedForm?.fields || selectedForm?.CacTruong || []).length}</p>
              <p><strong>Ngày tạo:</strong> {selectedForm?.createdAt ? new Date(selectedForm.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              
              <h3>Các trường form:</h3>
              <ul>
                {(selectedForm?.fields || selectedForm?.CacTruong || []).map((field, index) => (
                  <li key={index}>
                    {field.label || field.tenTruong} ({field.type || field.loaiTruong}) {(field.required || field.batBuoc) ? '(Bắt buộc)' : '(Tùy chọn)'}
                  </li>
                ))}
              </ul>
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Xóa Form</h2>
            <p>Bạn có chắc chắn muốn xóa form "{selectedForm?.name || selectedForm?.TenForm}"?</p>
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
    </div>
  );
};

export default FormsPage;
