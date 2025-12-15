const { AppDataSource } = require('../db/data-source');

// Get revenue statistics
exports.getRevenue = async (req, res) => {
  try {
    const { startDate, endDate, period = 'day' } = req.query; // period: 'day', 'week', 'month'

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get repositories
    const studentRepo = AppDataSource.getRepository('Student');
    const staffRepo = AppDataSource.getRepository('Staff');
    const campaignRepo = AppDataSource.getRepository('Campaign');
    const leadRepo = AppDataSource.getRepository('Lead');
    const historyRepo = AppDataSource.getRepository('LeadCampaignHistory');

    // Get all students, staff, campaigns, leads, histories
    const [students, staff, campaigns, leads, histories] = await Promise.all([
      studentRepo.find(),
      staffRepo.find(),
      campaignRepo.find(),
      leadRepo.find(),
      historyRepo.find()
    ]);

    // Filter by date range if provided
    const filteredStudents = students.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end;
    });

    // Calculate statistics
    const totalStudents = students.length;
    const totalTeachers = staff.filter(s => s.role === 'teacher' || s.role === 'instructor').length;
    const totalCampaigns = campaigns.length;
    // Đếm HVTN từ số lượng lịch sử tham gia (một người tham gia nhiều chiến dịch = nhiều lần)
    const totalPotentialStudents = histories.length;

    // Calculate revenue data grouped by period (day/week/month)
    const revenueData = [];
    const courseRepo = AppDataSource.getRepository('Course');

    // Helper function to get period key based on period type
    const getPeriodKey = (date, periodType) => {
      const d = new Date(date);
      if (periodType === 'day') {
        return d.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (periodType === 'week') {
        // Get week number (ISO week)
        const year = d.getFullYear();
        const oneJan = new Date(year, 0, 1);
        const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
      } else if (periodType === 'month') {
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
      }
      return d.toISOString().split('T')[0];
    };

    // Helper to generate all keys between start/end for consistent chart data
    const generatePeriodKeys = (startDate, endDate, periodType) => {
      const keys = [];
      const current = new Date(startDate);
      const endCursor = new Date(endDate);

      current.setHours(0, 0, 0, 0);
      endCursor.setHours(0, 0, 0, 0);

      while (current <= endCursor) {
        keys.push(getPeriodKey(current, periodType));

        if (periodType === 'day') {
          current.setDate(current.getDate() + 1);
        } else if (periodType === 'week') {
          current.setDate(current.getDate() + 7);
        } else if (periodType === 'month') {
          current.setMonth(current.getMonth() + 1, 1);
        } else {
          current.setDate(current.getDate() + 1);
        }
      }

      return keys;
    };

    // Helper function to format period label
    const formatPeriodLabel = (periodKey, periodType) => {
      if (periodType === 'day') {
        const d = new Date(periodKey);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      } else if (periodType === 'week') {
        return periodKey.replace('W', ' Tuần ');
      } else if (periodType === 'month') {
        const [year, month] = periodKey.split('-');
        return `${month}/${year}`;
      }
      return periodKey;
    };

    // Group students by period
    const periodMap = new Map();

    for (const student of filteredStudents) {
      const studentDate = new Date(student.createdAt);
      const periodKey = getPeriodKey(studentDate, period);

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          enrollments: 0,
          revenue: 0,
          date: periodKey
        });
      }

      const periodData = periodMap.get(periodKey);
      periodData.enrollments += 1;

      // Chỉ tính revenue nếu student được convert từ Lead và Lead có lịch sử chiến dịch
      if (student.sourceLeadId && student.courseId) {
        // Tìm lịch sử chiến dịch của Lead nguồn
        const leadHistories = await historyRepo.find({
          where: { leadId: student.sourceLeadId },
          order: { createdAt: 'DESC' }
        });

        // Chỉ tính doanh thu nếu Lead có tham gia ít nhất 1 chiến dịch
        if (leadHistories.length > 0) {
          const course = await courseRepo.findOne({ where: { id: student.courseId } });
          if (course && course.price) {
            periodData.revenue += Number(course.price) || 0;
          }
        }
      }
    }

    // Ensure all periods exist between start/end for consistent daily chart
    const periodKeys = generatePeriodKeys(start, end, period);

    for (const periodKey of periodKeys) {
      const data = periodMap.get(periodKey) || { enrollments: 0, revenue: 0 };
      revenueData.push({
        date: formatPeriodLabel(periodKey, period),
        enrollments: data.enrollments,
        revenue: data.revenue
      });
    }

    // Calculate top campaigns by revenue
    // Doanh thu được tính dựa trên chiến dịch cuối cùng mà Lead tham gia
    const campaignRevenueMap = new Map();

    for (const campaign of campaigns) {
      let revenue = 0;

      // Lấy tất cả students được convert từ Lead trong khoảng thời gian
      const convertedStudents = filteredStudents.filter(s => s.sourceLeadId != null && s.courseId != null);

      for (const student of convertedStudents) {
        // Tìm lịch sử chiến dịch của Lead nguồn
        const leadHistories = await historyRepo.find({
          where: { leadId: student.sourceLeadId },
          order: { createdAt: 'DESC' }
        });

        // Lấy chiến dịch cuối cùng mà Lead tham gia
        const lastCampaignHistory = leadHistories.length > 0 ? leadHistories[0] : null;

        // Nếu chiến dịch cuối cùng trùng với campaign hiện tại, tính doanh thu
        if (lastCampaignHistory && lastCampaignHistory.campaignId === campaign.id) {
          const course = await courseRepo.findOne({ where: { id: student.courseId } });
          if (course && course.price) {
            revenue += Number(course.price) || 0;
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

    // Calculate total revenue and orders (theo bộ lọc thời gian)
    const totalRevenueFromCampaigns = Array.from(campaignRevenueMap.values())
      .reduce((sum, item) => sum + item.revenue, 0);

    const statisticTotal = {
      countOrder: filteredStudents.length,
      // Nếu vì lý do nào đó không tính được theo campaign thì fallback về cộng trực tiếp từ revenueData
      countRevenue: totalRevenueFromCampaigns > 0
        ? totalRevenueFromCampaigns
        : revenueData.reduce((sum, item) => sum + item.revenue, 0)
    };

    res.json({
      data: {
        totalStudents,
        totalTeachers,
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
    const historyRepo = AppDataSource.getRepository('LeadCampaignHistory');

    // Get all data
    const [allStudents, allCampaigns, allLeads, allHistories] = await Promise.all([
      studentRepo.find(),
      campaignRepo.find(),
      leadRepo.find(),
      historyRepo.find()
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

    // Calculate total revenue from converted students
    // Doanh thu được tính dựa trên chiến dịch cuối cùng mà Lead tham gia
    // Chỉ tính khi student được convert từ Lead và có courseId
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

    // Tính doanh thu dựa trên chiến dịch cuối cùng mà Lead tham gia
    for (const student of convertedStudents) {
      // Tìm lịch sử chiến dịch của Lead nguồn, sắp xếp theo thời gian mới nhất
      const leadHistories = await historyRepo.find({
        where: { leadId: student.sourceLeadId },
        order: { createdAt: 'DESC' }
      });

      // Lấy chiến dịch cuối cùng mà Lead tham gia
      const lastCampaignHistory = leadHistories.length > 0 ? leadHistories[0] : null;

      // Nếu Lead có tham gia ít nhất 1 chiến dịch, tính doanh thu từ khóa học
      if (lastCampaignHistory && student.courseId) {
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

    // Tính doanh thu tháng trước dựa trên chiến dịch cuối cùng mà Lead tham gia
    for (const student of prevConvertedStudents) {
      // Tìm lịch sử chiến dịch của Lead nguồn, sắp xếp theo thời gian mới nhất
      const leadHistories = await historyRepo.find({
        where: { leadId: student.sourceLeadId },
        order: { createdAt: 'DESC' }
      });

      // Lấy chiến dịch cuối cùng mà Lead tham gia
      const lastCampaignHistory = leadHistories.length > 0 ? leadHistories[0] : null;

      // Nếu Lead có tham gia ít nhất 1 chiến dịch, tính doanh thu từ khóa học
      if (lastCampaignHistory && student.courseId) {
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

    // Get running campaigns (filtered by date range)
    const runningCampaigns = allCampaigns.filter(c => {
      const createdAt = new Date(c.createdAt);
      return c.status === 'running' && createdAt >= start && createdAt <= end;
    });

    // Calculate total spent (from campaigns in date range)
    const totalSpent = allCampaigns
      .filter(c => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= start && createdAt <= end;
      })
      .reduce((sum, c) => sum + (Number(c.cost) || 0), 0);

    // Calculate total potential students (từ history thay vì leads để đếm đúng số lần tham gia)
    const totalPotentialStudents = allHistories.filter(h => {
      const createdAt = new Date(h.createdAt);
      return createdAt >= start && createdAt <= end;
    }).length;

    // Calculate total registered students (chỉ đếm students được chuyển đổi từ leads trong khoảng thời gian)
    const totalRegisteredStudents = allStudents.filter(s => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= start && createdAt <= end &&
        s.enrollmentStatus === 'enrolled' && s.sourceLeadId != null;
    }).length;

    // Calculate conversion rate (leads to enrollment)
    // Chỉ tính từ students được chuyển đổi từ leads trong khoảng thời gian
    const conversionRate = totalPotentialStudents > 0
      ? (totalRegisteredStudents / totalPotentialStudents * 100).toFixed(2)
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

    // Get new students by month - sử dụng khoảng thời gian từ tham số
    const newStudentsByMonth = [];
    const months = [];

    // Tính toán các tháng cần hiển thị dựa trên startDate và endDate
    const filterStart = new Date(start);
    const filterEnd = new Date(end);

    // Tính số tháng giữa start và end
    const startMonth = new Date(filterStart.getFullYear(), filterStart.getMonth(), 1);
    const endMonth = new Date(filterEnd.getFullYear(), filterEnd.getMonth(), 1);

    // Tạo danh sách các tháng trong khoảng
    let currentMonth = new Date(startMonth);
    while (currentMonth <= endMonth) {
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      months.push({
        month: currentMonth.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        start: new Date(currentMonth),
        end: monthEnd
      });
      // Chuyển sang tháng tiếp theo
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
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

    // Get new students by campaign & month (for stacked bar chart on dashboard)
    const newStudentsByCampaignMonth = [];
    for (const month of months) {
      // Chỉ tính học viên mới trong khoảng thời gian theo từng tháng và có campaignId
      const monthStudents = allStudents.filter(s => {
        const createdAt = new Date(s.createdAt);
        return (
          createdAt >= month.start &&
          createdAt <= month.end &&
          s.campaignId != null
        );
      });

      const countsByCampaignId = {};
      for (const student of monthStudents) {
        const key = String(student.campaignId);
        countsByCampaignId[key] = (countsByCampaignId[key] || 0) + 1;
      }

      const row = {
        month: month.month
      };

      Object.entries(countsByCampaignId).forEach(([campaignId, count]) => {
        const numericId = isNaN(Number(campaignId)) ? campaignId : Number(campaignId);
        const campaign = allCampaigns.find(c => c.id === numericId);
        const name = campaign ? campaign.name : 'Khác';
        row[name] = (row[name] || 0) + count;
      });

      newStudentsByCampaignMonth.push(row);
    }

    // Get ROI by campaign - chỉ lấy các chiến dịch trong khoảng thời gian lọc
    const filteredCampaigns = allCampaigns.filter(c => {
      const dateToUse = c.startDate ? new Date(c.startDate) : new Date(c.createdAt);
      return dateToUse >= start && dateToUse <= end;
    });

    const roiByCampaign = await Promise.all(
      filteredCampaigns.map(async (c) => {
        const enriched = await toEnrichedCampaign(c);
        // Lấy tháng từ startDate hoặc createdAt
        const dateToUse = c.startDate ? new Date(c.startDate) : new Date(c.createdAt);
        const monthKey = `${dateToUse.getFullYear()}-${String(dateToUse.getMonth() + 1).padStart(2, '0')}`;
        return {
          id: c.id,
          name: c.name,
          roi: enriched.roi || 0,
          month: monthKey,
          startDate: c.startDate,
          createdAt: c.createdAt
        };
      })
    );

    // Sắp xếp theo tháng
    roiByCampaign.sort((a, b) => {
      if (a.month < b.month) return -1;
      if (a.month > b.month) return 1;
      return 0;
    });

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

    const channelStats = Object.keys({ ...leadsByChannel, ...studentsByChannel }).map(channelName => ({
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
        newStudentsByCampaignMonth,
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
  const historyRepo = AppDataSource.getRepository('LeadCampaignHistory');
  const courseRepo = AppDataSource.getRepository('Course');

  // Đếm số HVTN từ bảng history (số lần tham gia chiến dịch này)
  const campaignHistories = await historyRepo.find({ where: { campaignId } });
  const potentialStudentsCount = campaignHistories.length;

  // Lấy tất cả students được convert từ Lead (có sourceLeadId)
  const allStudents = await studentRepo.find();
  const convertedStudents = allStudents.filter(s => s.sourceLeadId != null);

  // Đếm số HV mới: những student được convert và chiến dịch cuối cùng của Lead là chiến dịch này
  let newStudentsCount = 0;
  let revenue = 0;

  for (const student of convertedStudents) {
    // Tìm lịch sử chiến dịch của Lead nguồn, sắp xếp theo thời gian mới nhất
    const leadHistories = await historyRepo.find({
      where: { leadId: student.sourceLeadId },
      order: { createdAt: 'DESC' }
    });

    // Lấy chiến dịch cuối cùng mà Lead tham gia
    const lastCampaignHistory = leadHistories.length > 0 ? leadHistories[0] : null;

    // Nếu chiến dịch cuối cùng của Lead trùng với chiến dịch đang xem
    if (lastCampaignHistory && lastCampaignHistory.campaignId === campaignId) {
      // Đếm là học viên mới của chiến dịch này
      newStudentsCount++;

      // Tính doanh thu từ khóa học của student
      if (student.courseId) {
        const course = await courseRepo.findOne({ where: { id: student.courseId } });
        if (course && course.price) {
          revenue += Number(course.price);
        }
      }
    }
  }

  return {
    newStudentsCount,
    potentialStudentsCount,
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

