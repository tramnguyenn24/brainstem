const { AppDataSource } = require('../db/data-source');

function buildQueryBuilder(query) {
  const { name, status, search } = query;
  const repo = AppDataSource.getRepository('Course');
  const qb = repo.createQueryBuilder('course');
  
  if (search || name) {
    const q = String(search || name).toLowerCase();
    qb.andWhere('LOWER(course.name) LIKE :q', { q: `%${q}%` });
  }
  
  if (status) {
    const values = String(status).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('course.status = :status', { status: values[0] });
    } else {
      qb.andWhere('course.status IN (:...status)', { status: values });
    }
  }
  
  return qb;
}

exports.getCourses = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));
  
  const qb = buildQueryBuilder(req.query);
  const totalItems = await qb.getCount();
  
  if (sortBy) {
    const order = (sortDirection || 'ASC').toUpperCase();
    qb.orderBy(`course.${sortBy}`, order);
  } else {
    qb.orderBy('course.createdAt', 'DESC');
  }
  
  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const courses = await qb.getMany();
  
  res.json({ 
    page: pageNum, 
    size: pageSize, 
    totalItems, 
    totalPages: Math.ceil(totalItems / pageSize), 
    items: courses 
  });
};

exports.getById = async (req, res) => {
  const id = Number(req.params.id);
  const course = await AppDataSource.getRepository('Course').findOne({ where: { id } });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Course');
  const item = {
    name: body.name || '',
    description: body.description || null,
    price: body.price ? Number(body.price) : null,
    status: body.status || 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await repo.save(item);
  res.status(201).json(saved);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Course');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Course not found' });
  
  const body = req.body || {};
  const updated = {
    ...existing,
    name: body.name != null ? body.name : existing.name,
    description: body.description != null ? body.description : existing.description,
    price: body.price != null ? Number(body.price) : existing.price,
    status: body.status != null ? body.status : existing.status,
    updatedAt: new Date()
  };
  
  const saved = await repo.save(updated);
  res.json(saved);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Course');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Course not found' });
  await repo.remove(existing);
  res.json(existing);
};

