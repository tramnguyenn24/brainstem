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
    roi: 0
  });

  const [channels, setChannels] = useState([]);
  const [staff, setStaff] = useState([]);
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
      
      const result = await campaignService.addCampaign({
        name: formData.name,
        status: formData.status,
        channelId: formData.channelId ? Number(formData.channelId) : null,
        ownerStaffId: formData.ownerStaffId ? Number(formData.ownerStaffId) : null,
        budget: formData.budget ? Number(formData.budget) : 0,
        spend: formData.spend ? Number(formData.spend) : 0,
        roi: formData.roi ? Number(formData.roi) : 0
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
          <label>Kênh:</label>
          <select
            name="channelId"
            value={formData.channelId || ''}
            onChange={handleChange}
          >
            <option value="">Chọn kênh</option>
            {channels.map(channel => (
              <option key={channel.id} value={channel.id}>{channel.name}</option>
            ))}
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
          <label>ROI:</label>
          <input
            type="number"
            name="roi"
            step="0.01"
            value={formData.roi}
            onChange={handleChange}
            placeholder="Nhập ROI (ví dụ: 1.5)"
            min="0"
            className={errors['roi'] ? styles.errorInput : ''}
          />
          {errors['roi'] && <span className={styles.errorText}>{errors['roi']}</span>}
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

