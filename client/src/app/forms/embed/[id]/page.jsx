'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formService } from '../../../api/form/formService';
import toast from 'react-hot-toast';
import styles from './embed.module.css';

const FormEmbedPage = () => {
  const params = useParams();
  const formId = params?.id;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const formData = await formService.getFormById(formId);
      setForm(formData);

      // Initialize form data với giá trị rỗng
      const initialData = {};
      if (formData.fields && Array.isArray(formData.fields)) {
        formData.fields.forEach(field => {
          const fieldId = field.id || field.label?.toLowerCase().replace(/\s+/g, '');
          initialData[fieldId] = '';
        });
      }
      setFormData(initialData);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast.error('Không thể tải form. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error khi user nhập
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };



  const handleBlur = async (fieldId, value, type) => {
    if (type === 'tel' && value && /^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
      try {
        // Get campaignId from form to check duplicates only within same campaign
        const campaignId = form?.campaignId || form?.settings?.campaignId || null;
        const result = await formService.checkPhone(value, campaignId);
        if (result.exists) {
          setErrors(prev => ({
            ...prev,
            [fieldId]: campaignId
              ? 'Số điện thoại đã tồn tại trong chiến dịch này'
              : 'Số điện thoại đã tồn tại trong hệ thống'
          }));
        }
      } catch (err) {
        console.error('Error checking phone:', err);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form || !form.fields) return true;

    form.fields.forEach(field => {
      const fieldId = field.id || field.label?.toLowerCase().replace(/\s+/g, '');
      const value = formData[fieldId];

      if (field.required && (!value || value.trim() === '')) {
        newErrors[fieldId] = `${field.label} là bắt buộc`;
      }

      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[fieldId] = 'Email không hợp lệ';
      }

      if (field.type === 'tel' && value && !/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
        newErrors[fieldId] = 'Số điện thoại không hợp lệ';
      }
    });

    // Kiểm tra lỗi trùng số điện thoại từ errors state
    Object.keys(errors).forEach(key => {
      if (errors[key]) {
        newErrors[key] = errors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra lỗi trùng số điện thoại
    const hasPhoneError = Object.keys(errors).some(key =>
      errors[key] && errors[key].includes('tồn tại')
    );

    if (hasPhoneError) {
      toast.error('Số điện thoại đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!');
      return;
    }

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);

    try {
      const response = await formService.submitForm(formId, { data: formData });

      if (response && response.success) {
        toast.success('Đã gửi form thành công! Cảm ơn bạn đã đăng ký.');
        // Reset form
        const initialData = {};
        form.fields.forEach(field => {
          const fieldId = field.id || field.label?.toLowerCase().replace(/\s+/g, '');
          initialData[fieldId] = '';
        });
        setFormData(initialData);
      } else {
        throw new Error('Submit failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Không thể gửi form. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const fieldId = field.id || field.label?.toLowerCase().replace(/\s+/g, '');
    const value = formData[fieldId] || '';
    const error = errors[fieldId];
    /** @type {any} */
    const fieldStyle = {
      '--primary-color': form?.settings?.mauSac || '#5d57c9'
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div key={fieldId} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              onBlur={(e) => handleBlur(fieldId, e.target.value, field.type)}
              placeholder={field.placeholder || ''}
              required={field.required}
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              style={fieldStyle}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldId} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              placeholder={field.placeholder || ''}
              required={field.required}
              rows={4}
              className={`${styles.textarea} ${error ? styles.inputError : ''}`}
              style={fieldStyle}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'select':
        return (
          <div key={fieldId} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              required={field.required}
              className={`${styles.select} ${error ? styles.inputError : ''}`}
              style={fieldStyle}
            >
              <option value="">{field.placeholder || 'Chọn...'}</option>
              {field.options && field.options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'date':
        return (
          <div key={fieldId} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(fieldId, e.target.value)}
              required={field.required}
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              style={fieldStyle}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Không tìm thấy form</div>
      </div>
    );
  }

  if (form.status !== 'active') {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Form này hiện không khả dụng</div>
      </div>
    );
  }

  /** @type {any} */
  const formStyle = {
    '--primary-color': form.settings?.mauSac || '#5d57c9'
  };

  return (
    <div className={styles.container} style={formStyle}>
      <div className={styles.formWrapper}>
        {form.settings?.hienThiTieuDe && form.name && (
          <h1 className={styles.title}>{form.name}</h1>
        )}

        {form.settings?.hienThiMoTa && form.description && (
          <p className={styles.description}>{form.description}</p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {form.fields && form.fields.map(field => renderField(field))}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting ? 'Đang gửi...' : (form.settings?.nutSubmit || 'Gửi')}
            </button>

            {form.settings?.nutReset && (
              <button
                type="reset"
                onClick={() => {
                  const initialData = {};
                  form.fields.forEach(field => {
                    const fieldId = field.id || field.label?.toLowerCase().replace(/\s+/g, '');
                    initialData[fieldId] = '';
                  });
                  setFormData(initialData);
                  setErrors({});
                }}
                className={styles.resetButton}
              >
                {form.settings.nutReset}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEmbedPage;


