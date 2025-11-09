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
  
  // Đếm số HV mới (new_student = true)
  const newStudents = students.filter(s => s.newStudent === true);
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
  
  return {
    ...c,
    channelName: channel ? channel.name : null,
    ownerStaffName: owner ? owner.name : null,
    revenue: Number(c.revenue || metrics.revenue || 0),
    cost: Number(c.cost || cost || 0),
    potentialStudentsCount: c.potentialStudentsCount || metrics.potentialStudentsCount || 0,
    newStudentsCount: c.newStudentsCount || metrics.newStudentsCount || 0,
    roi: c.roi || roi
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
  const items = await qb.getMany();
  const total = items.length;
  const byStatus = {};
  const byChannel = {};
  let avgRoi = 0;
  
  for (const c of items) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    const ch = c.channelId ? await AppDataSource.getRepository('Channel').findOne({ where: { id: c.channelId } }) : null;
    const chName = ch ? ch.name : 'Unknown';
    byChannel[chName] = (byChannel[chName] || 0) + 1;
    if (typeof c.roi === 'number') avgRoi += c.roi;
  }
  avgRoi = total ? avgRoi / total : 0;
  res.json({ total, byStatus, byChannel, avgRoi });
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
  
  const item = {
    name: body.name || '',
    status: body.status || 'running',
    channelId: Number(body.channelId) || null, // Giữ lại để backward compatibility
    ownerStaffId: Number(body.ownerStaffId) || null,
    budget: Number(body.budget) || null,
    spend: Number(body.spend) || null,
    cost: totalCost,
    revenue: Number(body.revenue) || null,
    potentialStudentsCount: Number(body.potentialStudentsCount) || 0,
    newStudentsCount: Number(body.newStudentsCount) || 0,
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
    status: body.status != null ? body.status : existing.status,
    channelId: body.channelId != null ? Number(body.channelId) : existing.channelId,
    ownerStaffId: body.ownerStaffId != null ? Number(body.ownerStaffId) : existing.ownerStaffId,
    budget: body.budget != null ? Number(body.budget) : existing.budget,
    spend: body.spend != null ? Number(body.spend) : existing.spend,
    cost: body.cost != null ? Number(body.cost) : existing.cost,
    revenue: body.revenue != null ? Number(body.revenue) : existing.revenue,
    potentialStudentsCount: body.potentialStudentsCount != null ? Number(body.potentialStudentsCount) : existing.potentialStudentsCount,
    newStudentsCount: body.newStudentsCount != null ? Number(body.newStudentsCount) : existing.newStudentsCount,
    roi: roi,
    updatedAt: new Date()
  };
  
  const saved = await repo.save(updated);
  res.json(await toEnrichedCampaign(saved));
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Campaign');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Campaign not found' });
  await repo.remove(existing);
  res.json(await toEnrichedCampaign(existing));
};
