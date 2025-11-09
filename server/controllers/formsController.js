const { AppDataSource } = require('../db/data-source');

function buildQueryBuilder(query) {
  const { search, status } = query;
  const repo = AppDataSource.getRepository('Form');
  const qb = repo.createQueryBuilder('form');
  
  if (search) {
    const q = String(search).toLowerCase();
    qb.andWhere('LOWER(form.name) LIKE :q', { q: `%${q}%` });
  }
  
  if (status) {
    const values = String(status).split(',').map(s => s.trim());
    if (values.length === 1) {
      qb.andWhere('form.status = :status', { status: values[0] });
    } else {
      qb.andWhere('form.status IN (:...status)', { status: values });
    }
  }
  
  return qb;
}

exports.getForms = async (req, res) => {
  const { page = 1, size = 10, sortBy, sortDirection } = req.query;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.max(1, Number(size));
  
  const qb = buildQueryBuilder(req.query);
  const totalItems = await qb.getCount();
  
  if (sortBy) {
    const order = (sortDirection || 'ASC').toUpperCase();
    qb.orderBy(`form.${sortBy}`, order);
  }
  
  qb.skip((pageNum - 1) * pageSize).take(pageSize);
  const items = await qb.getMany();
  
  res.json({ page: pageNum, size: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize), items });
};

exports.getById = async (req, res) => {
  const id = Number(req.params.id);
  const form = await AppDataSource.getRepository('Form').findOne({ where: { id } });
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json(form);
};

exports.getEmbed = async (req, res) => {
  const id = Number(req.params.id);
  const form = await AppDataSource.getRepository('Form').findOne({ where: { id } });
  if (!form) return res.status(404).json({ message: 'Form not found' });
  res.json({ id: form.id, name: form.name, embedCode: form.embedCode });
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Form');
  const channelRepo = AppDataSource.getRepository('Channel');
  
  // Merge description and campaignId into settings if provided
  const settings = {
    ...(body.settings || {}),
    submitText: body.settings?.submitText || 'Gửi',
    theme: body.settings?.theme || 'light'
  };
  
  // Store description and campaignId in settings if not in entity
  if (body.description) {
    settings.description = body.description;
  }
  if (body.campaignId) {
    settings.campaignId = body.campaignId;
  }
  
  let fields = Array.isArray(body.fields) ? body.fields : [];
  
  // Nếu form có campaignId, tự động thêm trường hỏi về kênh truyền thông nếu chưa có
  if (body.campaignId) {
    const hasChannelField = fields.some(f => 
      f.id === 'channel' || 
      f.id === 'channelId' || 
      f.id === 'kenh' || 
      f.id === 'kenhtruyenthong' ||
      (f.label && f.label.toLowerCase().includes('kênh'))
    );
    
    if (!hasChannelField) {
      // Lấy danh sách kênh để tạo options
      const channels = await channelRepo.find({ where: { status: 'active' } });
      const channelOptions = channels.map(ch => ch.name);
      
      // Thêm trường hỏi về kênh truyền thông
      fields.push({
        id: 'kenhtruyenthong',
        label: 'Bạn biết chiến dịch qua kênh nào?',
        type: 'select',
        required: false,
        placeholder: 'Chọn kênh truyền thông',
        options: channelOptions.length > 0 ? channelOptions : ['FB ads', 'Zalo OA', 'Người quen giới thiệu']
      });
    }
  }
  
  const form = {
    name: body.name || 'Untitled Form',
    status: body.status || 'active',
    fields: fields,
    settings: settings,
    embedCode: body.embedCode || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await repo.save(form);
  if (!saved.embedCode) {
    saved.embedCode = `<iframe src="https://example.com/embed/form/${saved.id}" width="100%" height="500" frameborder="0"></iframe>`;
    await repo.update(saved.id, { embedCode: saved.embedCode });
    saved.embedCode = saved.embedCode;
  }
  res.status(201).json(saved);
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Form');
  const channelRepo = AppDataSource.getRepository('Channel');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Form not found' });
  const body = req.body || {};
  
  // Merge description and campaignId into settings if provided
  const settings = {
    ...(existing.settings || {}),
    ...(body.settings || {})
  };
  
  if (body.description) {
    settings.description = body.description;
  }
  if (body.campaignId !== undefined) {
    settings.campaignId = body.campaignId;
  }
  
  let fields = body.fields !== undefined ? body.fields : existing.fields;
  
  // Nếu form có campaignId và chưa có trường hỏi về kênh, tự động thêm
  const campaignId = settings.campaignId || existing.settings?.campaignId;
  if (campaignId && Array.isArray(fields)) {
    const hasChannelField = fields.some(f => 
      f.id === 'channel' || 
      f.id === 'channelId' || 
      f.id === 'kenh' || 
      f.id === 'kenhtruyenthong' ||
      (f.label && f.label.toLowerCase().includes('kênh'))
    );
    
    if (!hasChannelField) {
      // Lấy danh sách kênh để tạo options
      const channels = await channelRepo.find({ where: { status: 'active' } });
      const channelOptions = channels.map(ch => ch.name);
      
      // Thêm trường hỏi về kênh truyền thông
      fields = [...fields, {
        id: 'kenhtruyenthong',
        label: 'Bạn biết chiến dịch qua kênh nào?',
        type: 'select',
        required: false,
        placeholder: 'Chọn kênh truyền thông',
        options: channelOptions.length > 0 ? channelOptions : ['FB ads', 'Zalo OA', 'Người quen giới thiệu']
      }];
    }
  }
  
  const updated = {
    ...existing,
    name: body.name !== undefined ? body.name : existing.name,
    status: body.status !== undefined ? body.status : existing.status,
    fields: fields,
    settings: settings,
    updatedAt: new Date()
  };
  const saved = await repo.save(updated);
  res.json(saved);
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  const repo = AppDataSource.getRepository('Form');
  const existing = await repo.findOne({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Form not found' });
  await repo.remove(existing);
  res.json(existing);
};

// Submit form - tạo lead từ form submission
exports.submitForm = async (req, res) => {
  const id = Number(req.params.id);
  const formRepo = AppDataSource.getRepository('Form');
  const leadRepo = AppDataSource.getRepository('Lead');
  const channelRepo = AppDataSource.getRepository('Channel');
  const campaignRepo = AppDataSource.getRepository('Campaign');
  
  const form = await formRepo.findOne({ where: { id } });
  if (!form) return res.status(404).json({ message: 'Form not found' });
  
  if (form.status !== 'active') {
    return res.status(400).json({ message: 'Form is not active' });
  }
  
  const body = req.body || {};
  const formData = body.data || body;
  
  // Lấy campaignId từ form settings
  const campaignId = form.settings?.campaignId || null;
  
  // Tìm channelId từ form data
  // Tìm trường có id là 'channel', 'channelId', 'kenh', 'kenhtruyenthong', hoặc label chứa "kênh"
  let channelId = null;
  const channelField = form.fields?.find(f => 
    f.id === 'channel' || 
    f.id === 'channelId' || 
    f.id === 'kenh' || 
    f.id === 'kenhtruyenthong' ||
    (f.label && f.label.toLowerCase().includes('kênh'))
  );
  
  if (channelField) {
    const channelValue = formData[channelField.id] || formData[channelField.label];
    if (channelValue) {
      // Nếu là số, dùng trực tiếp
      if (typeof channelValue === 'number') {
        channelId = channelValue;
      } else {
        // Nếu là string, tìm channel theo tên
        const channel = await channelRepo.findOne({ 
          where: { name: channelValue } 
        });
        if (channel) {
          channelId = channel.id;
        } else {
          // Thử parse số từ string
          const parsed = Number(channelValue);
          if (!isNaN(parsed)) {
            channelId = parsed;
          }
        }
      }
    }
  }
  
  // Tạo lead từ form data
  const newLead = {
    fullName: formData.fullName || formData.name || formData.hoten || '',
    email: formData.email || '',
    phone: formData.phone || formData.sdt || formData.sodienthoai || '',
    status: 'new',
    interestLevel: formData.interestLevel || 'medium',
    campaignId: campaignId,
    channelId: channelId,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const saved = await leadRepo.save(newLead);
  
  // Cập nhật metrics của campaign nếu có
  if (campaignId) {
    const campaign = await campaignRepo.findOne({ where: { id: campaignId } });
    if (campaign) {
      // Metrics sẽ được tính tự động trong toEnrichedCampaign
      // Nhưng có thể trigger update ở đây nếu cần
    }
  }
  
  res.status(201).json({
    success: true,
    message: 'Form submitted successfully',
    leadId: saved.id
  });
};