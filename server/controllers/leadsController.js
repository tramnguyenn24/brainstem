const { AppDataSource } = require('../db/data-source');

async function toEnrichedLead(lead) {
  const campaignRepo = AppDataSource.getRepository('Campaign');
  const channelRepo = AppDataSource.getRepository('Channel');
  const staffRepo = AppDataSource.getRepository('Staff');
  const campaign = lead.campaignId ? await campaignRepo.findOne({ where: { id: lead.campaignId } }) : null;
  const channel = lead.channelId ? await channelRepo.findOne({ where: { id: lead.channelId } }) : null;
  const staff = lead.assignedStaffId ? await staffRepo.findOne({ where: { id: lead.assignedStaffId } }) : null;
  return {
    ...lead,
    campaignName: campaign ? campaign.name : null,
    channelName: channel ? channel.name : null,
    assignedStaffName: staff ? staff.name : null
  };
}

function buildQueryBuilder(query) {
  const { search, status, interestLevel, campaignId, channelId, assignedStaffId, tags, campaignName } = query;
  const repo = AppDataSource.getRepository('Lead');
  const qb = repo.createQueryBuilder('lead');
  
  // Tìm kiếm theo tên chiến dịch
  if (campaignName) {
    qb.innerJoin('campaigns', 'camp', 'camp.id = lead.campaignId');
    const q = String(campaignName).toLowerCase();
    qb.andWhere('LOWER(camp.name) LIKE :campaignName', { campaignName: `%${q}%` });
  }
  
  if (status) {
    const values = String(status).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('lead.status = :status', { status: values[0] });
    } else {
      qb.andWhere('lead.status IN (:...status)', { status: values });
    }
  }
  
  if (interestLevel) {
    const values = String(interestLevel).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('lead.interestLevel = :interestLevel', { interestLevel: values[0] });
    } else {
      qb.andWhere('lead.interestLevel IN (:...interestLevel)', { interestLevel: values });
    }
  }
  
  if (campaignId) {
    const ids = String(campaignId).split(',').map(n => Number(n));
    if (ids.length === 1) {
      qb.andWhere('lead.campaignId = :campaignId', { campaignId: ids[0] });
    } else {
      qb.andWhere('lead.campaignId IN (:...campaignId)', { campaignId: ids });
    }
  }
  
  if (channelId) {
    const ids = String(channelId).split(',').map(n => Number(n));
    if (ids.length === 1) {
      qb.andWhere('lead.channelId = :channelId', { channelId: ids[0] });
    } else {
      qb.andWhere('lead.channelId IN (:...channelId)', { channelId: ids });
    }
  }
  
  if (assignedStaffId) {
    const ids = String(assignedStaffId).split(',').map(n => Number(n));
    if (ids.length === 1) {
      qb.andWhere('lead.assignedStaffId = :assignedStaffId', { assignedStaffId: ids[0] });
    } else {
      qb.andWhere('lead.assignedStaffId IN (:...assignedStaffId)', { assignedStaffId: ids });
    }
  }
  
  if (search) {
    const q = String(search).toLowerCase();
    qb.andWhere('(LOWER(lead.fullName) LIKE :q OR LOWER(lead.email) LIKE :q OR LOWER(lead.phone) LIKE :q)', { q: `%${q}%` });
  }
  
  if (tags) {
    const requiredTags = String(tags).split(',').map(t => t.trim().toLowerCase());
    for (const tag of requiredTags) {
      qb.andWhere(':tag = ANY(lead.tags)', { tag });
    }
  }
  
  return qb;
}

exports.getLeads = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));
  
  const qb = buildQueryBuilder(req.query);
  const totalItems = await qb.getCount();
  
  if (sortBy) {
    const order = (sortDirection || 'ASC').toUpperCase();
    qb.orderBy(`lead.${sortBy}`, order);
  }
  
  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const leads = await qb.getMany();
  const items = await Promise.all(leads.map(toEnrichedLead));
  
  res.json({
    page: pageNum,
    size: pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    items
  });
};

exports.getLeadSummary = async (req, res) => {
  const qb = buildQueryBuilder(req.query);
  
  // Apply time filter if provided
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    if (startDate) {
      qb.andWhere('lead.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      qb.andWhere('lead.createdAt <= :endDate', { endDate: new Date(endDate) });
    }
  }
  
  const leads = await qb.getMany();
  const total = leads.length;
  const byStatus = {};
  const byChannel = {};
  const byCampaign = {};
  let newLeadsCount = 0;
  
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    const ch = l.channelId ? await AppDataSource.getRepository('Channel').findOne({ where: { id: l.channelId } }) : null;
    const chName = ch ? ch.name : 'Unknown';
    byChannel[chName] = (byChannel[chName] || 0) + 1;
    const camp = l.campaignId ? await AppDataSource.getRepository('Campaign').findOne({ where: { id: l.campaignId } }) : null;
    const campName = camp ? camp.name : 'Unknown';
    byCampaign[campName] = (byCampaign[campName] || 0) + 1;
    
    // Đếm leads mới (status = 'new' hoặc 'INTERESTED')
    if (l.status === 'new' || l.status === 'INTERESTED' || !l.status) {
      newLeadsCount++;
    }
  }
  
  res.json({ total, newLeadsCount, byStatus, byChannel, byCampaign });
};

exports.getLeadById = async (req, res) => {
  const id = Number(req.params.id);
  const lead = await AppDataSource.getRepository('Lead').findOne({ where: { id } });
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(await toEnrichedLead(lead));
};

exports.createLead = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Lead');
  const newLead = {
    fullName: body.fullName || body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    status: body.status || 'new',
    interestLevel: body.interestLevel || 'medium',
    campaignId: Number(body.campaignId) || null,
    channelId: Number(body.channelId) || null,
    assignedStaffId: Number(body.assignedStaffId) || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await repo.save(newLead);
  res.status(201).json(await toEnrichedLead(saved));
};

exports.updateLead = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Lead');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Lead not found' });
  const body = req.body || {};
  const updated = {
    ...existing,
    ...body,
    fullName: body.fullName ?? body.name ?? existing.fullName,
    campaignId: body.campaignId != null ? Number(body.campaignId) : existing.campaignId,
    channelId: body.channelId != null ? Number(body.channelId) : existing.channelId,
    assignedStaffId: body.assignedStaffId != null ? Number(body.assignedStaffId) : existing.assignedStaffId,
    tags: Array.isArray(body.tags) ? body.tags : existing.tags,
    updatedAt: new Date()
  };
  const saved = await repo.save(updated);
  res.json(await toEnrichedLead(saved));
};

exports.deleteLead = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Lead');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Lead not found' });
  await repo.remove(existing);
  res.json(await toEnrichedLead(existing));
};

exports.convertLead = async (req, res) => {
  const id = Number(req.params.id);
  const { courseId } = req.body || {};
  
  const leadRepo = AppDataSource.getRepository('Lead');
  const studentRepo = AppDataSource.getRepository('Student');
  const existing = await leadRepo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Lead not found' });
  
  // Validate courseId if provided
  if (courseId) {
    const courseRepo = AppDataSource.getRepository('Course');
    const course = await courseRepo.findOne({ where: { id: Number(courseId) } });
    if (!course) {
      return res.status(400).json({ message: 'Khóa học không tồn tại' });
    }
  }
  
  await leadRepo.update(id, { status: 'converted', updatedAt: new Date() });
  
  const student = {
    fullName: existing.fullName,
    email: existing.email,
    phone: existing.phone,
    sourceLeadId: existing.id,
    campaignId: existing.campaignId,
    channelId: existing.channelId,
    assignedStaffId: existing.assignedStaffId,
    courseId: courseId ? Number(courseId) : null,
    enrollmentStatus: 'enrolled',
    status: 'active',
    newStudent: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await studentRepo.save(student);
  const updated = await leadRepo.findOne({ where: { id } });
  res.json({
    message: 'Lead converted to student',
    lead: await toEnrichedLead(updated),
    student: saved
  });
};
