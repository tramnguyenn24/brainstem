const { AppDataSource } = require('../db/data-source');

async function toEnrichedStudent(s) {
  const campaignRepo = AppDataSource.getRepository('Campaign');
  const channelRepo = AppDataSource.getRepository('Channel');
  const staffRepo = AppDataSource.getRepository('Staff');
  const courseRepo = AppDataSource.getRepository('Course');
  
  const campaign = s.campaignId ? await campaignRepo.findOne({ where: { id: s.campaignId } }) : null;
  const channel = s.channelId ? await channelRepo.findOne({ where: { id: s.channelId } }) : null;
  const staff = s.assignedStaffId ? await staffRepo.findOne({ where: { id: s.assignedStaffId } }) : null;
  const course = s.courseId ? await courseRepo.findOne({ where: { id: s.courseId } }) : null;
  
  return {
    ...s,
    campaignName: campaign ? campaign.name : null,
    channelName: channel ? channel.name : null,
    assignedStaffName: staff ? staff.name : null,
    courseName: course ? course.name : null,
    tuitionFee: course ? Number(course.price) : null,
    enrollmentDate: s.createdAt // Use createdAt as enrollment date
  };
}

function buildQueryBuilder(query) {
  const { search, status, enrollmentStatus, campaignId, channelId, assignedStaffId, newStudent, campaignName } = query;
  const repo = AppDataSource.getRepository('Student');
  const qb = repo.createQueryBuilder('student');
  
  if (search) {
    const q = String(search).toLowerCase();
    qb.andWhere('(LOWER(student.fullName) LIKE :q OR LOWER(student.email) LIKE :q OR LOWER(student.phone) LIKE :q)', { q: `%${q}%` });
  }
  
  // Tìm kiếm theo tên chiến dịch
  if (campaignName) {
    // Dùng innerJoin để chỉ lấy students có campaign và tên campaign khớp
    // TypeORM sẽ tự động map property name sang column name
    qb.innerJoin('campaigns', 'camp', 'camp.id = student.campaignId');
    const q = String(campaignName).toLowerCase();
    qb.andWhere('LOWER(camp.name) LIKE :campaignName', { campaignName: `%${q}%` });
  }
  
  if (status) {
    const values = String(status).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('student.status = :status', { status: values[0] });
    } else {
      qb.andWhere('student.status IN (:...status)', { status: values });
    }
  }
  
  if (enrollmentStatus) {
    const values = String(enrollmentStatus).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('student.enrollmentStatus = :enrollmentStatus', { enrollmentStatus: values[0] });
    } else {
      qb.andWhere('student.enrollmentStatus IN (:...enrollmentStatus)', { enrollmentStatus: values });
    }
  }
  
  if (campaignId) {
    const ids = String(campaignId).split(',').map(Number);
    if (ids.length === 1) {
      qb.andWhere('student.campaignId = :campaignId', { campaignId: ids[0] });
    } else {
      qb.andWhere('student.campaignId IN (:...campaignId)', { campaignId: ids });
    }
  }
  
  if (channelId) {
    const ids = String(channelId).split(',').map(Number);
    if (ids.length === 1) {
      qb.andWhere('student.channelId = :channelId', { channelId: ids[0] });
    } else {
      qb.andWhere('student.channelId IN (:...channelId)', { channelId: ids });
    }
  }
  
  if (assignedStaffId) {
    const ids = String(assignedStaffId).split(',').map(Number);
    if (ids.length === 1) {
      qb.andWhere('student.assignedStaffId = :assignedStaffId', { assignedStaffId: ids[0] });
    } else {
      qb.andWhere('student.assignedStaffId IN (:...assignedStaffId)', { assignedStaffId: ids });
    }
  }
  
  if (newStudent != null) {
    const wantNew = String(newStudent).toLowerCase() === 'true';
    qb.andWhere('student.newStudent = :newStudent', { newStudent: wantNew });
  }
  
  return qb;
}

exports.getStudents = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));
  
  const qb = buildQueryBuilder(req.query);
  const totalItems = await qb.getCount();
  
  if (sortBy) {
    const order = (sortDirection || 'ASC').toUpperCase();
    qb.orderBy(`student.${sortBy}`, order);
  }
  
  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const students = await qb.getMany();
  const items = await Promise.all(students.map(toEnrichedStudent));
  
  // Đảm bảo totalPages luôn >= 1 (kể cả khi không có dữ liệu)
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  res.json({ page: pageNum, size: pageSize, totalItems, totalPages, items });
};

exports.getStudentSummary = async (req, res) => {
  // Tạo query builder riêng cho summary, không dùng buildQueryBuilder để tránh filter không mong muốn
  const repo = AppDataSource.getRepository('Student');
  
  // Lấy tổng số học viên TẤT CẢ (không filter thời gian)
  const allStudents = await repo.find();
  const totalAll = allStudents.length;
  let newStudentsCountAll = 0;
  
  // Đếm học viên mới trong tất cả học viên
  for (const s of allStudents) {
    if (s.newStudent === true) {
      newStudentsCountAll++;
    }
  }
  
  // Query builder cho filter thời gian (nếu có)
  const qb = repo.createQueryBuilder('student');
  const { startDate, endDate } = req.query;
  
  // Chỉ áp dụng filter thời gian nếu được cung cấp
  if (startDate || endDate) {
    if (startDate) {
      qb.andWhere('student.createdAt >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      // Set time là 23:59:59 để bao gồm cả ngày cuối
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      qb.andWhere('student.createdAt <= :endDate', { endDate: endDateObj });
    }
    
    const items = await qb.getMany();
    const total = items.length;
    const byStatus = {};
    const byEnrollment = {};
    const byCampaign = {};
    
    const newStudentsCount = total;
    
    for (const s of items) {
      const st = s.status || 'active';
      byStatus[st] = (byStatus[st] || 0) + 1;
      const en = s.enrollmentStatus || 'pending';
      byEnrollment[en] = (byEnrollment[en] || 0) + 1;
      const camp = s.campaignId ? await AppDataSource.getRepository('Campaign').findOne({ where: { id: s.campaignId } }) : null;
      const campName = camp ? camp.name : 'Unknown';
      byCampaign[campName] = (byCampaign[campName] || 0) + 1;
    }
    
    // Trả về cả tổng số tất cả và tổng số trong khoảng thời gian
    res.json({ 
      total: total,                    // Tổng số trong khoảng thời gian
      totalAll: totalAll,               // Tổng số tất cả học viên
      newStudentsCount: newStudentsCount, // Số học viên mới trong khoảng thời gian
      newStudentsCountAll: newStudentsCountAll, // Số học viên mới tất cả
      byStatus, 
      byEnrollment, 
      byCampaign 
    });
  } else {
    // Nếu không có filter thời gian, trả về tổng số tất cả
    const byStatus = {};
    const byEnrollment = {};
    const byCampaign = {};
    
    for (const s of allStudents) {
      const st = s.status || 'active';
      byStatus[st] = (byStatus[st] || 0) + 1;
      const en = s.enrollmentStatus || 'pending';
      byEnrollment[en] = (byEnrollment[en] || 0) + 1;
      const camp = s.campaignId ? await AppDataSource.getRepository('Campaign').findOne({ where: { id: s.campaignId } }) : null;
      const campName = camp ? camp.name : 'Unknown';
      byCampaign[campName] = (byCampaign[campName] || 0) + 1;
    }
    
    res.json({ 
      total: totalAll, 
      totalAll: totalAll,
      newStudentsCount: newStudentsCountAll,
      newStudentsCountAll: newStudentsCountAll,
      byStatus, 
      byEnrollment, 
      byCampaign 
    });
  }
};

// Get recent enrollments (recent student registrations)
exports.getRecentEnrollments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.max(1, Math.min(Number(limit), 50)); // Max 50, min 1
    
    const repo = AppDataSource.getRepository('Student');
    const qb = repo.createQueryBuilder('student');
    
    // Filter by enrolled status
    qb.andWhere('student.enrollmentStatus = :enrollmentStatus', { enrollmentStatus: 'enrolled' });
    
    // Sort by createdAt descending (most recent first)
    qb.orderBy('student.createdAt', 'DESC');
    
    // Limit results
    qb.take(limitNum);
    
    const students = await qb.getMany();
    const items = await Promise.all(students.map(toEnrichedStudent));
    
    res.json(items);
  } catch (error) {
    console.error('Error getting recent enrollments:', error);
    res.status(500).json({ error: 'Failed to get recent enrollments', message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  const id = Number(req.params.id);
  const s = await AppDataSource.getRepository('Student').findOne({ where: { id } });
  if (!s) return res.status(404).json({ message: 'Student not found' });
  res.json(await toEnrichedStudent(s));
};

exports.createStudent = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Student');
  const s = {
    fullName: body.fullName || body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    status: body.status || 'active',
    enrollmentStatus: body.enrollmentStatus || 'pending',
    campaignId: body.campaignId != null ? Number(body.campaignId) : null,
    channelId: body.channelId != null ? Number(body.channelId) : null,
    assignedStaffId: body.assignedStaffId != null ? Number(body.assignedStaffId) : null,
    newStudent: Boolean(body.newStudent),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await repo.save(s);
  res.status(201).json(await toEnrichedStudent(saved));
};

exports.updateStudent = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Student');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Student not found' });
  const body = req.body || {};
  const updated = {
    ...existing,
    ...body,
    fullName: body.fullName ?? body.name ?? existing.fullName,
    campaignId: body.campaignId != null ? Number(body.campaignId) : existing.campaignId,
    channelId: body.channelId != null ? Number(body.channelId) : existing.channelId,
    assignedStaffId: body.assignedStaffId != null ? Number(body.assignedStaffId) : existing.assignedStaffId,
    newStudent: body.newStudent != null ? Boolean(body.newStudent) : existing.newStudent,
    updatedAt: new Date()
  };
  const saved = await repo.save(updated);
  res.json(await toEnrichedStudent(saved));
};

exports.deleteStudent = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Student');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Student not found' });
  await repo.remove(existing);
  res.json(await toEnrichedStudent(existing));
};
