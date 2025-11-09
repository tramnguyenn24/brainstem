"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from '../api/statistic/statisticService';
import { campaignService } from '../api/campaign/campaignService';
import { studentService } from '../api/student/studentService';
import styles from './statistics.module.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from "react-hot-toast";

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [students, setStudents] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch campaigns and students for charts
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [campaignsResponse, studentsResponse] = await Promise.all([
          campaignService.getCampaigns({ page: 1, size: 100 }),
          studentService.getStudents({ page: 1, size: 100 })
        ]);

        if (campaignsResponse && campaignsResponse.data) {
          setCampaigns(campaignsResponse.data);
        } else if (Array.isArray(campaignsResponse)) {
          setCampaigns(campaignsResponse);
        }

        if (studentsResponse && studentsResponse.data) {
          setStudents(studentsResponse.data);
        } else if (Array.isArray(studentsResponse)) {
          setStudents(studentsResponse);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };
    fetchChartData();
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await statisticService.getRevenue(dateRange.startDate, dateRange.endDate);
      
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

  // Dữ liệu cho biểu đồ cột
  const campaignData = campaigns.map(campaign => ({
    name: campaign.name || campaign.TenCD,
    chiPhi: (campaign.spend || campaign.actualCost || campaign.ChiPhi || 0) / 1000000, // Chuyển về triệu VNĐ
    doanhThu: (campaign.revenue || campaign.actualRevenue || campaign.DoanhThu || 0) / 1000000,
    loiNhuan: ((campaign.revenue || campaign.actualRevenue || campaign.DoanhThu || 0) - (campaign.spend || campaign.actualCost || campaign.ChiPhi || 0)) / 1000000
  }));

  // Dữ liệu cho biểu đồ tròn - Phân bố học viên theo chiến dịch
  const studentDistribution = students.reduce((acc, student) => {
    const campaignId = student.campaignId || student.MaCD;
    if (campaignId) {
      const campaign = campaigns.find(c => (c.id || c.MaCD) === campaignId);
      if (campaign) {
        const campaignName = campaign.name || campaign.TenCD;
        const existing = acc.find(item => item.name === campaignName);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: campaignName, value: 1 });
        }
      }
    }
    return acc;
  }, []);

  // Fallback data nếu không có dữ liệu
  const fallbackCampaignData = [
    { name: 'Chiến dịch 1', chiPhi: 5, doanhThu: 15, loiNhuan: 10 },
    { name: 'Chiến dịch 2', chiPhi: 8, doanhThu: 20, loiNhuan: 12 },
    { name: 'Chiến dịch 3', chiPhi: 6, doanhThu: 18, loiNhuan: 12 },
    { name: 'Chiến dịch 4', chiPhi: 10, doanhThu: 25, loiNhuan: 15 }
  ];

  const fallbackStudentDistribution = [
    { name: 'Chiến dịch 1', value: 3 },
    { name: 'Chiến dịch 2', value: 2 },
    { name: 'Chiến dịch 3', value: 1 },
    { name: 'Chiến dịch 4', value: 1 }
  ];

  // Màu sắc cho biểu đồ
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Báo cáo Thống kê</h1>
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
        </div>
      </div>

      <div className={styles.content}>
        {/* Thống kê tổng quan */}
        <div className={styles.overview}>
          <h2>Tổng quan</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3>Tổng học viên</h3>
                <p className={styles.statNumber}>{statistics?.data?.totalStudents || 0}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👨‍🏫</div>
              <div className={styles.statContent}>
                <h3>Tổng giáo viên</h3>
                <p className={styles.statNumber}>{statistics?.data?.totalTeachers || 0}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📚</div>
              <div className={styles.statContent}>
                <h3>Tổng khóa học</h3>
                <p className={styles.statNumber}>{statistics?.data?.totalCourses || 0}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statContent}>
                <h3>Tổng chiến dịch</h3>
                <p className={styles.statNumber}>{statistics?.data?.totalCampaigns || 0}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎯</div>
              <div className={styles.statContent}>
                <h3>HV Tiềm năng</h3>
                <p className={styles.statNumber}>{statistics?.data?.totalPotentialStudents || 0}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <h3>Tổng doanh thu</h3>
                <p className={styles.statNumber}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(statistics?.data?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ cột - Hiệu quả chiến dịch */}
        <div className={styles.chartSection}>
          <h2>Hiệu quả Chiến dịch Marketing</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={campaignData.length > 0 ? campaignData : fallbackCampaignData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} triệu VNĐ`, 
                    name === 'chiPhi' ? 'Chi phí' : 
                    name === 'doanhThu' ? 'Doanh thu' : 'Lợi nhuận'
                  ]}
                />
                <Legend />
                <Bar dataKey="chiPhi" fill="#8884d8" name="Chi phí" />
                <Bar dataKey="doanhThu" fill="#82ca9d" name="Doanh thu" />
                <Bar dataKey="loiNhuan" fill="#ffc658" name="Lợi nhuận" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn - Phân bố học viên theo chiến dịch */}
        <div className={styles.chartSection}>
          <h2>Phân bố Học viên theo Chiến dịch</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={studentDistribution.length > 0 ? studentDistribution : fallbackStudentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(studentDistribution.length > 0 ? studentDistribution : fallbackStudentDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng top khóa học */}
        <div className={styles.tableSection}>
          <h2>Top Khóa học Phổ biến</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên khóa học</th>
                  <th>Số đăng ký</th>
                  <th>Doanh thu</th>
                  <th>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {statistics?.data?.topCourses?.map((course, index) => (
                  <tr key={course.id}>
                    <td>{index + 1}</td>
                    <td>{course.name}</td>
                    <td>{course.enrollments}</td>
                    <td>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(course.revenue)}
                    </td>
                    <td>
                      {((course.enrollments / statistics.data.totalStudents) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
