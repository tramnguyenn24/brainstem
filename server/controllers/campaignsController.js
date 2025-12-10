const { AppDataSource } = require('../db/data-source');

// Tính ROI tự động: (revenue - cost)/cost * 100%
function calculateROI(revenue, cost) {
  if (!cost || cost === 0) return null;
  return ((revenue - cost) / cost) * 100;
}

// Tính toán metrics cho chiến dịch
async function calculateCampaignMetrics(campaignId) {
  const leadRepo = AppDataSource.getRepository('Lead');
  const studentRepo = AppDataSource.getRepository('Student');
  const courseRepo = AppDataSource.getRepository('Course');

  // Lấy tất cả leads của chiến dịch (HVTN)
  const leads = await leadRepo.find({ where: { campaignId } });
  const potentialStudentsCount = leads.length;

  // Lấy tất cả students của chiến dịch
  const students = await studentRepo.find({ where: { campaignId } });

  // Đếm số HV mới được chuyển đổi từ leads (new_student = true và có sourceLeadId)
  // Chỉ tính students được chuyển đổi từ leads để tỷ lệ chuyển đổi không vượt quá 100%
  const newStudents = students.filter(s => s.newStudent === true && s.sourceLeadId != null);
  const newStudentsCount = newStudents.length;

  // Tính doanh thu từ khóa học
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
    potentialStudentsCount,
    newStudentsCount,
    revenue
  };
}

// Lấy thông tin kênh truyền thông của chiến dịch
async function getCampaignChannels(campaignId) {
  const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');
  const channelRepo = AppDataSource.getRepository('Channel');
  const leadRepo = AppDataSource.getRepository('Lead');
  const studentRepo = AppDataSource.getRepository('Student');
  const courseRepo = AppDataSource.getRepository('Course');

  const campaignChannels = await campaignChannelRepo.find({
    where: { campaignId },
    order: { createdAt: 'ASC' }
  });

  const channelsData = await Promise.all(campaignChannels.map(async (cc) => {
    const channel = await channelRepo.findOne({ where: { id: cc.channelId } });

    // Đếm số HVTN từ kênh này (leads có campaignId và channelId)
    const leads = await leadRepo.find({
      where: { campaignId, channelId: cc.channelId }
    });
    const potentialStudentsCount = leads.length;

    // Đếm số HV mới từ kênh này
    const students = await studentRepo.find({
      where: { campaignId, channelId: cc.channelId, newStudent: true }
    });
    const newStudentsCount = students.length;

    // Tính doanh thu từ kênh này
    let revenue = 0;
    const allStudents = await studentRepo.find({
      where: { campaignId, channelId: cc.channelId }
    });
    for (const student of allStudents) {
      if (student.courseId) {
        const course = await courseRepo.findOne({ where: { id: student.courseId } });
        if (course && course.price) {
          revenue += Number(course.price);
        }
      }
    }

    return {
      id: cc.id,
      channelId: cc.channelId,
      channelName: channel ? channel.name : null,
      cost: cc.cost ? Number(cc.cost) : 0,
      potentialStudentsCount,
      newStudentsCount,
      revenue
    };
  }));

  return channelsData;
}

async function toEnrichedCampaign(c) {
  const channelRepo = AppDataSource.getRepository('Channel');
  const staffRepo = AppDataSource.getRepository('Staff');
  const channel = c.channelId ? await channelRepo.findOne({ where: { id: c.channelId } }) : null;
  const owner = c.ownerStaffId ? await staffRepo.findOne({ where: { id: c.ownerStaffId } }) : null;

  // Tính toán metrics
  const metrics = await calculateCampaignMetrics(c.id);

  // Tính tổng chi phí từ campaign_channels
  const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');
  const campaignChannels = await campaignChannelRepo.find({ where: { campaignId: c.id } });
  const totalCost = campaignChannels.reduce((sum, cc) => sum + (Number(cc.cost) || 0), 0);

  // Tính ROI tự động
  const revenue = c.revenue || metrics.revenue || 0;
  const cost = c.cost || totalCost || 0;
  const roi = calculateROI(revenue, cost);

  // Cập nhật campaign với metrics và ROI
  if (metrics.potentialStudentsCount !== c.potentialStudentsCount ||
    metrics.newStudentsCount !== c.newStudentsCount ||
    metrics.revenue !== c.revenue ||
    roi !== c.roi) {
    const repo = AppDataSource.getRepository('Campaign');
    await repo.update(c.id, {
      potentialStudentsCount: metrics.potentialStudentsCount,
      newStudentsCount: metrics.newStudentsCount,
      revenue: metrics.revenue,
      cost: cost,
      roi: roi,
      updatedAt: new Date()
    });
    // Reload để lấy giá trị mới
    const updated = await repo.findOne({ where: { id: c.id } });
    if (updated) {
      c = updated;
    }
  }
  // Get campaign channels details
  const channels = await getCampaignChannels(c.id);

  // Kiểm tra và tự động cập nhật trạng thái nếu chiến dịch hết hạn
  if (c.endDate && c.status === 'running') {
    const now = new Date();
    if (now > new Date(c.endDate)) {
      const repo = AppDataSource.getRepository('Campaign');
      await repo.update(c.id, { status: 'completed', updatedAt: new Date() });
      c.status = 'completed';
    }
  }

  return {
    ...c,
    channelName: channel ? channel.name : null,
    ownerStaffName: owner ? owner.name : null,
    revenue: Number(c.revenue || metrics.revenue || 0),
    cost: Number(c.cost || cost || 0),
    potentialStudentsCount: c.potentialStudentsCount || metrics.potentialStudentsCount || 0,
    newStudentsCount: c.newStudentsCount || metrics.newStudentsCount || 0,
    roi: c.roi || roi,
    // Mục tiêu chiến dịch
    targetLeads: c.targetLeads || 0,
    targetNewStudents: c.targetNewStudents || 0,
    targetRevenue: Number(c.targetRevenue) || 0,
    // Tính % hoàn thành mục tiêu
    leadsProgress: c.targetLeads > 0 
      ? Math.min(100, ((c.potentialStudentsCount || metrics.potentialStudentsCount || 0) / c.targetLeads) * 100).toFixed(1)
      : null,
    newStudentsProgress: c.targetNewStudents > 0 
      ? Math.min(100, ((c.newStudentsCount || metrics.newStudentsCount || 0) / c.targetNewStudents) * 100).toFixed(1)
      : null,
    revenueProgress: c.targetRevenue > 0 
      ? Math.min(100, (Number(c.revenue || metrics.revenue || 0) / Number(c.targetRevenue)) * 100).toFixed(1)
      : null,
    channels: channels // Include all campaign channels
  };
}

function buildQueryBuilder(query) {
  const { name, status, channel, channelId, search } = query;
  const repo = AppDataSource.getRepository('Campaign');
  const qb = repo.createQueryBuilder('campaign');

  if (search || name) {
    const q = String(search || name).toLowerCase();
    qb.andWhere('LOWER(campaign.name) LIKE :q', { q: `%${q}%` });
  }

  if (status) {
    const values = String(status).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('campaign.status = :status', { status: values[0] });
    } else {
      qb.andWhere('campaign.status IN (:...status)', { status: values });
    }
  }

  if (channelId) {
    const ids = String(channelId).split(',').map(n => Number(n));
    if (ids.length === 1) {
      qb.andWhere('campaign.channelId = :channelId', { channelId: ids[0] });
    } else {
      qb.andWhere('campaign.channelId IN (:...channelId)', { channelId: ids });
    }
  }

  if (channel) {
    const names = String(channel).split(',').map(s => s.trim().toLowerCase());
    const channelRepo = AppDataSource.getRepository('Channel');
    qb.innerJoin('channels', 'ch', 'ch.id = campaign.channelId');
    if (names.length === 1) {
      qb.andWhere('LOWER(ch.name) = :channelName', { channelName: names[0] });
    } else {
      qb.andWhere('LOWER(ch.name) IN (:...channelName)', { channelName: names });
    }
  }

  return qb;
}

exports.getCampaigns = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));

  const qb = buildQueryBuilder(req.query);

  // Áp dụng bộ lọc thời gian nếu có (đảm bảo danh sách chiến dịch khớp với card thống kê)
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    if (startDate) {
      qb.andWhere('campaign.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      qb.andWhere('campaign.createdAt <= :endDate', { endDate: new Date(endDate) });
    }
  }
  const totalItems = await qb.getCount();

  if (sortBy) {
    const order = (sortDirection || 'ASC').toUpperCase();
    qb.orderBy(`campaign.${sortBy}`, order);
  }

  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const campaigns = await qb.getMany();
  const items = await Promise.all(campaigns.map(toEnrichedCampaign));

  res.json({ page: pageNum, size: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize), items });
};

exports.getSummary = async (req, res) => {
  const qb = buildQueryBuilder(req.query);

  // Apply time filter if provided
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    if (startDate) {
      qb.andWhere('campaign.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      qb.andWhere('campaign.createdAt <= :endDate', { endDate: new Date(endDate) });
    }
  }

  const items = await qb.getMany();
  const total = items.length;
  const byStatus = {};
  const byChannel = {};
  let avgRoi = 0;
  let totalSpent = 0;
  let totalRevenue = 0;
  let totalNewStudents = 0;

  // Enrich all campaigns to get accurate metrics
  const enrichedItems = await Promise.all(items.map(toEnrichedCampaign));

  for (const c of enrichedItems) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    const ch = c.channelId ? await AppDataSource.getRepository('Channel').findOne({ where: { id: c.channelId } }) : null;
    const chName = ch ? ch.name : 'Unknown';
    byChannel[chName] = (byChannel[chName] || 0) + 1;
    if (typeof c.roi === 'number') avgRoi += c.roi;

    // Sum up totals
    totalSpent += Number(c.cost || 0);
    totalRevenue += Number(c.revenue || 0);
    totalNewStudents += Number(c.newStudentsCount || 0);
  }
  avgRoi = total ? avgRoi / total : 0;

  res.json({
    total,
    byStatus,
    byChannel,
    avgRoi,
    totalSpent,
    totalRevenue,
    totalNewStudents,
    running: byStatus.running || 0,
    completed: byStatus.completed || 0,
    paused: byStatus.paused || 0
  });
};

// Calculate metrics for a specific month
async function calculateMonthMetrics(campaignId, monthStart, monthEnd) {
  const studentRepo = AppDataSource.getRepository('Student');
  const leadRepo = AppDataSource.getRepository('Lead');
  const courseRepo = AppDataSource.getRepository('Course');

  // Get all students and leads for this campaign
  const allStudents = await studentRepo.find({ where: { campaignId } });
  const allLeads = await leadRepo.find({ where: { campaignId } });

  // Filter by month
  const monthStudents = allStudents.filter(s => {
    const createdAt = new Date(s.createdAt);
    return createdAt >= monthStart && createdAt <= monthEnd;
  });

  const monthLeads = allLeads.filter(l => {
    const createdAt = new Date(l.createdAt);
    return createdAt >= monthStart && createdAt <= monthEnd;
  });
  // Calculate revenue (chỉ tính học viên đã đăng ký khóa học)
  let revenue = 0;
  for (const student of monthStudents) {
    if (student.courseId) {
      const course = await courseRepo.findOne({ where: { id: student.courseId } });
      if (course && course.price) {
        revenue += Number(course.price);
      }
    }
  }

  // Count new students
  // Theo yêu cầu: "số học viên mới" của một tháng = số học viên đăng ký trong tháng đó,
  // không phụ thuộc vào trạng thái new_student.
  // Ở đây coi một học viên là "đã đăng ký" nếu đã tồn tại bản ghi student trong tháng.
  const newStudents = monthStudents.length;

  return {
    revenue,
    newStudentsCount: newStudents,
    potentialStudentsCount: monthLeads.length
  };
}

// Calculate previous month metrics for a campaign
async function calculatePreviousMonthMetrics(campaignId) {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthEnd = new Date(currentMonthStart.getTime() - 1);
  const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);

  return await calculateMonthMetrics(campaignId, prevMonthStart, prevMonthEnd);
}

// Calculate metrics for multiple previous months
async function calculateHistoricalMetrics(campaignId, monthsBack = 6) {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const historicalData = [];

  for (let i = 1; i <= monthsBack; i++) {
    const monthEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - i + 1, 0);
    const monthStart = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), 1);

    const metrics = await calculateMonthMetrics(campaignId, monthStart, monthEnd);

    historicalData.push({
      month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      monthIndex: i,
      ...metrics
    });
  }

  return historicalData.reverse(); // Oldest to newest
}

// Get featured campaigns (top campaigns by ROI)
exports.getFeaturedCampaigns = async (req, res) => {
  try {
    const { limit = 5, status } = req.query;
    const limitNum = Math.max(1, Math.min(Number(limit), 20)); // Max 20, min 1

    // Build query - get all campaigns first, then filter by status if provided
    const repo = AppDataSource.getRepository('Campaign');
    const qb = repo.createQueryBuilder('campaign');

    if (status) {
      qb.andWhere('campaign.status = :status', { status });
    }

    const campaigns = await qb.getMany();

    if (campaigns.length === 0) {
      return res.json([]);
    }

    // Enrich all campaigns to get ROI
    const enrichedCampaigns = await Promise.all(campaigns.map(toEnrichedCampaign));

    // Add previous month comparison data and historical data
    const campaignsWithComparison = await Promise.all(
      enrichedCampaigns.map(async (campaign) => {
        const prevMetrics = await calculatePreviousMonthMetrics(campaign.id);
        const historicalMetrics = await calculateHistoricalMetrics(campaign.id, 6); // Last 6 months

        // Calculate current month metrics
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const currentMetrics = await calculateMonthMetrics(campaign.id, currentMonthStart, currentMonthEnd);

        // Calculate percentage changes
        const revenueChange = prevMetrics.revenue > 0
          ? ((currentMetrics.revenue - prevMetrics.revenue) / prevMetrics.revenue * 100)
          : currentMetrics.revenue > 0 ? 100 : 0;

        const newStudentsChange = prevMetrics.newStudentsCount > 0
          ? ((currentMetrics.newStudentsCount - prevMetrics.newStudentsCount) / prevMetrics.newStudentsCount * 100)
          : currentMetrics.newStudentsCount > 0 ? 100 : 0;

        const prevROI = prevMetrics.revenue > 0 && campaign.cost > 0
          ? calculateROI(prevMetrics.revenue, campaign.cost)
          : null;
        const roiChange = campaign.roi && prevROI !== null
          ? campaign.roi - prevROI
          : null;

        return {
          ...campaign,
          previousMonth: {
            revenue: prevMetrics.revenue,
            newStudentsCount: prevMetrics.newStudentsCount,
            potentialStudentsCount: prevMetrics.potentialStudentsCount
          },
          currentMonth: {
            revenue: currentMetrics.revenue,
            newStudentsCount: currentMetrics.newStudentsCount,
            potentialStudentsCount: currentMetrics.potentialStudentsCount
          },
          changes: {
            revenue: parseFloat(revenueChange.toFixed(1)),
            newStudents: parseFloat(newStudentsChange.toFixed(1)),
            roi: roiChange ? parseFloat(roiChange.toFixed(2)) : null
          },
          historical: historicalMetrics // Last 6 months of data
        };
      })
    );

    // Sort by ROI (descending), fallback to revenue if ROI is null
    const sortedCampaigns = campaignsWithComparison
      .sort((a, b) => {
        const roiA = (a.roi !== null && a.roi !== undefined && !isNaN(Number(a.roi))) ? Number(a.roi) : -Infinity;
        const roiB = (b.roi !== null && b.roi !== undefined && !isNaN(Number(b.roi))) ? Number(b.roi) : -Infinity;

        // If both have ROI, sort by ROI
        if (roiA !== -Infinity && roiB !== -Infinity) {
          return roiB - roiA;
        }

        // If only one has ROI, prioritize it
        if (roiA !== -Infinity) return -1;
        if (roiB !== -Infinity) return 1;

        // If neither has ROI, sort by revenue
        const revenueA = Number(a.revenue) || 0;
        const revenueB = Number(b.revenue) || 0;
        return revenueB - revenueA;
      })
      .slice(0, limitNum);

    res.json(sortedCampaigns);
  } catch (error) {
    console.error('Error getting featured campaigns:', error);
    res.status(500).json({ error: 'Failed to get featured campaigns', message: error.message });
  }
};

exports.getById = async (req, res) => {
  const id = Number(req.params.id);
  const c = await AppDataSource.getRepository('Campaign').findOne({ where: { id } });
  if (!c) return res.status(404).json({ message: 'Campaign not found' });

  const enriched = await toEnrichedCampaign(c);
  const channels = await getCampaignChannels(id);

  res.json({
    ...enriched,
    channels: channels
  });
};

exports.getMetrics = async (req, res) => {
  const id = Number(req.params.id);
  const c = await AppDataSource.getRepository('Campaign').findOne({ where: { id } });
  if (!c) return res.status(404).json({ message: 'Campaign not found' });

  const metrics = await calculateCampaignMetrics(id);
  const campaignChannels = await getCampaignChannels(id);
  const totalCost = campaignChannels.reduce((sum, cc) => sum + (cc.cost || 0), 0);
  const roi = calculateROI(metrics.revenue, totalCost || c.cost || 0);

  // Tính tỉ lệ HV mới trên số người đăng ký chiến dịch
  const conversionRate = metrics.potentialStudentsCount > 0
    ? (metrics.newStudentsCount / metrics.potentialStudentsCount) * 100
    : 0;

  res.json({
    id,
    potentialStudentsCount: metrics.potentialStudentsCount,
    newStudentsCount: metrics.newStudentsCount,
    revenue: metrics.revenue,
    cost: totalCost || c.cost || 0,
    roi: roi,
    conversionRate: conversionRate,
    channels: campaignChannels
  });
};

// Lấy chi tiết chiến dịch với thông tin kênh truyền thông
exports.getCampaignDetails = async (req, res) => {
  const id = Number(req.params.id);
  const c = await AppDataSource.getRepository('Campaign').findOne({ where: { id } });
  if (!c) return res.status(404).json({ message: 'Campaign not found' });

  const enrichedCampaign = await toEnrichedCampaign(c);
  const channels = await getCampaignChannels(id);

  res.json({
    ...enrichedCampaign,
    channels: channels
  });
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Campaign');
  const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');

  // Tính tổng chi phí từ các kênh
  let totalCost = 0;
  if (body.channels && Array.isArray(body.channels)) {
    totalCost = body.channels.reduce((sum, ch) => sum + (Number(ch.cost) || 0), 0);
  } else if (body.cost) {
    totalCost = Number(body.cost);
  }

  // Xử lý ngày bắt đầu và kết thúc
  const startDate = body.startDate ? new Date(body.startDate) : null;
  const endDate = body.endDate ? new Date(body.endDate) : null;

  // Tự động xác định trạng thái dựa trên ngày
  let status = body.status || 'running';
  if (startDate && endDate) {
    const now = new Date();
    if (now < startDate) {
      status = 'paused'; // Chưa đến ngày bắt đầu
    } else if (now > endDate) {
      status = 'completed'; // Đã hết hạn
    }
  }

  const item = {
    name: body.name || '',
    status: status,
    channelId: Number(body.channelId) || null, // Giữ lại để backward compatibility
    ownerStaffId: Number(body.ownerStaffId) || null,
    budget: Number(body.budget) || null,
    spend: Number(body.spend) || null,
    cost: totalCost,
    revenue: Number(body.revenue) || null,
    potentialStudentsCount: Number(body.potentialStudentsCount) || 0,
    newStudentsCount: Number(body.newStudentsCount) || 0,
    startDate: startDate,
    endDate: endDate,
    // Mục tiêu chiến dịch
    targetLeads: Number(body.targetLeads) || 0,
    targetNewStudents: Number(body.targetNewStudents) || 0,
    targetRevenue: Number(body.targetRevenue) || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const saved = await repo.save(item);

  // Thêm các kênh truyền thông nếu có
  if (body.channels && Array.isArray(body.channels)) {
    for (const channelData of body.channels) {
      if (channelData.channelId) {
        await campaignChannelRepo.save({
          campaignId: saved.id,
          channelId: Number(channelData.channelId),
          cost: Number(channelData.cost) || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  // Tính ROI tự động
  const enriched = await toEnrichedCampaign(saved);
  res.status(201).json(enriched);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Campaign');
  const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Campaign not found' });

  const body = req.body || {};

  // Cập nhật các kênh truyền thông nếu có
  if (body.channels && Array.isArray(body.channels)) {
    // Xóa tất cả kênh cũ
    await campaignChannelRepo.delete({ campaignId: id });

    // Thêm lại các kênh mới
    for (const channelData of body.channels) {
      if (channelData.channelId) {
        await campaignChannelRepo.save({
          campaignId: id,
          channelId: Number(channelData.channelId),
          cost: Number(channelData.cost) || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Tính lại tổng chi phí
    const campaignChannels = await campaignChannelRepo.find({ where: { campaignId: id } });
    body.cost = campaignChannels.reduce((sum, cc) => sum + (Number(cc.cost) || 0), 0);
  }

  // Xử lý ngày bắt đầu và kết thúc
  const startDate = body.startDate !== undefined
    ? (body.startDate ? new Date(body.startDate) : null)
    : existing.startDate;
  const endDate = body.endDate !== undefined
    ? (body.endDate ? new Date(body.endDate) : null)
    : existing.endDate;

  // Tự động cập nhật trạng thái dựa trên ngày kết thúc
  let status = body.status != null ? body.status : existing.status;
  if (endDate) {
    const now = new Date();
    if (now > endDate && status === 'running') {
      status = 'completed'; // Tự động đóng chiến dịch khi hết hạn
    }
  }

  // Tính ROI tự động nếu có revenue và cost
  let roi = existing.roi;
  if (body.revenue != null || body.cost != null) {
    const revenue = body.revenue != null ? Number(body.revenue) : (existing.revenue || 0);
    const cost = body.cost != null ? Number(body.cost) : (existing.cost || 0);
    roi = calculateROI(revenue, cost);
  }

  const updated = {
    ...existing,
    name: body.name != null ? body.name : existing.name,
    status: status,
    channelId: body.channelId != null ? Number(body.channelId) : existing.channelId,
    ownerStaffId: body.ownerStaffId != null ? Number(body.ownerStaffId) : existing.ownerStaffId,
    budget: body.budget != null ? Number(body.budget) : existing.budget,
    spend: body.spend != null ? Number(body.spend) : existing.spend,
    cost: body.cost != null ? Number(body.cost) : existing.cost,
    revenue: body.revenue != null ? Number(body.revenue) : existing.revenue,
    potentialStudentsCount: body.potentialStudentsCount != null ? Number(body.potentialStudentsCount) : existing.potentialStudentsCount,
    newStudentsCount: body.newStudentsCount != null ? Number(body.newStudentsCount) : existing.newStudentsCount,
    startDate: startDate,
    endDate: endDate,
    // Mục tiêu chiến dịch
    targetLeads: body.targetLeads != null ? Number(body.targetLeads) : existing.targetLeads,
    targetNewStudents: body.targetNewStudents != null ? Number(body.targetNewStudents) : existing.targetNewStudents,
    targetRevenue: body.targetRevenue != null ? Number(body.targetRevenue) : existing.targetRevenue,
    roi: roi,
    updatedAt: new Date()
  };

  const saved = await repo.save(updated);
  res.json(await toEnrichedCampaign(saved));
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const repo = AppDataSource.getRepository('Campaign');
    const existing = await repo.findOne({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Campaign not found' });

    // Enrich campaign trước khi xóa để trả về thông tin đầy đủ
    const enriched = await toEnrichedCampaign(existing);

    // Xóa campaign (campaign_channels sẽ tự động xóa do CASCADE)
    await repo.remove(existing);

    // Trả về thông tin campaign đã xóa (không cần enrich lại vì đã enrich trước khi xóa)
    res.json(enriched);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error.message
    });
  }
};
