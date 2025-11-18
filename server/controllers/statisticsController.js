const { AppDataSource } = require('../db/data-source');

// Get revenue statistics
exports.getRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get repositories
    const studentRepo = AppDataSource.getRepository('Student');
    const staffRepo = AppDataSource.getRepository('Staff');
    const campaignRepo = AppDataSource.getRepository('Campaign');
    const leadRepo = AppDataSource.getRepository('Lead');
    
    // Get all students, staff, campaigns, leads
    const [students, staff, campaigns, leads] = await Promise.all([
      studentRepo.find(),
      staffRepo.find(),
      campaignRepo.find(),
      leadRepo.find()
    ]);
    
    // Filter by date range if provided
    const filteredStudents = students.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    // Calculate statistics
    const totalStudents = students.length;
    const totalTeachers = staff.filter(s => s.role === 'teacher' || s.role === 'instructor').length;
    const totalCourses = campaigns.length; // Assuming campaigns represent courses
    const totalCampaigns = campaigns.length;
    const totalPotentialStudents = leads.length;
    
    // Calculate revenue data (mock for now - you may need to add revenue field to students/campaigns)
    const revenueData = [];
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count enrollments for this date
      const enrollments = filteredStudents.filter(s => {
        const sDate = new Date(s.createdAt).toISOString().split('T')[0];
        return sDate === dateStr;
      }).length;
      
      // Mock revenue (you may need to add actual revenue calculation)
      const revenue = enrollments * 1000000; // 1M VND per enrollment
      
      revenueData.push({
        date: dateStr,
        enrollments,
        revenue
      });
    }
    
    // Calculate top campaigns by revenue
    const campaignRevenueMap = new Map();
    const courseRepo = AppDataSource.getRepository('Course');
    
    // Tính doanh thu cho mỗi campaign
    for (const campaign of campaigns) {
      let revenue = 0;
      
      // Ưu tiên dùng campaign.revenue nếu có
      if (campaign.revenue) {
        revenue = Number(campaign.revenue);
      } else {
        // Tính từ students trong campaign
        // Lấy tất cả students của campaign (không filter thời gian để có tổng doanh thu chính xác)
        const campaignStudents = students.filter(s => s.campaignId === campaign.id);
        
        for (const student of campaignStudents) {
          // Nếu student có courseId, lấy giá từ course
          if (student.courseId) {
            const course = await courseRepo.findOne({ where: { id: student.courseId } });
            if (course && course.price) {
              revenue += Number(course.price) || 0;
            }
          }
          // Hoặc dùng tuitionFee nếu có
          if (student.tuitionFee) {
            revenue += Number(student.tuitionFee) || 0;
          }
        }
      }
      
      if (revenue > 0) {
        campaignRevenueMap.set(campaign.id, {
          name: campaign.name,
          revenue: revenue
        });
      }
    }
    
    // Sắp xếp và lấy top campaigns
    const topCampaigns = Array.from(campaignRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Calculate total revenue and orders
    const totalRevenueFromCampaigns = Array.from(campaignRevenueMap.values())
      .reduce((sum, item) => sum + item.revenue, 0);
    
    const statisticTotal = {
      countOrder: filteredStudents.length,
      countRevenue: totalRevenueFromCampaigns || revenueData.reduce((sum, item) => sum + item.revenue, 0)
    };
    
    res.json({
      data: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalCampaigns,
        totalPotentialStudents,
        revenueData,
        topCampaigns: topCampaigns.length > 0 ? topCampaigns : campaigns.slice(0, 5).map(c => ({
          name: c.name,
          revenue: 0
        }))
      },
      statisticTotal
    });
  } catch (error) {
    console.error('Error getting revenue statistics:', error);
    res.status(500).json({ error: 'Failed to get revenue statistics', message: error.message });
  }
};

// Get general statistics
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get repositories
    const studentRepo = AppDataSource.getRepository('Student');
    const staffRepo = AppDataSource.getRepository('Staff');
    const campaignRepo = AppDataSource.getRepository('Campaign');
    const leadRepo = AppDataSource.getRepository('Lead');
    const channelRepo = AppDataSource.getRepository('Channel');
    
    // Get all data
    const [students, staff, campaigns, leads, channels] = await Promise.all([
      studentRepo.find(),
      staffRepo.find(),
      campaignRepo.find(),
      leadRepo.find(),
      channelRepo.find()
    ]);
    
    // Filter by date range if provided
    const filteredStudents = students.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    const filteredLeads = leads.filter(l => {
      const createdAt = new Date(l.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    // Calculate statistics
    const stats = {
      totalStudents: students.length,
      totalLeads: leads.length,
      totalCampaigns: campaigns.length,
      totalStaff: staff.length,
      totalChannels: channels.length,
      newStudents: filteredStudents.length,
      newLeads: filteredLeads.length,
      byStatus: {},
      byEnrollment: {},
      byCampaign: {}
    };
    
    // Group by status
    for (const s of students) {
      const status = s.status || 'active';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    }
    
    // Group by enrollment status
    for (const s of students) {
      const enrollment = s.enrollmentStatus || 'pending';
      stats.byEnrollment[enrollment] = (stats.byEnrollment[enrollment] || 0) + 1;
    }
    
    // Group by campaign
    for (const s of students) {
      if (s.campaignId) {
        const campaign = campaigns.find(c => c.id === s.campaignId);
        const campaignName = campaign ? campaign.name : 'Unknown';
        stats.byCampaign[campaignName] = (stats.byCampaign[campaignName] || 0) + 1;
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics', message: error.message });
  }
};

// Get dashboard statistics with month-over-month comparison
exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates - default to current month
    const now = new Date();
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate previous month for comparison
    const prevMonthEnd = new Date(start.getTime() - 1);
    const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
    
    // Get repositories
    const studentRepo = AppDataSource.getRepository('Student');
    const campaignRepo = AppDataSource.getRepository('Campaign');
    const leadRepo = AppDataSource.getRepository('Lead');
    const channelRepo = AppDataSource.getRepository('Channel');
    const courseRepo = AppDataSource.getRepository('Course');
    
    // Get all data
    const [allStudents, allCampaigns, allLeads] = await Promise.all([
      studentRepo.find(),
      campaignRepo.find(),
      leadRepo.find()
    ]);
    
    // Filter current period
    const currentStudents = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    const currentCampaigns = allCampaigns.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    const currentLeads = allLeads.filter(l => {
      const createdAt = new Date(l.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    // Filter previous period
    const prevStudents = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= prevMonthStart && createdAt <= prevMonthEnd;
    });
    
    const prevCampaigns = allCampaigns.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= prevMonthStart && createdAt <= prevMonthEnd;
    });
    
    const prevLeads = allLeads.filter(l => {
      const createdAt = new Date(l.createdAt);
      return createdAt >= prevMonthStart && createdAt <= prevMonthEnd;
    });
    
    // Calculate total revenue from converted students (students with sourceLeadId and courseId)
    // Chỉ tính doanh thu từ học viên được chuyển đổi từ leads và đã đăng ký khóa học
    // Doanh thu được tính theo giá khóa học mà học viên đã đăng ký (course.price)
    let currentRevenue = 0;
    const convertedStudents = currentStudents.filter(s => s.sourceLeadId != null && s.courseId != null);
    
    // Lấy tất cả courseIds cần thiết để query một lần (tối ưu performance)
    const courseIds = [...new Set(convertedStudents.map(s => s.courseId).filter(id => id != null))];
    let courses = [];
    if (courseIds.length > 0) {
      if (courseIds.length === 1) {
        courses = await courseRepo.find({ where: { id: courseIds[0] } });
      } else {
        const qb = courseRepo.createQueryBuilder('course');
        courses = await qb.where('course.id IN (:...ids)', { ids: courseIds }).getMany();
      }
    }
    const courseMap = new Map(courses.map(c => [c.id, c]));
    
    for (const student of convertedStudents) {
      if (student.courseId) {
        const course = courseMap.get(student.courseId);
        if (course && course.price != null) {
          currentRevenue += Number(course.price);
        }
      }
    }
    
    // For previous month, calculate revenue from converted students in previous month
    let prevRevenue = 0;
    const prevConvertedStudents = prevStudents.filter(s => s.sourceLeadId != null && s.courseId != null);
    
    // Lấy tất cả courseIds cần thiết cho previous month
    const prevCourseIds = [...new Set(prevConvertedStudents.map(s => s.courseId).filter(id => id != null))];
    let prevCourses = [];
    if (prevCourseIds.length > 0) {
      if (prevCourseIds.length === 1) {
        prevCourses = await courseRepo.find({ where: { id: prevCourseIds[0] } });
      } else {
        const qb = courseRepo.createQueryBuilder('course');
        prevCourses = await qb.where('course.id IN (:...ids)', { ids: prevCourseIds }).getMany();
      }
    }
    const prevCourseMap = new Map(prevCourses.map(c => [c.id, c]));
    
    for (const student of prevConvertedStudents) {
      if (student.courseId) {
        const course = prevCourseMap.get(student.courseId);
        if (course && course.price != null) {
          prevRevenue += Number(course.price);
        }
      }
    }
    
    const revenueChange = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? 100 : 0;
    
    // Calculate registered students (enrolled)
    const currentRegistered = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end && s.enrollmentStatus === 'enrolled';
    }).length;
    
    const prevRegistered = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= prevMonthStart && createdAt <= prevMonthEnd && s.enrollmentStatus === 'enrolled';
    }).length;
    
    const registeredChange = prevRegistered > 0
      ? ((currentRegistered - prevRegistered) / prevRegistered * 100).toFixed(1)
      : currentRegistered > 0 ? 100 : 0;
    
    // Calculate completion rate (students with status 'completed' or enrollmentStatus 'completed')
    const currentCompleted = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end && 
             (s.status === 'completed' || s.enrollmentStatus === 'completed');
    }).length;
    
    const currentTotal = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    }).length;
    
    const prevCompleted = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= prevMonthStart && createdAt <= prevMonthEnd && 
             (s.status === 'completed' || s.enrollmentStatus === 'completed');
    }).length;
    
    const prevTotal = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= prevMonthStart && createdAt <= prevMonthEnd;
    }).length;
    
    const currentCompletionRate = currentTotal > 0 ? (currentCompleted / currentTotal * 100) : 0;
    const prevCompletionRate = prevTotal > 0 ? (prevCompleted / prevTotal * 100) : 0;
    const completionChange = prevCompletionRate > 0
      ? (currentCompletionRate - prevCompletionRate).toFixed(1)
      : currentCompletionRate > 0 ? currentCompletionRate.toFixed(1) : 0;
    
    // Calculate currently studying students (active status)
    const currentStudying = allStudents.filter(s => s.status === 'active').length;
    const prevStudying = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt < prevMonthStart && s.status === 'active';
    }).length;
    
    const studyingChange = prevStudying > 0
      ? ((currentStudying - prevStudying) / prevStudying * 100).toFixed(1)
      : currentStudying > 0 ? 100 : 0;
    
    // Get running campaigns
    const runningCampaigns = allCampaigns.filter(c => c.status === 'running');
    
    // Calculate total spent (from campaigns)
    const totalSpent = allCampaigns.reduce((sum, c) => sum + (Number(c.cost) || 0), 0);
    
    // Calculate total potential students (leads)
    const totalPotentialStudents = allLeads.length;
    
    // Calculate total registered students
    const totalRegisteredStudents = allStudents.filter(s => s.enrollmentStatus === 'enrolled').length;
    
    // Calculate conversion rate (leads to enrollment)
    const conversionRate = allLeads.length > 0
      ? (totalRegisteredStudents / allLeads.length * 100).toFixed(2)
      : 0;
    
    // Get new students by campaign for chart
    const campaignsWithNewStudents = await Promise.all(
      allCampaigns.map(async (c) => {
        const metrics = await calculateCampaignMetrics(c.id);
        return {
          id: c.id,
          name: c.name,
          newStudentsCount: metrics.newStudentsCount || 0
        };
      })
    );
    
    // Get new students by month
    const newStudentsByMonth = [];
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      months.push({
        month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        start: date,
        end: monthEnd
      });
    }
    
    for (const month of months) {
      const count = allStudents.filter(s => {
        const createdAt = new Date(s.createdAt);
        return createdAt >= month.start && createdAt <= month.end;
      }).length;
      newStudentsByMonth.push({
        month: month.month,
        count
      });
    }
    
    // Get ROI by campaign
    const roiByCampaign = await Promise.all(
      allCampaigns.map(async (c) => {
        const enriched = await toEnrichedCampaign(c);
        return {
          id: c.id,
          name: c.name,
          roi: enriched.roi || 0
        };
      })
    );
    
    // Get leads and new students by channel
    const leadsByChannel = {};
    const studentsByChannel = {};
    
    for (const lead of allLeads) {
      if (lead.channelId) {
        const channel = await channelRepo.findOne({ where: { id: lead.channelId } });
        const channelName = channel ? channel.name : 'Unknown';
        leadsByChannel[channelName] = (leadsByChannel[channelName] || 0) + 1;
      }
    }
    
    for (const student of allStudents) {
      if (student.channelId) {
        const channel = await channelRepo.findOne({ where: { id: student.channelId } });
        const channelName = channel ? channel.name : 'Unknown';
        studentsByChannel[channelName] = (studentsByChannel[channelName] || 0) + 1;
      }
    }
    
    const channelStats = Object.keys({...leadsByChannel, ...studentsByChannel}).map(channelName => ({
      channel: channelName,
      leads: leadsByChannel[channelName] || 0,
      students: studentsByChannel[channelName] || 0
    }));
    
    res.json({
      summary: {
        totalRevenue: {
          value: currentRevenue,
          change: parseFloat(revenueChange),
          formatted: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(currentRevenue)
        },
        registeredStudents: {
          value: currentRegistered,
          change: parseFloat(registeredChange),
          formatted: currentRegistered.toString()
        },
        completionRate: {
          value: currentCompletionRate,
          change: parseFloat(completionChange),
          formatted: `${currentCompletionRate.toFixed(1)}%`
        },
        currentlyStudying: {
          value: currentStudying,
          change: parseFloat(studyingChange),
          formatted: currentStudying.toLocaleString('vi-VN')
        }
      },
      quickStats: {
        runningCampaigns: runningCampaigns.length,
        totalSpent,
        totalPotentialStudents,
        totalRegisteredStudents,
        conversionRate: parseFloat(conversionRate)
      },
      charts: {
        newStudentsByCampaign: campaignsWithNewStudents.filter(c => c.newStudentsCount > 0),
        newStudentsByMonth,
        roiByCampaign: roiByCampaign.filter(c => c.roi > 0),
        channelStats
      }
    });
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics', message: error.message });
  }
};

// Helper function to calculate campaign metrics
async function calculateCampaignMetrics(campaignId) {
  const studentRepo = AppDataSource.getRepository('Student');
  const leadRepo = AppDataSource.getRepository('Lead');
  const courseRepo = AppDataSource.getRepository('Course');
  
  const [students, leads] = await Promise.all([
    studentRepo.find({ where: { campaignId } }),
    leadRepo.find({ where: { campaignId } })
  ]);
  
  const newStudents = students.filter(s => s.newStudent === true);
  
  // Calculate revenue from course prices
  let revenue = 0;
  for (const student of students) {
    if (student.courseId) {
      const course = await courseRepo.findOne({ where: { id: student.courseId } });
      if (course && course.price) {
        revenue += Number(course.price);
      }
    }
  }
  
  return {
    newStudentsCount: newStudents.length,
    potentialStudentsCount: leads.length,
    revenue
  };
}

// Helper function to enrich campaign
async function toEnrichedCampaign(c) {
  const metrics = await calculateCampaignMetrics(c.id);
  const revenue = Number(c.revenue || metrics.revenue || 0);
  const cost = Number(c.cost || 0);
  const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  
  return {
    ...c,
    revenue,
    cost,
    roi,
    newStudentsCount: metrics.newStudentsCount || 0,
    potentialStudentsCount: metrics.potentialStudentsCount || 0
  };
}

// Download revenue export (CSV)
exports.downloadRevenueExport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Get revenue data (reuse logic from getRevenue)
    const studentRepo = AppDataSource.getRepository('Student');
    const students = await studentRepo.find();
    
    const filteredStudents = students.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    });
    
    // Generate CSV
    const csvRows = [];
    csvRows.push('Date,Enrollments,Revenue (VND)');
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const enrollments = filteredStudents.filter(s => {
        const sDate = new Date(s.createdAt).toISOString().split('T')[0];
        return sDate === dateStr;
      }).length;
      
      const revenue = enrollments * 1000000;
      csvRows.push(`${dateStr},${enrollments},${revenue}`);
    }
    
    const csv = csvRows.join('\n');
    const filename = `revenue_report_${startDate || 'all'}_${endDate || 'all'}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error downloading revenue export:', error);
    res.status(500).json({ error: 'Failed to download revenue export', message: error.message });
  }
};

