"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from '../api/statistic/statisticService';
import styles from './revenue.module.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày trước
    endDate: new Date().toISOString().split('T')[0] // Hôm nay
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticService.getRevenue(dateRange.startDate, dateRange.endDate);
      
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
          <div className={styles.cardIcon}>🛍️</div>
          <div className={styles.cardContent}>
            <h3>Tổng đơn hàng</h3>
            <p className={styles.cardNumber}>{statistics?.statisticTotal?.countOrder || 0}</p>
            <span className={styles.cardSubtext}>Đơn hàng</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <h3>Tổng doanh thu</h3>
            <p style={{fontSize: '0.875rem', color: '#8391a2', marginTop: '8px'}}>
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
        {/* Biểu đồ Pie - Phân bổ Doanh thu theo Chiến dịch */}
        <div className={styles.chartCard}>
          <h2>Biểu đồ Tròn - Phân bổ Doanh thu theo Chiến dịch</h2>
          <div className={styles.rechartsContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={statistics?.data?.topCampaigns?.filter(c => c.revenue > 0).map(campaign => ({
                    name: campaign.name,
                    value: campaign.revenue
                  })) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(statistics?.data?.topCampaigns?.filter(c => c.revenue > 0) || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{background:"#151c2c", border:"none", color: "white"}}
                  formatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(Number(value))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Bar - Doanh thu theo Thời gian */}
        <div className={styles.chartCard}>
          <h2>Biểu đồ Cột - Doanh thu theo Thời gian</h2>
          <div className={styles.debugInfo}>
            <p>Dữ liệu: {statistics?.data?.revenueData?.length || 0} điểm dữ liệu</p>
            <p>Khoảng thời gian: {dateRange.startDate} đến {dateRange.endDate}</p>
          </div>
          <div className={styles.rechartsContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={statistics?.data?.revenueData?.map(item => ({
                  date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                  enrollments: item.enrollments || 0,
                  revenue: item.revenue || 0
                })) || [
                  { date: '01/01', enrollments: 15, revenue: 2500000 },
                  { date: '01/02', enrollments: 18, revenue: 3000000 },
                  { date: '01/03', enrollments: 21, revenue: 3500000 },
                  { date: '01/04', enrollments: 24, revenue: 4000000 },
                  { date: '01/05', enrollments: 27, revenue: 4500000 }
                ]}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  stroke="#8884d8"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  tickFormatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(Number(value))}
                />
                <Tooltip 
                  contentStyle={{background:"#151c2c", border:"none", color: "white"}}
                  formatter={(value, name) => {
                    if (name === 'Doanh thu') {
                      return [new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(Number(value)), name];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="enrollments" fill="#8884d8" name="Số đăng ký" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RevenuePage;