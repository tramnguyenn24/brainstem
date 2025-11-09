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
    
    // Calculate top courses by revenue (mock)
    const topCourses = campaigns.slice(0, 5).map(c => ({
      name: c.name,
      revenue: Math.floor(Math.random() * 50000000) + 10000000 // Mock revenue
    }));
    
    // Calculate total revenue and orders
    const statisticTotal = {
      countOrder: filteredStudents.length,
      countRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0)
    };
    
    res.json({
      data: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalCampaigns,
        totalPotentialStudents,
        revenueData,
        topCourses
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

