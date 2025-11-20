"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from './api/statistic/statisticService';
import { campaignService } from './api/campaign/campaignService';
import { studentService } from './api/student/studentService';
import styles from './dashboard.module.css';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BarChart, LineChart } from '@mui/x-charts';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create dark theme for charts
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#727cf5',
    },
    secondary: {
      main: '#4ecdc4',
    },
  },
});

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats with date range
        const statsResponse = await statisticService.getDashboardStats(startDate || undefined, endDate || undefined);
        if (statsResponse) {
          setDashboardStats(statsResponse);
        }

        // Fetch running campaigns
        const campaignsResponse = await campaignService.getCampaigns({ 
          page: 1, 
          size: 3, 
          status: 'running' 
        });
        if (campaignsResponse && campaignsResponse.items) {
          setCampaigns(campaignsResponse.items);
        } else if (Array.isArray(campaignsResponse)) {
          setCampaigns(campaignsResponse.slice(0, 3));
        }

        // Fetch featured campaigns using the featured API
        const featuredResponse = await campaignService.getFeaturedCampaigns({ 
          limit: 5, 
          status: 'running' 
        });
        if (Array.isArray(featuredResponse)) {
          setFeaturedCampaigns(featuredResponse.slice(0, 5));
        }

        // Fetch recent students
        const studentsResponse = await studentService.getStudents({ 
          page: 1, 
          size: 7, 
          sortBy: 'createdAt', 
          sortDirection: 'desc' 
        });
        if (studentsResponse && studentsResponse.items) {
          setRecentStudents(studentsResponse.items);
        } else if (Array.isArray(studentsResponse)) {
          setRecentStudents(studentsResponse.slice(0, 7));
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu dashboard");
        toast.error("Không thể tải dữ liệu dashboard", {
          duration: 3000,
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [startDate, endDate]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  };

  // Format number with thousand separator
  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu dashboard...</p>
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
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Get summary stats from API
  // Note: Revenue is calculated from converted students (students with sourceLeadId) 
  // who have enrolled in a course (courseId), using the course.price
  const summary = dashboardStats?.summary || {};
  const totalRevenue = summary.totalRevenue?.value || 0;
  const totalStudents = summary.registeredStudents?.value || 0;
  const activeStudents = summary.currentlyStudying?.value || 0;
  const completionRate = summary.completionRate?.value || 0;
  
  // Get changes (already calculated from API, compared to previous month)
  const revenueChange = summary.totalRevenue?.change || 0;
  const studentsChange = summary.registeredStudents?.change || 0;
  const activeChange = summary.currentlyStudying?.change || 0;
  const completionChange = summary.completionRate?.change || 0;
  
  // Get quick stats
  const quickStats = dashboardStats?.quickStats || {};
  const runningCampaigns = quickStats.runningCampaigns || 0;
  const totalSpent = quickStats.totalSpent || 0;
  const totalPotentialStudents = quickStats.totalPotentialStudents || 0;
  const totalRegisteredStudents = quickStats.totalRegisteredStudents || 0;
  
  // Get chart data
  const charts = dashboardStats?.charts || {};
  const newStudentsByCampaign = charts.newStudentsByCampaign || [];
  const newStudentsByMonth = charts.newStudentsByMonth || [];
  const roiByCampaign = charts.roiByCampaign || [];
  const channelStats = charts.channelStats || [];

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.container}>
        <div className={styles.content}>
        
        {/* Summary Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32}}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.9)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600}}>Tổng Doanh Thu Theo Tháng</div>
            <div style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>
              {summary.totalRevenue?.formatted || formatCurrency(totalRevenue)}
            </div>
            <div style={{fontSize: '0.8125rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500}}>
              <span>↗ {revenueChange > 0 ? '+' : ''}{revenueChange}%</span> 
              <span style={{color: 'rgba(255,255,255,0.7)'}}>so với tháng trước</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.9)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600}}>Học Viên Đăng Ký</div>
            <div style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>
              {summary.registeredStudents?.formatted || formatNumber(totalStudents)}
            </div>
            <div style={{fontSize: '0.8125rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500}}>
              <span>↗ {studentsChange > 0 ? '+' : ''}{studentsChange}%</span> 
              <span style={{color: 'rgba(255,255,255,0.7)'}}>so với tháng trước</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.9)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600}}>Học Viên Đang Học</div>
            <div style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>
              {summary.currentlyStudying?.formatted || formatNumber(activeStudents)}
            </div>
            <div style={{fontSize: '0.8125rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500}}>
              <span>↗ {activeChange > 0 ? '+' : ''}{activeChange}%</span> 
              <span style={{color: 'rgba(255,255,255,0.7)'}}>so với tháng trước</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{fontSize: '0.8125rem', color: 'rgba(255,255,255,0.9)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600}}>Tỷ Lệ Hoàn Thành</div>
            <div style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: 8, color: '#fff'}}>
              {summary.completionRate?.formatted || `${completionRate.toFixed(1)}%`}
            </div>
            <div style={{fontSize: '0.8125rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500}}>
              <span>↗ {completionChange > 0 ? '+' : ''}{completionChange}%</span> 
              <span style={{color: 'rgba(255,255,255,0.7)'}}>so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Section with Time Filter */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          border: '1px solid #4b5563',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: 32
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: '600', margin: 0, color: '#dee2e6'}}>📊 Thống kê nhanh</h2>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#313a46',
                  border: '1px solid #404954',
                  borderRadius: '6px',
                  color: '#dee2e6',
                  fontSize: '0.875rem'
                }}
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#313a46',
                  border: '1px solid #404954',
                  borderRadius: '6px',
                  color: '#dee2e6',
                  fontSize: '0.875rem'
                }}
                placeholder="Đến ngày"
              />
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
            <div style={{background: '#1f2a44', padding: '16px', borderRadius: '12px', border: '1px solid #2b3a5b'}}>
              <div style={{fontSize: '0.75rem', color: '#8391a2', marginBottom: 8, textTransform: 'uppercase'}}>Tổng CD đang chạy</div>
              <div style={{fontSize: '1.75rem', fontWeight: 700, color: '#fff'}}>{runningCampaigns}</div>
            </div>
            <div style={{background: '#1f2a44', padding: '16px', borderRadius: '12px', border: '1px solid #2b3a5b'}}>
              <div style={{fontSize: '0.75rem', color: '#8391a2', marginBottom: 8, textTransform: 'uppercase'}}>Chi phí đã chi</div>
              <div style={{fontSize: '1.75rem', fontWeight: 700, color: '#fff'}}>{formatCurrency(totalSpent)}</div>
            </div>
            <div style={{background: '#1f2a44', padding: '16px', borderRadius: '12px', border: '1px solid #2b3a5b'}}>
              <div style={{fontSize: '0.75rem', color: '#8391a2', marginBottom: 8, textTransform: 'uppercase'}}>Tổng HV tiềm năng</div>
              <div style={{fontSize: '1.75rem', fontWeight: 700, color: '#fff'}}>{formatNumber(totalPotentialStudents)}</div>
            </div>
            <div style={{background: '#1f2a44', padding: '16px', borderRadius: '12px', border: '1px solid #2b3a5b'}}>
              <div style={{fontSize: '0.75rem', color: '#8391a2', marginBottom: 8, textTransform: 'uppercase'}}>Tổng HV đã đăng ký</div>
              <div style={{fontSize: '1.75rem', fontWeight: 700, color: '#fff'}}>{formatNumber(totalRegisteredStudents)}</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: 32}}>
            {/* Chart 1: New Students by Campaign (Bar) */}
            {newStudentsByCampaign.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                border: '1px solid #4b5563',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: '#dee2e6'}}>
                  HV mới theo Chiến dịch
                </h3>
                <BarChart
                  width={500}
                  height={400}
                  series={[{
                    data: newStudentsByCampaign.map(c => c.newStudentsCount),
                    label: 'HV mới',
                    color: '#727cf5'
                  }]}
                  xAxis={[{
                    data: newStudentsByCampaign.map(c => c.name),
                    scaleType: 'band',
                  }]}
                />
              </div>
            )}

            {/* Chart 2: New Students by Month (Line) */}
            {newStudentsByMonth.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                border: '1px solid #4b5563',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: '#dee2e6'}}>
                  HV mới theo Tháng
                </h3>
                <LineChart
                  width={500}
                  height={400}
                  series={[{
                    data: newStudentsByMonth.map(m => m.count),
                    label: 'HV mới',
                    color: '#4ecdc4'
                  }]}
                  xAxis={[{
                    data: newStudentsByMonth.map(m => m.month),
                    scaleType: 'point',
                  }]}
                />
              </div>
            )}

            {/* Chart 3: ROI by Campaign */}
            {roiByCampaign.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                border: '1px solid #4b5563',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: '#dee2e6'}}>
                  ROI theo Chiến dịch
                </h3>
                <BarChart
                  width={500}
                  height={400}
                  series={[{
                    data: roiByCampaign.map(c => c.roi),
                    label: 'ROI (%)',
                    id: 'roi',
                    color: '#f9ca24'
                  }]}
                  xAxis={[{
                    data: roiByCampaign.map(c => c.name),
                    scaleType: 'band',
                  }]}
                />
              </div>
            )}

            {/* Chart 4: Stacked Bar - Leads and New Students by Channel */}
            {channelStats.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                border: '1px solid #4b5563',
                borderRadius: '16px',
                padding: '24px',
                gridColumn: '1 / -1'
              }}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: '#dee2e6'}}>
                  Số HVTN và số HVM theo Kênh truyền thông
                </h3>
                <BarChart
                  width={1000}
                  height={400}
                  series={[
                    {
                      data: channelStats.map(c => c.leads),
                      label: 'HVTN',
                      id: 'leads',
                      color: '#4ecdc4',
                      stack: 'total'
                    },
                    {
                      data: channelStats.map(c => c.students),
                      label: 'HVM',
                      id: 'students',
                      color: '#727cf5',
                      stack: 'total'
                    }
                  ]}
                  xAxis={[{
                    data: channelStats.map(c => c.channel),
                    scaleType: 'band',
                  }]}
                />
              </div>
            )}
          </div>

        {/* Campaigns section */}
        <div style={{marginBottom: 32}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 600, color: '#dee2e6', margin: 0}}>🚀 Chiến dịch đang chạy</h2>
            <Link href="/chiendich" style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              background: 'transparent',
              border: '1px solid #404954',
              color: '#aab8c5',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#727cf5';
              e.currentTarget.style.color = '#727cf5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#404954';
              e.currentTarget.style.color = '#aab8c5';
            }}
            >
              Xem tất cả →
            </Link>
          </div>
          <div className={styles.dashboard}>
          {campaigns.length > 0 ? campaigns.map((cmp) => {
            const revenue = Number(cmp.revenue) || 0;
            const cost = Number(cmp.cost) || 0;
            const roi = cmp.roi != null ? Number(cmp.roi) : (cost > 0 ? ((revenue - cost) / cost * 100) : 0);
            
            return (
              <div key={cmp.id} className={styles.card}>
                <div className={styles.cardIcon}>🚀</div>
                <div className={styles.cardContent}>
                  <h3 style={{color: '#dee2e6', marginBottom: 4}}>{cmp.name}</h3>
                  <p className={styles.cardSubtext} style={{color: '#8391a2', marginBottom: 8}}>
                    {cmp.status === 'running' ? 'Đang chạy' : cmp.status === 'paused' ? 'Tạm dừng' : 'Lên kế hoạch'} • {cmp.newStudentsCount || 0} học viên
                  </p>
                  <div style={{display: 'flex', gap: 12, marginTop: 8}}>
                    {roi != null && !isNaN(roi) && (
                      <div className={styles.cardSubtext} style={{color: '#4ecdc4'}}>
                        💰 ROI: {Number(roi).toFixed(1)}%
                      </div>
                    )}
                    {revenue > 0 && (
                      <div className={styles.cardSubtext} style={{color: '#f9ca24'}}>
                        💵 {formatCurrency(revenue)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <p style={{color: '#8391a2', gridColumn: '1 / -1', textAlign: 'center', padding: '20px'}}>Chưa có chiến dịch nào đang chạy</p>
          )}
          </div>
        </div>

      {/* Featured Campaigns & Live Sessions */}
      <div className={styles.chartsContainer} style={{marginTop: '48px', gap: '24px'}}>
        {/* Featured campaigns */}
        <div className={styles.chartCard} style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          border: '1px solid #4b5563',
          borderRadius: '16px'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: '600', margin: 0, color: '#dee2e6'}}>📈 Chiến dịch nổi bật</h2>
            <Link href="/chiendich" style={{
              fontSize: '0.875rem',
              color: '#727cf5',
              textDecoration: 'none',
              fontWeight: 500
            }}>Xem tất cả →</Link>
          </div>
          <div style={{display:'grid', gap:16}}>
            {featuredCampaigns.length > 0 ? featuredCampaigns.map(campaign => {
              const getStatusColor = (status) => {
                switch(status) {
                  case 'running': return '#4ecdc4';
                  case 'paused': return '#f9ca24';
                  case 'completed': return '#6c5ce7';
                  default: return '#8391a2';
                }
              };
              
              const getStatusText = (status) => {
                switch(status) {
                  case 'running': return 'Đang chạy';
                  case 'paused': return 'Tạm dừng';
                  case 'completed': return 'Hoàn thành';
                  default: return status || 'N/A';
                }
              };
              
              const revenueChange = campaign.changes?.revenue || 0;
              const newStudentsChange = campaign.changes?.newStudents || 0;
              
              return (
                <div 
                  key={campaign.id} 
                  style={{
                    display:'flex', 
                    alignItems:'center', 
                    gap:16,
                    padding: '16px',
                    background: '#1f2a44',
                    borderRadius: '12px',
                    border: '1px solid #2b3a5b',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.borderColor = '#4ecdc4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = '#2b3a5b';
                  }}
                >
                  <div style={{
                    fontSize: '2.5rem',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#26324a',
                    borderRadius: '12px'
                  }}>
                    📊
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px', color: '#dee2e6'}}>
                      {campaign.name || 'N/A'}
                    </div>
                    <div className={styles.cardSubtext} style={{fontSize: '0.95rem', marginBottom: '4px'}}>
                      Trạng thái: <span style={{color: getStatusColor(campaign.status)}}>{getStatusText(campaign.status)}</span>
                    </div>
                    <div style={{display: 'flex', gap: '16px', fontSize: '0.85rem', flexWrap: 'wrap'}}>
                      {campaign.roi !== null && campaign.roi !== undefined && (
                        <div className={styles.cardSubtext} style={{color: '#4ecdc4'}}>
                          💰 ROI: {Number(campaign.roi).toFixed(2)}%
                        </div>
                      )}
                      {campaign.revenue > 0 && (
                        <div className={styles.cardSubtext} style={{color: '#f9ca24'}}>
                          💵 {formatCurrency(campaign.revenue)}
                        </div>
                      )}
                      {revenueChange !== 0 && (
                        <div className={styles.cardSubtext} style={{color: revenueChange > 0 ? '#4ade80' : '#ef4444'}}>
                          {revenueChange > 0 ? '↗' : '↘'} {Math.abs(revenueChange)}% doanh thu
                        </div>
                      )}
                      {newStudentsChange !== 0 && (
                        <div className={styles.cardSubtext} style={{color: newStudentsChange > 0 ? '#4ade80' : '#ef4444'}}>
                          {newStudentsChange > 0 ? '↗' : '↘'} {Math.abs(newStudentsChange)}% học viên
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p style={{color: '#8391a2', textAlign: 'center', padding: '20px'}}>Chưa có chiến dịch nổi bật</p>
            )}
          </div>
        </div>

        {/* Upcoming live sessions */}
        <div className={styles.chartCard} style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          border: '1px solid #4b5563',
          borderRadius: '16px'
        }}>
          <h2 style={{marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600', margin: 0, color: '#dee2e6'}}>📅 Sự kiện sắp diễn ra</h2>
          <div style={{display:'grid', gap:12}}>
            {[
              { id: 'ls1', title: 'Speaking Club: Small Talk như người bản xứ', time: 'Tối Thứ 4 • 19:30', host: 'Ms. Linh' },
              { id: 'ls2', title: 'IELTS Writing Task 2: Idea → Outline → Essay', time: 'Chiều Thứ 7 • 15:00', host: 'Mr. David' },
              { id: 'ls3', title: 'Email công việc: Tone & Structure', time: 'Tối Thứ 5 • 20:00', host: 'Ms. Hạnh' }
            ].map(s => (
              <div 
                key={s.id} 
                style={{
                  display:'flex', 
                  flexDirection: 'column',
                  gap: 8,
                  border:'2px solid #2b3a5b', 
                  padding:'16px', 
                  borderRadius:'12px',
                  background: '#1f2a44',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f9ca24';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 202, 36, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2b3a5b';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{fontWeight: 700, fontSize: '1.05rem', color: '#f9ca24'}}>
                  {s.title}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8}}>
                  <div className={styles.cardSubtext} style={{fontSize: '0.9rem'}}>
                    👤 Host: <span style={{color: '#4ecdc4'}}>{s.host}</span>
                  </div>
                  <div className={styles.cardSubtext} style={{fontSize: '0.9rem', color: '#ff6b6b'}}>
                    ⏰ {s.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className={styles.detailsSection} style={{marginTop: 48}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#dee2e6'}}>📋 Học viên đăng ký gần đây</h2>
          <div style={{display: 'flex', gap: 10}}>
            <Link 
              href="/hocvien/add"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: 'transparent',
                border: '1px solid #404954',
                color: '#aab8c5',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#727cf5';
                e.currentTarget.style.color = '#727cf5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#404954';
                e.currentTarget.style.color = '#aab8c5';
              }}
            >
              <span>➕</span> Thêm Học Viên
            </Link>
            <Link 
              href="/hocvien"
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                background: '#727cf5',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#5b64d4'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#727cf5'}
            >
              <span>📊</span> Xem Tất Cả
            </Link>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#313a46',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #404954',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#3a4452', borderBottom: '1px solid #404954'}}>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Học Viên</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Email</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Số Điện Thoại</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Ngày Đăng Ký</th>
                <th style={{padding: '14px 16px', textAlign: 'left', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Trạng Thái</th>
                <th style={{padding: '14px 16px', textAlign: 'center', color: '#aab8c5', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.length > 0 ? recentStudents.map((student, index) => (
                <tr 
                  key={student.id}
                  style={{
                    borderBottom: index < recentStudents.length - 1 ? '1px solid #404954' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#3a4452'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{padding: '14px 16px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || student.name || 'User')}&background=727cf5&color=fff&size=40`}
                        alt={student.fullName || student.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{fontWeight: 600, fontSize: '0.875rem', color: '#dee2e6'}}>{student.fullName || student.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{padding: '14px 16px', fontSize: '0.875rem', color: '#aab8c5'}}>{student.email || 'N/A'}</td>
                  <td style={{padding: '14px 16px', fontSize: '0.875rem', color: '#aab8c5'}}>{student.phone || 'N/A'}</td>
                  <td style={{padding: '14px 16px', color: '#8391a2', fontSize: '0.875rem'}}>
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td style={{padding: '14px 16px'}}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: student.status === 'active' ? 'rgba(10, 207, 151, 0.18)' : 'rgba(250, 92, 124, 0.18)',
                      color: student.status === 'active' ? '#0acf97' : '#fa5c7c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: student.status === 'active' ? '#0acf97' : '#fa5c7c'
                      }}></span>
                      {student.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td style={{padding: '14px 16px', textAlign: 'center'}}>
                    <Link href={`/hocvien`} style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8391a2',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '4px 8px',
                      transition: 'color 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#727cf5'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#8391a2'}
                    >⋮</Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{padding: '20px', textAlign: 'center', color: '#8391a2'}}>
                    Chưa có học viên nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
