'use client';
import React, { useState, useEffect } from "react";
import styles from "./add.module.css";
import { studentService } from "../../api/student/studentService";
import { campaignService } from "../../api/campaign/campaignService";
import { channelService } from "../../api/channel/channelService";
import { staffService } from "../../api/staff/staffService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AddStudentPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'active',
    enrollmentStatus: 'pending',
    campaignId: null,
    channelId: null,
    assignedStaffId: null,
    newStudent: false
  });

  const [channels, setChannels] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [staff, setStaff] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [channelsResponse, campaignsResponse, staffResponse] = await Promise.all([
          channelService.getChannels({ page: 1, size: 100 }),
          campaignService.getCampaigns({ page: 1, size: 100 }),
          staffService.getStaffMembers({ page: 1, size: 100 })
        ]);

        if (channelsResponse && channelsResponse.items) {
          setChannels(channelsResponse.items);
        } else if (Array.isArray(channelsResponse)) {
          setChannels(channelsResponse);
        }

        if (campaignsResponse && campaignsResponse.items) {
          setCampaigns(campaignsResponse.items);
        } else if (Array.isArray(campaignsResponse)) {
          setCampaigns(campaignsResponse);
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
  const validateFullName = (value) => {
    if (!value.trim()) return 'Họ tên không được để trống';
    if (value.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return '';
  };

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email không được để trống';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email không đúng định dạng';
    return '';
  };

  const validatePhone = (value) => {
    if (!value.trim()) return 'Số điện thoại không được để trống';
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
      if (key !== 'campaignId' && key !== 'channelId' && key !== 'assignedStaffId' && key !== 'newStudent') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' && (name === 'campaignId' || name === 'channelId' || name === 'assignedStaffId') ? null : value)
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
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Đang thêm học viên...", { id: "add-student" });

      const result = await studentService.addStudent({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        enrollmentStatus: formData.enrollmentStatus,
        campaignId: formData.campaignId ? Number(formData.campaignId) : null,
        channelId: formData.channelId ? Number(formData.channelId) : null,
        assignedStaffId: formData.assignedStaffId ? Number(formData.assignedStaffId) : null,
        newStudent: formData.newStudent
      });

      // Check if API response contains error
      if (result && (result.code >= 400 || result.error || result.status >= 400)) {
        const errorMessage = result.message || result.error || 'Không thể thêm học viên. Vui lòng thử lại.';
        toast.error(errorMessage, {
          id: "add-student",
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      // Success case
      toast.success("Đã thêm học viên thành công!", {
        id: "add-student",
        duration: 3000,
        position: "top-center"
      });
      router.push('/hocvien');
    } catch (error) {
      console.error('Error adding student:', error);

      // Parse error response to get message from API
      let errorMessage = 'Không thể thêm học viên. Vui lòng thử lại.';

      if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        id: "add-student",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Thêm học viên mới</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Họ tên:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ tên"
            className={errors['fullName'] ? styles.errorInput : ''}
            required
          />
          {errors['fullName'] && <span className={styles.errorText}>{errors['fullName']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            className={errors['email'] ? styles.errorInput : ''}
            required
          />
          {errors['email'] && <span className={styles.errorText}>{errors['email']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Số điện thoại:</label>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Trạng thái đăng ký:</label>
          <select
            name="enrollmentStatus"
            value={formData.enrollmentStatus}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Chiến dịch:</label>
          <select
            name="campaignId"
            value={formData.campaignId || ''}
            onChange={handleChange}
          >
            <option value="">Chọn chiến dịch</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
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
          <label>Nhân viên phụ trách:</label>
          <select
            name="assignedStaffId"
            value={formData.assignedStaffId || ''}
            onChange={handleChange}
          >
            <option value="">Chọn nhân viên</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
            ))}
          </select>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="newStudent"
              checked={formData.newStudent}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>Học viên mới</span>
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang thêm...' : 'Thêm học viên'}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.push('/hocvien')}
            disabled={isSubmitting}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;