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

  // Tạo embed code với URL động
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const embedUrl = `${baseUrl}/forms/embed/${id}`;

  // Tạo iframe embed code
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`;

  // Tạo script embed code (alternative)
  const scriptEmbedCode = `<div id="brainstem-form-${id}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.borderRadius = '8px';
    document.getElementById('brainstem-form-${id}').appendChild(iframe);
  })();
</script>`;

  res.json({
    id: form.id,
    name: form.name,
    embedCode: embedCode,
    embedUrl: embedUrl,
    scriptEmbedCode: scriptEmbedCode
  });
};

exports.create = async (req, res) => {
  const body = req.body || {};
  const repo = AppDataSource.getRepository('Form');
  const channelRepo = AppDataSource.getRepository('Channel');

  // Merge description into settings if provided
  const settings = {
    ...(body.settings || {}),
    submitText: body.settings?.submitText || 'Gửi',
    theme: body.settings?.theme || 'light'
  };

  // Store description in settings
  if (body.description) {
    settings.description = body.description;
  }

  // campaignId is now stored as foreign key, but keep it in settings for backward compatibility
  const campaignId = body.campaignId != null ? Number(body.campaignId) : null;
  if (campaignId) {
    settings.campaignId = campaignId; // Keep in settings for backward compatibility
  }

  let fields = Array.isArray(body.fields) ? body.fields : [];

  // Nếu form có campaignId, tự động thêm trường hỏi về kênh truyền thông nếu chưa có
  if (campaignId) {
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
    campaignId: campaignId, // Store as foreign key
    createdByStaffId: body.createdByStaffId != null ? Number(body.createdByStaffId) : null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const saved = await repo.save(form);

  // Tạo embed code với URL động
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const embedUrl = `${baseUrl}/forms/embed/${saved.id}`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`;

  if (!saved.embedCode) {
    await repo.update(saved.id, { embedCode: embedCode });
    saved.embedCode = embedCode;
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

  // Merge description into settings if provided
  const settings = {
    ...(existing.settings || {}),
    ...(body.settings || {})
  };

  if (body.description) {
    settings.description = body.description;
  }

  // campaignId is now stored as foreign key, but keep it in settings for backward compatibility
  const campaignId = body.campaignId !== undefined
    ? (body.campaignId != null ? Number(body.campaignId) : null)
    : existing.campaignId;

  if (campaignId) {
    settings.campaignId = campaignId; // Keep in settings for backward compatibility
  }

  let fields = body.fields !== undefined ? body.fields : existing.fields;

  // Nếu form có campaignId và chưa có trường hỏi về kênh, tự động thêm
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
    campaignId: campaignId, // Update foreign key
    createdByStaffId: body.createdByStaffId !== undefined
      ? (body.createdByStaffId != null ? Number(body.createdByStaffId) : null)
      : existing.createdByStaffId,
    updatedAt: new Date()
  };
  const saved = await repo.save(updated);

  // Cập nhật embed code nếu cần
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const embedUrl = `${baseUrl}/forms/embed/${saved.id}`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`;

  if (!saved.embedCode || !saved.embedCode.includes(embedUrl)) {
    await repo.update(saved.id, { embedCode: embedCode });
    saved.embedCode = embedCode;
  }

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

  // Lấy campaignId từ form (ưu tiên foreign key, fallback về settings cho backward compatibility)
  let campaignId = form.campaignId || form.settings?.campaignId || null;

  // Validate campaignId exists to prevent foreign key constraint violation
  if (campaignId) {
    const campaign = await campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) {
      console.warn(`Form submission references non-existent campaignId: ${campaignId}`);
      campaignId = null;
    }
  }

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
    const fieldId = channelField.id || channelField.label?.toLowerCase().replace(/\s+/g, '');
    const channelValue = formData[fieldId] || formData[channelField.id] || formData[channelField.label] || '';
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

  // Map form data sang lead fields
  // Tìm các field trong form để map đúng
  let fullName = '';
  let email = '';
  let phone = '';

  if (form.fields && Array.isArray(form.fields)) {
    form.fields.forEach(field => {
      const fieldId = field.id || field.label?.toLowerCase().replace(/\s+/g, '');
      const value = formData[fieldId] || formData[field.label] || '';

      // Map các field phổ biến
      if (field.type === 'text' || field.type === 'email') {
        const labelLower = (field.label || '').toLowerCase();
        if (labelLower.includes('họ tên') || labelLower.includes('tên') || labelLower.includes('name') || fieldId.includes('hoten') || fieldId.includes('fullname') || fieldId.includes('name')) {
          fullName = value || fullName;
        } else if (labelLower.includes('email') || fieldId.includes('email')) {
          email = value || email;
        } else if (labelLower.includes('điện thoại') || labelLower.includes('phone') || labelLower.includes('số điện') || fieldId.includes('phone') || fieldId.includes('sdt') || fieldId.includes('sodienthoai')) {
          phone = value || phone;
        }
      } else if (field.type === 'tel') {
        phone = value || phone;
      }
    });
  }

  // Fallback: thử các key phổ biến
  fullName = fullName || formData.fullName || formData.name || formData.hoten || formData['họ tên'] || '';
  email = email || formData.email || formData['email'] || '';
  phone = phone || formData.phone || formData.sdt || formData.sodienthoai || formData['số điện thoại'] || '';

  // Tạo lead từ form data
  const newLead = {
    fullName: fullName,
    email: email,
    phone: phone,
    status: 'new',
    interestLevel: formData.interestLevel || 'medium',
    campaignId: campaignId,
    channelId: channelId,
    formId: form.id, // Track nguồn gốc từ form nào
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