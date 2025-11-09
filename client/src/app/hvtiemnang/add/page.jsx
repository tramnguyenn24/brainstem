"use client";
import React, { useState, useEffect } from 'react';
import styles from './add.module.css';
import { useRouter } from 'next/navigation';
import { leadService } from '../../api/lead/leadService';
import { campaignService } from '../../api/campaign/campaignService';
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const AddLeadPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'new',
    interestLevel: 'medium',
    campaignId: ''
  });

  // Fetch campaigns for dropdown
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campaignService.getCampaigns({ page: 1, size: 100 });
        if (response && response.items) {
          setCampaigns(response.items);
        } else if (Array.isArray(response)) {
          setCampaigns(response);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      }
    };
    fetchCampaigns();
  }, []);

  // Validation functions
  const validateFullName = (value) => {
    if (!value.trim()) return 'Họ tên là bắt buộc';
    if (value.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email không hợp lệ';
    return '';
  };

  const validatePhone = (value) => {
    if (!value.trim()) return 'Số điện thoại là bắt buộc';
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Số điện thoại không hợp lệ';
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'status' && key !== 'interestLevel' && key !== 'campaignId') {
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
      [name]: value
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
      toast.error('Vui lòng sửa các lỗi validation trước khi gửi');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Đang thêm học viên tiềm năng...", { id: "add-lead" });
      
      const response = await leadService.addLead({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status || 'new',
        interestLevel: formData.interestLevel || 'medium',
        campaignId: formData.campaignId ? Number(formData.campaignId) : null
      });

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, 'Không thể thêm học viên tiềm năng. Vui lòng thử lại.');
        toast.error(errorMessage, {
          id: "add-lead",
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      // Success case
      toast.success('Đã thêm học viên tiềm năng thành công!', {
        id: "add-lead",
        duration: 3000,
        position: "top-center"
      });
      router.push('/hvtiemnang');
    } catch (error) {
      console.error('Error adding lead:', error);
      const errorMessage = getErrorMessage(error, 'Không thể thêm học viên tiềm năng. Vui lòng thử lại!');
      toast.error(errorMessage, {
        id: "add-lead",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Thêm Học viên Tiềm năng mới</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Họ tên: <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ tên đầy đủ"
            className={errors['fullName'] ? styles.errorInput : ''}
            required
          />
          {errors['fullName'] && <span className={styles.errorText}>{errors['fullName']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email: <span className={styles.required}>*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
            className={errors['email'] ? styles.errorInput : ''}
            required
          />
          {errors['email'] && <span className={styles.errorText}>{errors['email']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại: <span className={styles.required}>*</span></label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className={errors['phone'] ? styles.errorInput : ''}
            required
          />
          {errors['phone'] && <span className={styles.errorText}>{errors['phone']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Trạng thái:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="new">Mới</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="qualified">Đủ điều kiện</option>
            <option value="converted">Đã chuyển đổi</option>
            <option value="lost">Mất liên lạc</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Mức độ quan tâm:</label>
          <select
            name="interestLevel"
            value={formData.interestLevel}
            onChange={handleChange}
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Chiến dịch:</label>
          <select
            name="campaignId"
            value={formData.campaignId}
            onChange={handleChange}
          >
            <option value="">Chọn chiến dịch</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Thêm Học viên Tiềm năng'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/hvtiemnang')}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLeadPage;