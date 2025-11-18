'use client';
import React, { useState } from "react";
import styles from "./add.module.css";
import { courseService } from "../../api/course/courseService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AddCoursePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) return 'Tên khóa học không được để trống';
    if (value.trim().length < 3) return 'Tên khóa học phải có ít nhất 3 ký tự';
    return '';
  };

  const validatePrice = (value) => {
    if (value && Number(value) < 0) return 'Giá không được âm';
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'price':
        return validatePrice(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    
    const priceError = validateField('price', formData.price);
    if (priceError) newErrors.price = priceError;
    
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
      toast.error('Vui lòng sửa các lỗi trước khi gửi!', {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      toast.loading("Đang thêm khóa học...", { id: "add-course" });
      
      const result = await courseService.addCourse({
        name: formData.name,
        description: formData.description,
        price: formData.price ? Number(formData.price) : null,
        status: formData.status
      });
      
      // Check if API response contains error
      if (result && (result.code >= 400 || result.error || result.status >= 400)) {
        const errorMessage = result.message || result.error || 'Không thể thêm khóa học. Vui lòng thử lại.';
        toast.error(errorMessage, {
          id: "add-course",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      
      // Success case
      toast.success("Đã thêm khóa học thành công!", {
        id: "add-course",
        duration: 3000,
        position: "top-center"
      });
      router.push('/khoahoc');
    } catch (error) {
      console.error('Error adding course:', error);
      
      // Parse error response to get message from API
      let errorMessage = 'Không thể thêm khóa học. Vui lòng thử lại.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        id: "add-course",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thêm khóa học mới</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Tên khóa học: <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên khóa học"
            className={errors['name'] ? styles.errorInput : ''}
            required
          />
          {errors['name'] && <span className={styles.errorText}>{errors['name']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Mô tả:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả về khóa học"
            rows="5"
            className={styles.textarea}
          />
          <small className={styles.helpText}>Mô tả chi tiết về nội dung, lợi ích và đối tượng của khóa học</small>
        </div>

        <div className={styles.formGroup}>
          <label>Giá (VNĐ):</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Nhập giá khóa học (để trống nếu miễn phí)"
            className={errors['price'] ? styles.errorInput : ''}
            min="0"
            step="1000"
          />
          {errors['price'] && <span className={styles.errorText}>{errors['price']}</span>}
          <small className={styles.helpText}>Để trống nếu khóa học miễn phí</small>
        </div>

        <div className={styles.formGroup}>
          <label>Trạng thái: <span className={styles.required}>*</span></label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <small className={styles.helpText}>Chọn "Hoạt động" để khóa học hiển thị công khai</small>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang thêm...' : 'Thêm khóa học'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/khoahoc')}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCoursePage;

