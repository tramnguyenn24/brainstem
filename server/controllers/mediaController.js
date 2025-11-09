const { AppDataSource } = require('../db/data-source');

function buildQueryBuilder(query) {
  const { search, type, status } = query;
  const repo = AppDataSource.getRepository('Media');
  const qb = repo.createQueryBuilder('media');
  
  if (search) {
    const q = String(search).toLowerCase();
    qb.andWhere('(LOWER(media.name) LIKE :q OR LOWER(media.description) LIKE :q)', { q: `%${q}%` });
  }
  
  if (type) {
    const types = String(type).split(',').map(s => s.trim());
    if (types.length === 1) {
      qb.andWhere('media.type = :type', { type: types[0] });
    } else {
      qb.andWhere('media.type IN (:...type)', { type: types });
    }
  }
  
  if (status) {
    const statuses = String(status).split(',').map(s => s.trim());
    if (statuses.length === 1) {
      qb.andWhere('media.status = :status', { status: statuses[0] });
    } else {
      qb.andWhere('media.status IN (:...status)', { status: statuses });
    }
  }
  
  return qb;
}

exports.getMedia = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));
  
  const qb = buildQueryBuilder(req.query);
  const totalItems = await qb.getCount();
  
  if (sortBy) {
    const order = (sortDirection || 'DESC').toUpperCase();
    qb.orderBy(`media.${sortBy}`, order);
  } else {
    qb.orderBy('media.createdAt', 'DESC');
  }
  
  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const items = await qb.getMany();
  
  res.json({ page: pageNum, size: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize), items });
};

exports.getSummary = async (req, res) => {
  const qb = buildQueryBuilder(req.query);
  const items = await qb.getMany();
  const total = items.length;
  const byType = {};
  const byStatus = {};
  
  for (const m of items) {
    byType[m.type || 'unknown'] = (byType[m.type || 'unknown'] || 0) + 1;
    byStatus[m.status || 'active'] = (byStatus[m.status || 'active'] || 0) + 1;
  }
  
  res.json({ total, byType, byStatus });
};

exports.getById = async (req, res) => {
  const id = Number(req.params.id);
  const m = await AppDataSource.getRepository('Media').findOne({ where: { id } });
  if (!m) return res.status(404).json({ message: 'Media not found' });
  res.json(m);
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Media');
  const item = {
    name: body.name || '',
    type: body.type || null,
    url: body.url || null,
    description: body.description || null,
    fileSize: body.fileSize ? Number(body.fileSize) : null,
    mimeType: body.mimeType || null,
    status: body.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await repo.save(item);
  res.status(201).json(saved);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Media');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Media not found' });
  const body = req.body || {};
  const updated = {
    ...existing,
    ...body,
    fileSize: body.fileSize != null ? Number(body.fileSize) : existing.fileSize,
    updatedAt: new Date()
  };
  const saved = await repo.save(updated);
  res.json(saved);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Media');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Media not found' });
  await repo.remove(existing);
  res.json(existing);
};

