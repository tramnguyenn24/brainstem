const { AppDataSource } = require('../db/data-source');

async function computeWorkload(staffId) {
  const leadRepo = AppDataSource.getRepository('Lead');
  const campaignRepo = AppDataSource.getRepository('Campaign');
  const leads = await leadRepo.find({ where: { assignedStaffId: staffId } });
  const campaigns = await campaignRepo.find({ where: { ownerStaffId: staffId } });
  return { leadsCount: leads.length, campaignsOwned: campaigns.length };
}

function buildQueryBuilder(query) {
  const { search, role, status, department, campaignId } = query;
  const repo = AppDataSource.getRepository('Staff');
  const qb = repo.createQueryBuilder('staff');
  
  if (search) {
    const q = String(search).toLowerCase();
    qb.andWhere('(LOWER(staff.name) LIKE :q OR LOWER(staff.role) LIKE :q OR LOWER(staff.department) LIKE :q)', { q: `%${q}%` });
  }
  
  if (role) {
    const values = String(role).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('staff.role = :role', { role: values[0] });
    } else {
      qb.andWhere('staff.role IN (:...role)', { role: values });
    }
  }
  
  if (status) {
    const values = String(status).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('staff.status = :status', { status: values[0] });
    } else {
      qb.andWhere('staff.status IN (:...status)', { status: values });
    }
  }
  
  if (department) {
    const values = String(department).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('staff.department = :department', { department: values[0] });
    } else {
      qb.andWhere('staff.department IN (:...department)', { department: values });
    }
  }
  
  if (campaignId) {
    const ids = String(campaignId).split(',').map(n => Number(n));
    qb.innerJoin('campaigns', 'campaign', 'campaign.ownerStaffId = staff.id');
    if (ids.length === 1) {
      qb.andWhere('campaign.id = :campaignId', { campaignId: ids[0] });
    } else {
      qb.andWhere('campaign.id IN (:...campaignId)', { campaignId: ids });
    }
  }
  
  return qb;
}

exports.getStaff = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));
  
  const qb = buildQueryBuilder(req.query);
  const totalItems = await qb.getCount();
  
  if (sortBy) {
    const order = (sortDirection || 'ASC').toUpperCase();
    qb.orderBy(`staff.${sortBy}`, order);
  }
  
  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const staff = await qb.getMany();
  const items = await Promise.all(staff.map(async s => ({
    ...s,
    ...(await computeWorkload(s.id))
  })));
  
  res.json({ page: pageNum, size: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize), items });
};

exports.getSummary = async (req, res) => {
  const qb = buildQueryBuilder(req.query);
  const items = await qb.getMany();
  const total = items.length;
  const byRole = {};
  const byDepartment = {};
  let totalLeads = 0;
  let totalCampaignsOwned = 0;
  
  for (const s of items) {
    byRole[s.role] = (byRole[s.role] || 0) + 1;
    byDepartment[s.department] = (byDepartment[s.department] || 0) + 1;
    const w = await computeWorkload(s.id);
    totalLeads += w.leadsCount;
    totalCampaignsOwned += w.campaignsOwned;
  }
  res.json({ total, byRole, byDepartment, totalLeads, totalCampaignsOwned });
};

exports.getById = async (req, res) => {
  const id = Number(req.params.id);
  const s = await AppDataSource.getRepository('Staff').findOne({ where: { id } });
  if (!s) return res.status(404).json({ message: 'Staff not found' });
  res.json({ ...s, ...(await computeWorkload(id)) });
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Staff');
  const s = {
    name: body.name || '',
    role: body.role || 'sales',
    status: body.status || 'active',
    department: body.department || 'Sales'
  };
  const saved = await repo.save(s);
  res.status(201).json({ ...saved, ...(await computeWorkload(saved.id)) });
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Staff');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Staff not found' });
  const body = req.body || {};
  const updated = {
    ...existing,
    ...body
  };
  const saved = await repo.save(updated);
  res.json({ ...saved, ...(await computeWorkload(id)) });
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Staff');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Staff not found' });
  await repo.remove(existing);
  res.json(existing);
};

exports.assignCampaigns = async (req, res) => {
  const id = Number(req.params.id);
  const staffRepo = AppDataSource.getRepository('Staff');
  const campaignRepo = AppDataSource.getRepository('Campaign');
  const staff = await staffRepo.findOne({ where: { id } });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  const body = req.body || {};
  const campaignIds = Array.isArray(body.campaignIds) ? body.campaignIds.map(Number) : [];
  if (!campaignIds.length) return res.status(400).json({ message: 'campaignIds is required' });
  
  let updatedCount = 0;
  for (const cid of campaignIds) {
    const c = await campaignRepo.findOne({ where: { id: cid } });
    if (c) {
      await campaignRepo.update(cid, { ownerStaffId: id });
      updatedCount += 1;
    }
  }
  res.json({ message: 'Campaigns assigned', updatedCount });
};
