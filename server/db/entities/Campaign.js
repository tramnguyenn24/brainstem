const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Campaign',
  tableName: 'campaigns',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    status: { type: String, nullable: true, default: 'running' },
    channelId: { name: 'channel_id', type: Number, nullable: true },
    ownerStaffId: { name: 'owner_staff_id', type: Number, nullable: true },
    budget: { type: 'numeric', nullable: true },
    spend: { type: 'numeric', nullable: true },
    cost: { type: 'numeric', nullable: true }, // Chi phí (tổng chi phí của tất cả kênh)
    revenue: { type: 'numeric', nullable: true }, // Doanh thu
    potentialStudentsCount: { name: 'potential_students_count', type: Number, nullable: true, default: 0 }, // Số HVTN
    newStudentsCount: { name: 'new_students_count', type: Number, nullable: true, default: 0 }, // Số HV mới
    roi: { type: 'numeric', nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});


