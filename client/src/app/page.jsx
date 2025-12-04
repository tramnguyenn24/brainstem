"use client";

import React, { useState, useEffect } from 'react';
import { statisticService } from './api/statistic/statisticService';
import { campaignService } from './api/campaign/campaignService';
import { studentService } from './api/student/studentService';
import styles from './dashboard.module.css';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BarChartCard, LineChartCard, StackedBarChartCard } from './components/charts';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]); // Chiến dịch được chọn trong chart

  // Bộ lọc phía client (chỉ lọc trên dữ liệu đã fetch sẵn)
  const [campaignSearch, setCampaignSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('');

  // Fetch all dashboard data
  useEffect(() => {
    // Chỉ chạy API khi:
    // - Cả startDate & endDate đều trống (load mặc định), hoặc
    // - Cả hai đều được chọn & hợp lệ

    // Trường hợp chỉ chọn 1 trong 2 ngày => không gọi API
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return;
    }

    // Nếu cả hai đều được chọn thì validate
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError("Ngày không hợp lệ");
        toast.error("Ngày không hợp lệ. Vui lòng chọn lại!", {
          duration: 3000,
          position: "top-center"
        });
        return;
      }

      if (start > end) {
        setError("Khoảng thời gian không hợp lệ");
        toast.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!", {
          duration: 3000,
          position: "top-center"
        });
        return;
      } else if (error === "Khoảng thời gian không hợp lệ" || error === "Ngày không hợp lệ") {
        // Xóa lỗi cũ nếu user đã sửa lại khoảng thời gian hợp lệ
        setError(null);
      }
    }

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
  const newStudentsByCampaignMonth = charts.newStudentsByCampaignMonth || [];
  const roiByCampaign = charts.roiByCampaign || [];
  const channelStats = charts.channelStats || [];
  
  // Lấy danh sách tất cả campaign names từ newStudentsByCampaignMonth để tạo dynamic bars
  const campaignNames = new Set();
  newStudentsByCampaignMonth.forEach(monthData => {
    Object.keys(monthData).forEach(key => {
      if (key !== 'month') {
        campaignNames.add(key);
      }
    });
  });
  const campaignNamesArray = Array.from(campaignNames);
  
  // Tạo màu sắc cho các campaign (sử dụng palette)
  const campaignColors = [
    '#727cf5', '#4ecdc4', '#f9ca24', '#f5576c', '#667eea', 
    '#764ba2', '#fa709a', '#fee140', '#4facfe', '#00f2fe'
  ];
  
  // Tạo bars config cho StackedBarChartCard (tất cả campaigns)
  const allCampaignBars = campaignNamesArray.map((campaignName, index) => ({
    dataKey: campaignName,
    name: campaignName,
    color: campaignColors[index % campaignColors.length],
    stackId: 'total'
  }));

  // Handler khi click vào legend - chỉ hiển thị campaign được click
  const handleLegendClick = (e) => {
    const campaignName = e.dataKey;
    if (!campaignName) return;
    
    // Nếu đã chọn campaign này, bỏ chọn (hiển thị tất cả)
    if (selectedCampaigns.length === 1 && selectedCampaigns[0] === campaignName) {
      setSelectedCampaigns([]);
    } else {
      // Chỉ hiển thị campaign được click
      setSelectedCampaigns([campaignName]);
    }
  };

  // Nếu có selectedCampaigns, chỉ hiển thị các campaign được chọn
  const filteredCampaignNames = selectedCampaigns.length > 0 
    ? selectedCampaigns
    : campaignNamesArray;
  
  const campaignBars = filteredCampaignNames.map((campaignName) => {
    const originalIndex = campaignNamesArray.indexOf(campaignName);
    return {
      dataKey: campaignName,
      name: campaignName,
      color: campaignColors[originalIndex % campaignColors.length],
      stackId: 'total'
    };
  });

  // Áp dụng bộ lọc phía client (không dùng hook để tránh cảnh báo Hooks)
  const filteredCampaigns = (() => {
    if (!campaignSearch) return campaigns;
    const q = campaignSearch.toLowerCase();
    return campaigns.filter((cmp) => (cmp.name || '').toLowerCase().includes(q));
  })();

  const filteredRecentStudents = (() => {
    let result = recentStudents;

    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      result = result.filter((s) => {
        const fullName = (s.fullName || s.name || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        const phone = (s.phone || '').toLowerCase();
        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      });
    }

    if (studentStatusFilter) {
      result = result.filter((s) => (s.status || '').toLowerCase() === studentStatusFilter);
    }

    return result;
  })();

  return (
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
                max={endDate || undefined}
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
                min={startDate || undefined}
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
            {/* Chart 1: New Students by Campaign & Month (Stacked Bar) */}
            {newStudentsByCampaignMonth.length > 0 && campaignBars.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                border: '1px solid #4b5563',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    margin: 0,
                    color: '#dee2e6'
                  }}>
                    HV mới theo Chiến dịch và Tháng
                  </h3>
                  {selectedCampaigns.length > 0 && (
                    <button
                      onClick={() => setSelectedCampaigns([])}
                      style={{
                        padding: '6px 12px',
                        background: '#727cf5',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#5b64d4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#727cf5'}
                    >
                      Hiển thị tất cả
                    </button>
                  )}
                </div>
                <StackedBarChartCard
                  data={newStudentsByCampaignMonth.map(monthData => {
                    const dataPoint = { name: monthData.month };
                    // Thêm tất cả campaigns vào data (để legend hoạt động đúng)
                    campaignNamesArray.forEach(campaignName => {
                      dataPoint[campaignName] = monthData[campaignName] || 0;
                    });
                    return dataPoint;
                  })}
                  dataKey="name"
                  bars={allCampaignBars} // Luôn truyền tất cả bars để legend hiển thị đầy đủ
                  xAxisLabel="Tháng"
                  yAxisLabel="Số lượng"
                  height={400}
                  colors={{ primary: '#727cf5' }}
                  onLegendClick={handleLegendClick}
                  selectedCampaigns={selectedCampaigns}
                />
              </div>
            )}

            {/* Chart 2: New Students by Month (Line) */}
            {newStudentsByMonth.length > 0 && (
              <LineChartCard
                title="HV mới theo Tháng"
                data={newStudentsByMonth.map(m => ({
                  name: m.month,
                  'HV mới': m.count
                }))}
                dataKey="name"
                lines={[{
                  dataKey: 'HV mới',
                  name: 'HV mới',
                    color: '#4ecdc4'
                  }]}
                xAxisLabel="Tháng"
                yAxisLabel="Số lượng"
                height={400}
                colors={{ primary: '#4ecdc4' }}
                />
            )}

            {/* Chart 3: ROI by Campaign */}
            {roiByCampaign.length > 0 && (
              <BarChartCard
                title="ROI theo Chiến dịch"
                data={roiByCampaign.map(c => ({
                  name: c.name,
                  'ROI (%)': c.roi
                }))}
                dataKey="name"
                bars={[{
                  dataKey: 'ROI (%)',
                  name: 'ROI (%)',
                    color: '#f9ca24'
                  }]}
                xAxisLabel="Chiến dịch"
                yAxisLabel="ROI (%)"
                height={400}
                colors={{ primary: '#f9ca24' }}
                hideXAxisLabels={true}
                yAxisFormatter={undefined}
                tooltipFormatter={undefined}
                />
            )}

            {/* Chart 4: Stacked Bar - Leads and New Students by Channel */}
            {channelStats.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <StackedBarChartCard
                  title="Số HVTN và số HVM theo Kênh truyền thông"
                  data={channelStats.map(c => ({
                    name: c.channel,
                    'HVTN': c.leads,
                    'HVM': c.students
                  }))}
                  dataKey="name"
                  bars={[
                    {
                      dataKey: 'HVTN',
                      name: 'HVTN',
                      color: '#4ecdc4',
                      stackId: 'total'
                    },
                    {
                      dataKey: 'HVM',
                      name: 'HVM',
                      color: '#727cf5',
                      stackId: 'total'
                    }
                  ]}
                  xAxisLabel="Kênh truyền thông"
                  yAxisLabel="Số lượng"
                  height={400}
                  colors={{ primary: '#4ecdc4', secondary: '#727cf5' }}
                />
              </div>
            )}
          </div>

        {/* Campaigns section */}
        <div style={{marginBottom: 32}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 600, color: '#dee2e6', margin: 0}}>🚀 Chiến dịch đang chạy</h2>
            <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
              <input
                type="text"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder="Lọc theo tên chiến dịch..."
                style={{
                  padding: '8px 12px',
                  background: '#313a46',
                  border: '1px solid #404954',
                  borderRadius: '6px',
                  color: '#dee2e6',
                  fontSize: '0.875rem',
                  minWidth: '220px'
                }}
              />
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
          </div>
          <div className={styles.dashboard}>
          {filteredCampaigns.length > 0 ? filteredCampaigns.map((cmp) => {
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
      {/* Recent Students */}
      <div className={styles.detailsSection} style={{marginTop: 48}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#dee2e6'}}>📋 Học viên đăng ký gần đây</h2>
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: 8}}>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Tìm theo tên, email, SĐT..."
                style={{
                  padding: '8px 12px',
                  background: '#313a46',
                  border: '1px solid #404954',
                  borderRadius: '6px',
                  color: '#dee2e6',
                  fontSize: '0.875rem',
                  minWidth: '220px'
                }}
              />
              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#313a46',
                  border: '1px solid #404954',
                  borderRadius: '6px',
                  color: '#dee2e6',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
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
              {filteredRecentStudents.length > 0 ? filteredRecentStudents.map((student, index) => (
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
  );
};

export default Dashboard;
