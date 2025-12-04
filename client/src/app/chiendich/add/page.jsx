'use client';
import React, { useState, useEffect } from "react";
import styles from "./add.module.css";
import { campaignService } from "../../api/campaign/campaignService";
import { channelService } from "../../api/channel/channelService";
import { staffService } from "../../api/staff/staffService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const AddCampaignPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    status: 'running',
    channelId: null,
    ownerStaffId: null,
    budget: 0,
    spend: 0,
    cost: 0,
    revenue: 0
  });

  const [channels, setChannels] = useState([]);
  const [staff, setStaff] = useState([]);
  const [campaignChannels, setCampaignChannels] = useState([]); // Mảng các kênh truyền thông
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) return 'Tên chiến dịch không được để trống';
    if (value.trim().length < 2) return 'Tên chiến dịch phải có ít nhất 2 ký tự';
    return '';
  };

  const validateBudget = (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return 'Ngân sách phải là số dương';
    return '';
  };

  const validateSpend = (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return 'Số tiền đã chi phải là số dương';
    return '';
  };

  const validateROI = (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return 'ROI phải là số dương';
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'budget':
        return validateBudget(value);
      case 'spend':
        return validateSpend(value);
      case 'roi':
        return validateROI(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'channelId' && key !== 'ownerStaffId') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? (name === 'channelId' || name === 'ownerStaffId' ? null : 0) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleAddChannel = () => {
    setCampaignChannels([...campaignChannels, { channelId: '', cost: 0 }]);
  };

  const handleRemoveChannel = (index) => {
    setCampaignChannels(campaignChannels.filter((_, i) => i !== index));
  };

  const handleChannelChange = (index, field, value) => {
    const updated = [...campaignChannels];
    updated[index] = { ...updated[index], [field]: value };
    setCampaignChannels(updated);
    
    // Tính lại tổng chi phí
    const totalCost = updated.reduce((sum, ch) => sum + (Number(ch.cost) || 0), 0);
    setFormData({ ...formData, cost: totalCost });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Vui lòng sửa các lỗi trước khi gửi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      toast.loading("Đang thêm chiến dịch...", { id: "add-campaign" });
      
      // Chuẩn bị dữ liệu kênh truyền thông
      const channelsData = campaignChannels
        .filter(ch => ch.channelId)
        .map(ch => ({
          channelId: Number(ch.channelId),
          cost: Number(ch.cost) || 0
        }));
      
      const result = await campaignService.addCampaign({
        name: formData.name,
        status: formData.status,
        channelId: formData.channelId ? Number(formData.channelId) : null,
        ownerStaffId: formData.ownerStaffId ? Number(formData.ownerStaffId) : null,
        budget: formData.budget ? Number(formData.budget) : 0,
        spend: formData.spend ? Number(formData.spend) : 0,
        cost: formData.cost || 0,
        revenue: formData.revenue ? Number(formData.revenue) : 0,
        channels: channelsData
      });
      
      // Check if API response contains error
      if (result && (result.code >= 400 || result.error || result.status >= 400)) {
        const errorMessage = getErrorMessage(result, 'Không thể thêm chiến dịch. Vui lòng thử lại.');
        toast.error(errorMessage, {
          id: "add-campaign",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      // Success case
      toast.success("Đã thêm chiến dịch thành công!", {
        id: "add-campaign",
        duration: 3000,
        position: "top-center"
      });
      router.push('/chiendich');
    } catch (error) {
      console.error('Error adding campaign:', error);
      
      const errorMessage = getErrorMessage(error, 'Không thể thêm chiến dịch. Vui lòng thử lại.');
      toast.error(errorMessage, {
        id: "add-campaign",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thêm chiến dịch mới</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Tên chiến dịch:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên chiến dịch"
            className={errors['name'] ? styles.errorInput : ''}
            required
          />
          {errors['name'] && <span className={styles.errorText}>{errors['name']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Trạng thái:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="running">Đang chạy</option>
            <option value="paused">Tạm dừng</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Người phụ trách:</label>
          <select
            name="ownerStaffId"
            value={formData.ownerStaffId || ''}
            onChange={handleChange}
          >
            <option value="">Chọn nhân viên</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Ngân sách (VNĐ):</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="Nhập ngân sách"
            min="0"
            className={errors['budget'] ? styles.errorInput : ''}
          />
          {errors['budget'] && <span className={styles.errorText}>{errors['budget']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Đã chi (VNĐ):</label>
          <input
            type="number"
            name="spend"
            value={formData.spend}
            onChange={handleChange}
            placeholder="Nhập số tiền đã chi"
            min="0"
            className={errors['spend'] ? styles.errorInput : ''}
          />
          {errors['spend'] && <span className={styles.errorText}>{errors['spend']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Chi phí (VNĐ):</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            placeholder="Tổng chi phí (tự động tính từ các kênh)"
            min="0"
            readOnly
            className={errors['cost'] ? styles.errorInput : ''}
          />
          {errors['cost'] && <span className={styles.errorText}>{errors['cost']}</span>}
          <small style={{ color: '#666', fontSize: '12px' }}>Tự động tính từ tổng chi phí các kênh</small>
        </div>

        <div className={styles.formGroup}>
          <label>Doanh thu (VNĐ):</label>
          <input
            type="number"
            name="revenue"
            value={formData.revenue}
            onChange={handleChange}
            placeholder="Nhập doanh thu"
            min="0"
            className={errors['revenue'] ? styles.errorInput : ''}
          />
          {errors['revenue'] && <span className={styles.errorText}>{errors['revenue']}</span>}
          <small style={{ color: '#666', fontSize: '12px' }}>Doanh thu sẽ được tính tự động từ khóa học học viên đăng ký</small>
        </div>

        {/* Phần thêm kênh truyền thông */}
        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label>Kênh truyền thông:</label>
            <button
              type="button"
              onClick={handleAddChannel}
              style={{
                padding: '6px 12px',
                background: '#5d57c9',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              + Thêm kênh
            </button>
          </div>
          
          {campaignChannels.map((channel, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <select
                value={channel.channelId}
                onChange={(e) => handleChannelChange(index, 'channelId', e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
              >
                <option value="">Chọn kênh</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Chi phí (VNĐ)"
                value={channel.cost}
                onChange={(e) => handleChannelChange(index, 'cost', e.target.value)}
                min="0"
                style={{ width: '150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveChannel(index)}
                style={{
                  padding: '10px 15px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            </div>
          ))}
          
          {campaignChannels.length === 0 && (
            <small style={{ color: '#666', fontSize: '12px' }}>
              Chưa có kênh nào. Nhấn "Thêm kênh" để thêm kênh truyền thông cho chiến dịch này.
            </small>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang thêm...' : 'Thêm chiến dịch'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/chiendich')}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCampaignPage;

