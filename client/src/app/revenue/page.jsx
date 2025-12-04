"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from '../api/statistic/statisticService';
import styles from './revenue.module.css';
import { BarChartCard } from '../components/charts';
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const RevenuePage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState('day'); // 'day', 'week', 'month'
  const [campaignSortOrder, setCampaignSortOrder] = useState('desc'); // 'desc' (cao->thấp) | 'asc' (thấp->cao)
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 ngày gần nhất
    return { startDate, endDate };
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange, period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticService.getRevenue(dateRange.startDate, dateRange.endDate, period);

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải dữ liệu thống kê");
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      setStatistics(response);
      setError(null);
      console.log("Statistics loaded:", response);
      console.log("Revenue data:", response?.data?.revenueData);
      console.log("Revenue data length:", response?.data?.revenueData?.length);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Lỗi khi tải dữ liệu thống kê');
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    // Tự động điều chỉnh date range dựa trên period
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate;

    if (newPeriod === 'day') {
      // 7 ngày gần nhất (bao gồm hôm nay)
      startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (newPeriod === 'week') {
      // 4 tuần gần nhất (28 ngày)
      startDate = new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (newPeriod === 'month') {
      // 12 tháng gần nhất
      startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1).toISOString().split('T')[0];
    }

    setDateRange({ startDate, endDate });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.loading("Đang xuất báo cáo...", { id: "export-report" });

      const result = await statisticService.downloadRevenueExport(dateRange.startDate, dateRange.endDate);
      // Kiểm tra lỗi từ response
      if (result && (result.code >= 400 || result.error || result.status >= 400)) {
        const errorMessage = getErrorMessage(result, "Không thể xuất báo cáo");
        toast.error(errorMessage, {
          id: "export-report",
          duration: 4000,
          position: "top-center"
        });
        return;
      }
      // Thông báo thành công
      toast.success(`Xuất báo cáo thành công: ${result.filename}`, {
        id: "export-report",
        duration: 3000,
        position: "top-center"
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      const errorMessage = getErrorMessage(err, 'Lỗi khi xuất báo cáo');
      toast.error(errorMessage, {
        id: "export-report",
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setExporting(false);
    }
  };
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Lỗi tải dữ liệu</h2>
          <p>{error}</p>
          <button onClick={fetchStatistics} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Báo cáo Doanh thu</h1>
        <div className={styles.dateFilter}>
          <div className={styles.periodSelector}>
            <label>Hiển thị theo:</label>
            <div className={styles.periodButtons}>
              <button
                className={`${styles.periodButton} ${period === 'day' ? styles.active : ''}`}
                onClick={() => handlePeriodChange('day')}
              >
                Theo ngày
              </button>
              <button
                className={`${styles.periodButton} ${period === 'week' ? styles.active : ''}`}
                onClick={() => handlePeriodChange('week')}
              >
                Theo tuần
              </button>
              <button
                className={`${styles.periodButton} ${period === 'month' ? styles.active : ''}`}
                onClick={() => handlePeriodChange('month')}
              >
                Theo tháng
              </button>
            </div>
          </div>
          <div className={styles.dateGroup}>
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateGroup}>
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={styles.exportButton}
          >
            {exporting ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Đang xuất...
              </>
            ) : (
              <>
                📊 Xuất báo cáo
              </>
            )}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Dashboard Cards */}
        <div className={styles.dashboard}>

          <div className={styles.card}>
            <div className={styles.cardIcon}>👥</div>
            <div className={styles.cardContent}>
              <h3>Học viên</h3>
              <p className={styles.cardNumber}>{statistics?.data?.totalStudents || 0}</p>
              <span className={styles.cardSubtext}>Tổng số học viên</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📚</div>
            <div className={styles.cardContent}>
              <h3>Khóa học</h3>
              <p className={styles.cardNumber}>{statistics?.data?.totalCourses || 0}</p>
              <span className={styles.cardSubtext}>Tổng số khóa học</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📈</div>
            <div className={styles.cardContent}>
              <h3>Chiến dịch</h3>
              <p className={styles.cardNumber}>{statistics?.data?.totalCampaigns || 0}</p>
              <span className={styles.cardSubtext}>Tổng số chiến dịch</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🎯</div>
            <div className={styles.cardContent}>
              <h3>HV Tiềm năng</h3>
              <p className={styles.cardNumber}>{statistics?.data?.totalPotentialStudents || 0}</p>
              <span className={styles.cardSubtext}>Học viên tiềm năng</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardContent}>
              <h3>Tổng doanh thu</h3>
              <p style={{ fontSize: '0.875rem', color: '#8391a2', marginTop: '8px' }}>
                (Tính từ tất cả học viên đã đăng ký khóa học)
              </p>
              <p className={styles.cardNumber}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(statistics?.statisticTotal?.countRevenue || 0)}
              </p>
              <span className={styles.cardSubtext}>VNĐ</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className={styles.chartsContainer}>
          {/* Biểu đồ Cột - Doanh thu theo Chiến dịch */}
          {(() => {
            const rawCampaigns = (statistics?.data?.topCampaigns || []).map(c => ({
              name: c.name,
              revenue: Number(c.revenue) || 0
            }));

            if (!rawCampaigns.length) {
              return (
                <div className={styles.chartCard}>
                  <h2>Biểu đồ Cột - Doanh thu theo Chiến dịch</h2>
                  <div className={styles.noData}>
                    Không có dữ liệu doanh thu theo chiến dịch trong khoảng thời gian đã chọn.
                  </div>
                </div>
              );
            }

            const hasPositive = rawCampaigns.some(c => c.revenue > 0);
            const campaignData = (hasPositive ? rawCampaigns.filter(c => c.revenue > 0) : rawCampaigns)
              .sort((a, b) =>
                campaignSortOrder === 'desc'
                  ? b.revenue - a.revenue
                  : a.revenue - b.revenue
              );

            return (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
                  <button
                    type="button"
                    className={styles.periodButton}
                    onClick={() => setCampaignSortOrder(campaignSortOrder === 'desc' ? 'asc' : 'desc')}
                    style={{
                      padding: '8px 16px',
                      background: '#313a46',
                      border: '1px solid #404954',
                      borderRadius: '6px',
                      color: '#dee2e6',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {campaignSortOrder === 'desc' ? 'Doanh thu cao → thấp' : 'Doanh thu thấp → cao'}
                  </button>
                </div>
                <BarChartCard
                  title="Biểu đồ Cột - Doanh thu theo Chiến dịch"
                  data={campaignData.map(c => ({
                    name: c.name,
                    'Doanh thu (VNĐ)': c.revenue
                  }))}
                  dataKey="name"
                  bars={[{
                    dataKey: 'Doanh thu (VNĐ)',
                    name: 'Doanh thu (VNĐ)',
                    color: '#82ca9d'
                  }]}
                  xAxisLabel="Chiến dịch"
                  yAxisLabel="Doanh thu"
                  height={400}
                  colors={{ primary: '#82ca9d' }}
                  hideXAxisLabels={true}
                  yAxisFormatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(Number(value))}
                  tooltipFormatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(Number(value))}
                />
              </div>
            );
          })()}

          {/* Biểu đồ Bar - Doanh thu theo Thời gian */}
          <BarChartCard
            title="Biểu đồ Cột - Doanh thu theo Thời gian"
            data={statistics?.data?.revenueData?.map(item => ({
              name: item.date,
              'Doanh thu': item.revenue || 0
            })) || [
                { name: '01/01', 'Doanh thu': 2500000 },
                { name: '01/02', 'Doanh thu': 3000000 },
                { name: '01/03', 'Doanh thu': 3500000 },
                { name: '01/04', 'Doanh thu': 4000000 },
                { name: '01/05', 'Doanh thu': 4500000 }
              ]}
            dataKey="name"
            bars={[{
              dataKey: 'Doanh thu',
              name: 'Doanh thu',
              color: '#82ca9d'
            }]}
            xAxisLabel="Thời gian"
            yAxisLabel="Doanh thu"
            height={400}
            colors={{ primary: '#82ca9d' }}
            hideXAxisLabels={false}
            yAxisFormatter={(value) => new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact'
            }).format(Number(value))}
            tooltipFormatter={(value) => new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(Number(value))}
          />

          {/* Biểu đồ Bar - Số đăng ký theo Thời gian */}
          <BarChartCard
            title="Biểu đồ Cột - Số đăng ký theo Thời gian"
            data={statistics?.data?.revenueData?.map(item => ({
              name: item.date,
              'Số đăng ký': item.enrollments || 0
            })) || [
                { name: '01/01', 'Số đăng ký': 15 },
                { name: '01/02', 'Số đăng ký': 18 },
                { name: '01/03', 'Số đăng ký': 21 },
                { name: '01/04', 'Số đăng ký': 24 },
                { name: '01/05', 'Số đăng ký': 27 }
              ]}
            dataKey="name"
            bars={[{
              dataKey: 'Số đăng ký',
              name: 'Số đăng ký',
              color: '#8884d8'
            }]}
            xAxisLabel="Thời gian"
            yAxisLabel="Số đăng ký"
            height={400}
            colors={{ primary: '#8884d8' }}
            hideXAxisLabels={false}
            yAxisFormatter={undefined}
            tooltipFormatter={undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;