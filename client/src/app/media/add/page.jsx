'use client';
import React, { useState } from "react";
import styles from "./add.module.css";
import { mediaService } from "../../api/media/mediaService";
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

const AddMediaPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    url: '',
    description: '',
    fileSize: '',
    mimeType: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) return 'Tên media không được để trống';
    if (value.trim().length < 2) return 'Tên media phải có ít nhất 2 ký tự';
    return '';
  };

  const validateUrl = (value) => {
    if (value && value.trim()) {
      try {
        new URL(value);
      } catch (e) {
        return 'URL không hợp lệ';
      }
    }
    return '';
  };

  const validateFileSize = (value) => {
    if (value && value.trim()) {
      const num = Number(value);
      if (isNaN(num) || num < 0) return 'Kích thước file phải là số dương';
    }
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'url':
        return validateUrl(value);
      case 'fileSize':
        return validateFileSize(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === 'name' || key === 'url' || key === 'fileSize') {
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
      toast.error('Vui lòng sửa các lỗi trước khi gửi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      toast.loading("Đang thêm media...", { id: "add-media" });
      
      const result = await mediaService.addMedia({
        name: formData.name.trim(),
        type: formData.type || null,
        url: formData.url.trim() || null,
        description: formData.description.trim() || null,
        fileSize: formData.fileSize ? Number(formData.fileSize) : null,
        mimeType: formData.mimeType.trim() || null,
        status: formData.status || 'active'
      });
      
      // Check if API response contains error
      if (result && (result.code >= 400 || result.error || result.status >= 400)) {
        const errorMessage = getErrorMessage(result, 'Không thể thêm media. Vui lòng thử lại.');
        toast.error(errorMessage, {
          id: "add-media",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      // Success case
      toast.success("Đã thêm media thành công!", {
        id: "add-media",
        duration: 3000,
        position: "top-center"
      });
      router.push('/media');
    } catch (error) {
      console.error('Error adding media:', error);
      
      const errorMessage = getErrorMessage(error, 'Không thể thêm media. Vui lòng thử lại.');
      toast.error(errorMessage, {
        id: "add-media",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thêm media mới</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Tên media: <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên media"
            className={errors['name'] ? styles.errorInput : ''}
            required
          />
          {errors['name'] && <span className={styles.errorText}>{errors['name']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Loại:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Chọn loại</option>
            <option value="image">Hình ảnh</option>
            <option value="video">Video</option>
            <option value="document">Tài liệu</option>
            <option value="audio">Âm thanh</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>URL:</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/media.jpg"
            className={errors['url'] ? styles.errorInput : ''}
          />
          {errors['url'] && <span className={styles.errorText}>{errors['url']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Mô tả:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả cho media"
            rows="4"
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Kích thước file (bytes):</label>
          <input
            type="number"
            name="fileSize"
            value={formData.fileSize}
            onChange={handleChange}
            placeholder="Nhập kích thước file (bytes)"
            min="0"
            className={errors['fileSize'] ? styles.errorInput : ''}
          />
          {errors['fileSize'] && <span className={styles.errorText}>{errors['fileSize']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>MIME Type:</label>
          <input
            type="text"
            name="mimeType"
            value={formData.mimeType}
            onChange={handleChange}
            placeholder="image/jpeg, video/mp4, etc."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Trạng thái:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang thêm...' : 'Thêm media'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/media')}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMediaPage;

