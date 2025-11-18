const { AppDataSource } = require('../db/data-source');

function applyFilters(items, query) {
  const { type, status, month, startMonth, endMonth, search } = query;
  let result = items;

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(ch => String(ch.name || '').toLowerCase().includes(q));
  }

  if (type) {
    const set = new Set(String(type).split(',').map(s => s.trim().toLowerCase()));
    result = result.filter(ch => set.has(String(ch.type).toLowerCase()));
  }

  if (status) {
    const set = new Set(String(status).split(',').map(s => s.trim().toLowerCase()));
    result = result.filter(ch => set.has(String(ch.status).toLowerCase()));
  }

  // month filters are placeholders because channel items have no dates in mock store
  // If campaigns have dates, filtering by month can be applied via related campaigns
  // For now, accept params but do not filter further
  void month; void startMonth; void endMonth;

  return result;
}

function sortItems(items, sortBy, sortDirection) {
  if (!sortBy) return items;
  const dir = String(sortDirection || 'asc').toLowerCase() === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => {
    const va = a[sortBy];
    const vb = b[sortBy];
    if (va == null && vb == null) return 0;
    if (va == null) return -1 * dir;
    if (vb == null) return 1 * dir;
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });
}

exports.getChannels = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));

  const repo = AppDataSource.getRepository('Channel');
  let list = await repo.find();
  list = applyFilters(list, req.query);
  const totalItems = list.length;
  list = sortItems(list, sortBy, sortDirection);
  const start = (pageNum - 1) * pageSize;
  const items = list.slice(start, start + pageSize);
  res.json({ page: pageNum, size: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize), items });
};

exports.getSummary = async (req, res) => {
  const repo = AppDataSource.getRepository('Channel');
  const rows = await repo.find();
  const items = applyFilters(rows, req.query);
  const total = items.length;
  const byType = {};
  const byStatus = {};
  for (const ch of items) {
    byType[ch.type] = (byType[ch.type] || 0) + 1;
    byStatus[ch.status] = (byStatus[ch.status] || 0) + 1;
  }
  res.json({ total, byType, byStatus });
};

exports.getById = async (req, res) => {
  const id = Number(req.params.id);
  const ch = await AppDataSource.getRepository('Channel').findOne({ where: { id } });
  if (!ch) return res.status(404).json({ message: 'Channel not found' });
  res.json(ch);
};

exports.getCampaigns = async (req, res) => {
  const id = Number(req.params.id);
  const ch = await AppDataSource.getRepository('Channel').findOne({ where: { id } });
  if (!ch) return res.status(404).json({ message: 'Channel not found' });

  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));

  const campaignRepo = AppDataSource.getRepository('Campaign');
  const staffRepo = AppDataSource.getRepository('Staff');
  let list = await campaignRepo.find({ where: { channelId: id } });
  list = sortItems(list, sortBy, sortDirection);
  const totalItems = list.length;
  const start = (pageNum - 1) * pageSize;
  const items = await Promise.all(list.slice(start, start + pageSize).map(async c => {
    const owner = c.ownerStaffId ? await staffRepo.findOne({ where: { id: c.ownerStaffId } }) : null;
    return {
      ...c,
      ownerStaffName: owner ? owner.name : null
    };
  }));

  res.json({ page: pageNum, size: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize), items });
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Channel');
  
  if (!body.name || !body.name.trim()) {
    return res.status(400).json({ message: 'Tên kênh là bắt buộc' });
  }
  
  const item = {
    name: body.name.trim(),
    type: body.type || null,
    status: body.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  try {
    const saved = await repo.save(item);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ message: 'Không thể tạo kênh', error: error.message });
  }
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Channel');
  
  const channel = await repo.findOne({ where: { id } });
  if (!channel) {
    return res.status(404).json({ message: 'Channel not found' });
  }
  
  if (body.name !== undefined) {
    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ message: 'Tên kênh không được để trống' });
    }
    channel.name = body.name.trim();
  }
  
  if (body.type !== undefined) channel.type = body.type || null;
  if (body.status !== undefined) channel.status = body.status || 'active';
  channel.updatedAt = new Date();
  
  try {
    const updated = await repo.save(channel);
    res.json(updated);
  } catch (error) {
    console.error('Error updating channel:', error);
    res.status(500).json({ message: 'Không thể cập nhật kênh', error: error.message });
  }
};

exports.delete = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Channel');
  
  const channel = await repo.findOne({ where: { id } });
  if (!channel) {
    return res.status(404).json({ message: 'Channel not found' });
  }
  
  // Kiểm tra xem channel có đang được sử dụng trong campaigns không
  const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');
  const campaignChannels = await campaignChannelRepo.find({ where: { channelId: id } });
  
  if (campaignChannels.length > 0) {
    return res.status(400).json({ 
      message: `Không thể xóa kênh này vì đang được sử dụng trong ${campaignChannels.length} chiến dịch` 
    });
  }
  
  try {
    await repo.remove(channel);
    res.json({ message: 'Đã xóa kênh thành công' });
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ message: 'Không thể xóa kênh', error: error.message });
  }
};

// Get channel statistics (students, leads, revenue)
exports.getChannelStats = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository('Channel');
    const studentRepo = AppDataSource.getRepository('Student');
    const leadRepo = AppDataSource.getRepository('Lead');
    const courseRepo = AppDataSource.getRepository('Course');
    
    const channels = await repo.find();
    
    const stats = await Promise.all(channels.map(async (channel) => {
      // Đếm số học viên từ channel này
      const students = await studentRepo.find({ where: { channelId: channel.id } });
      const studentsCount = students.length;
      
      // Đếm số học viên mới
      const newStudents = students.filter(s => s.newStudent === true);
      const newStudentsCount = newStudents.length;
      
      // Đếm số leads từ channel này
      const leads = await leadRepo.find({ where: { channelId: channel.id } });
      const leadsCount = leads.length;
      
      // Tính doanh thu từ channel này
      let revenue = 0;
      for (const student of students) {
        if (student.courseId) {
          const course = await courseRepo.findOne({ where: { id: student.courseId } });
          if (course && course.price) {
            revenue += Number(course.price);
          }
        }
      }
      
      // Đếm số chiến dịch sử dụng channel này
      const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');
      const campaignChannels = await campaignChannelRepo.find({ where: { channelId: channel.id } });
      const campaignsCount = campaignChannels.length;
      
      return {
        channelId: channel.id,
        channelName: channel.name,
        studentsCount,
        newStudentsCount,
        leadsCount,
        revenue,
        campaignsCount,
        status: channel.status
      };
    }));
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting channel stats:', error);
    res.status(500).json({ message: 'Không thể lấy thống kê kênh', error: error.message });
  }
};

// Get enriched channels with statistics
exports.getChannelsWithStats = async (req, res) => {
  try {
    const { page = 1, size = 10, sortBy, sortDirection } = req.query;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(size));
    
    const repo = AppDataSource.getRepository('Channel');
    const studentRepo = AppDataSource.getRepository('Student');
    const leadRepo = AppDataSource.getRepository('Lead');
    const courseRepo = AppDataSource.getRepository('Course');
    const campaignChannelRepo = AppDataSource.getRepository('CampaignChannel');
    
    let list = await repo.find();
    list = applyFilters(list, req.query);
    const totalItems = list.length;
    list = sortItems(list, sortBy, sortDirection);
    
    // Enrich channels with statistics
    const campaignRepo = AppDataSource.getRepository('Campaign');
    const enrichedChannels = await Promise.all(list.map(async (channel) => {
      const students = await studentRepo.find({ where: { channelId: channel.id } });
      const studentsCount = students.length;
      const newStudentsCount = students.filter(s => s.newStudent === true).length;
      const leadsCount = (await leadRepo.find({ where: { channelId: channel.id } })).length;
      
      // Tính tỷ lệ chuyển đổi (leads → học viên)
      const conversionRate = leadsCount > 0 ? ((studentsCount / leadsCount) * 100).toFixed(2) : 0;
      
      let revenue = 0;
      for (const student of students) {
        if (student.courseId) {
          const course = await courseRepo.findOne({ where: { id: student.courseId } });
          if (course && course.price) {
            revenue += Number(course.price);
          }
        }
      }
      
      // Lấy campaigns đang chạy của channel
      // Tìm qua CampaignChannel (nhiều kênh cho 1 campaign)
      const campaignChannels = await campaignChannelRepo.find({ where: { channelId: channel.id } });
      const campaignIdsFromChannel = campaignChannels.map(cc => cc.campaignId);
      
      // Tìm campaigns có channelId trực tiếp (backward compatibility)
      const directCampaigns = await campaignRepo.find({ where: { channelId: channel.id, status: 'running' } });
      const directCampaignIds = directCampaigns.map(c => c.id);
      
      // Lấy campaigns từ CampaignChannel có status = 'running'
      const allCampaignIds = [...new Set([...campaignIdsFromChannel, ...directCampaignIds])];
      let runningCampaigns = [];
      if (allCampaignIds.length > 0) {
        const qb = campaignRepo.createQueryBuilder('campaign');
        qb.where('campaign.id IN (:...ids)', { ids: allCampaignIds });
        qb.andWhere('campaign.status = :status', { status: 'running' });
        runningCampaigns = await qb.getMany();
      }
      
      const runningCampaignsCount = runningCampaigns.length;
      const campaignsCount = (await campaignChannelRepo.find({ where: { channelId: channel.id } })).length;
      
      return {
        ...channel,
        studentsCount,
        newStudentsCount,
        leadsCount,
        revenue,
        campaignsCount,
        runningCampaigns: runningCampaigns.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status
        })),
        runningCampaignsCount,
        conversionRate: Number(conversionRate)
      };
    }));
    
    // Apply pagination
    const start = (pageNum - 1) * pageSize;
    const items = enrichedChannels.slice(start, start + pageSize);
    
    res.json({ 
      page: pageNum, 
      size: pageSize, 
      totalItems, 
      totalPages: Math.ceil(totalItems / pageSize), 
      items 
    });
  } catch (error) {
    console.error('Error getting channels with stats:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách kênh', error: error.message });
  }
};


