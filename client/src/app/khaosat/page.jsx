'use client';
import React, { useState, useEffect } from 'react';
import { leadService } from '../api/lead/leadService';
import { channelService } from '../api/channel/channelService';
import { campaignService } from '../api/campaign/campaignService';
import toast from 'react-hot-toast';
import styles from './khaosat.module.css';

const SurveyPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    channelId: '',
    campaignId: '',
    notes: ''
  });

  const [channels, setChannels] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    channelId: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Fetch channels and campaigns on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active channels
        const channelsResponse = await channelService.getChannels({ 
          page: 1, 
          size: 100, 
          status: 'active' 
        });
        if (channelsResponse && channelsResponse.items) {
          setChannels(channelsResponse.items);
        } else if (Array.isArray(channelsResponse)) {
          setChannels(channelsResponse);
        }

        // Fetch active campaigns
        const campaignsResponse = await campaignService.getCampaigns({ 
          page: 1, 
          size: 100, 
          status: 'running' 
        });
        if (campaignsResponse && campaignsResponse.items) {
          setCampaigns(campaignsResponse.items);
        } else if (Array.isArray(campaignsResponse)) {
          setCampaigns(campaignsResponse);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get campaignId from URL params if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const campaignId = params.get('campaignId');
      if (campaignId) {
        setFormData(prev => ({ ...prev, campaignId }));
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (!formData.channelId) {
      newErrors.channelId = 'Vui lòng chọn kênh truyền thông';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    setSubmitting(true);

    try {
      toast.loading('Đang gửi khảo sát...', { id: 'submit-survey' });

      const leadData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim().replace(/\s/g, ''),
        channelId: formData.channelId ? Number(formData.channelId) : null,
        campaignId: formData.campaignId ? Number(formData.campaignId) : null,
        status: 'new',
        interestLevel: 'medium',
        tags: ['khảo_sát']
      };

      const response = await leadService.addLead(leadData);

      // Check for errors
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = response.message || response.error || 'Không thể gửi khảo sát';
        toast.error(errorMessage, {
          id: 'submit-survey',
          duration: 4000,
          position: 'top-center'
        });
        return;
      }

      toast.success('Cảm ơn bạn đã tham gia khảo sát! Chúng tôi sẽ liên hệ với bạn sớm nhất.', {
        id: 'submit-survey',
        duration: 5000,
        position: 'top-center'
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        channelId: '',
        campaignId: formData.campaignId, // Keep campaignId if from URL
        notes: ''
      });
      setErrors({
        fullName: '',
        email: '',
        phone: '',
        channelId: ''
      });
      setSubmitted(true);

      // Reset submitted state after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting survey:', error);
      const errorMessage = error.message || 'Không thể gửi khảo sát. Vui lòng thử lại!';
      toast.error(errorMessage, {
        id: 'submit-survey',
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải form khảo sát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>📋</span>
          </div>
          <h1 className={styles.title}>Khảo sát Kênh Truyền thông</h1>
          <p className={styles.subtitle}>
            Chúng tôi muốn biết bạn đã biết đến chương trình qua kênh nào. 
            Vui lòng điền thông tin bên dưới để chúng tôi có thể hỗ trợ bạn tốt hơn.
          </p>
        </div>

        {submitted ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h2>Cảm ơn bạn đã tham gia khảo sát!</h2>
            <p>Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ với bạn sớm nhất.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Họ và tên <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={formData?.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                className={`${styles.input} ${errors?.fullName ? styles.inputError : ''}`}
                required
              />
              {errors?.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Nhập địa chỉ email của bạn"
                className={`${styles.input} ${errors?.email ? styles.inputError : ''}`}
                required
              />
              {errors?.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Số điện thoại <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData?.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Nhập số điện thoại của bạn"
                className={`${styles.input} ${errors?.phone ? styles.inputError : ''}`}
                required
              />
              {errors?.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="channelId" className={styles.label}>
                Bạn biết đến chương trình qua kênh nào? <span className={styles.required}>*</span>
              </label>
              <select
                id="channelId"
                value={formData?.channelId || ''}
                onChange={(e) => handleChange('channelId', e.target.value)}
                className={`${styles.select} ${errors?.channelId ? styles.inputError : ''}`}
                required
              >
                <option value="">-- Chọn kênh truyền thông --</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
              {errors?.channelId && <span className={styles.errorText}>{errors.channelId}</span>}
              {channels.length === 0 && (
                <p className={styles.helpText}>
                  Đang tải danh sách kênh truyền thông...
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="campaignId" className={styles.label}>
                Chiến dịch (nếu có)
              </label>
              <select
                id="campaignId"
                value={formData?.campaignId || ''}
                onChange={(e) => handleChange('campaignId', e.target.value)}
                className={styles.select}
              >
                <option value="">-- Chọn chiến dịch (tùy chọn) --</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              <p className={styles.helpText}>
                Nếu bạn biết đến chương trình qua một chiến dịch cụ thể, vui lòng chọn ở đây
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Ghi chú thêm (tùy chọn)
              </label>
              <textarea
                id="notes"
                value={formData?.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Bạn có muốn chia sẻ thêm điều gì không?"
                rows={4}
                className={styles.textarea}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                disabled={submitting}
                className={styles.submitButton}
              >
                {submitting ? (
                  <>
                    <span className={styles.spinnerSmall}></span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Gửi khảo sát
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    channelId: '',
                    campaignId: formData.campaignId,
                    notes: ''
                  });
                  setErrors({
                    fullName: '',
                    email: '',
                    phone: '',
                    channelId: ''
                  });
                }}
                className={styles.resetButton}
                disabled={submitting}
              >
                Làm lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SurveyPage;

