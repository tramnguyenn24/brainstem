const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Campaign',
  tableName: 'campaigns',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    status: { type: String, nullable: true, default: 'running' },
    ownerStaffId: { name: 'owner_staff_id', type: Number, nullable: true },
    budget: { type: 'numeric', nullable: true },
    spend: { type: 'numeric', nullable: true },
    cost: { type: 'numeric', nullable: true }, // Chi phí (tổng chi phí của tất cả kênh)
    revenue: { type: 'numeric', nullable: true }, // Doanh thu
    potentialStudentsCount: { name: 'potential_students_count', type: Number, nullable: true, default: 0 }, // Số HVTN
    newStudentsCount: { name: 'new_students_count', type: Number, nullable: true, default: 0 }, // Số HV mới
    roi: { type: 'numeric', nullable: true },
    startDate: { name: 'start_date', type: 'timestamptz', nullable: true }, // Ngày bắt đầu chiến dịch
    endDate: { name: 'end_date', type: 'timestamptz', nullable: true }, // Ngày kết thúc chiến dịch
    // Mục tiêu chiến dịch
    targetLeads: { name: 'target_leads', type: Number, nullable: true, default: 0 }, // Mục tiêu số lead
    targetNewStudents: { name: 'target_new_students', type: Number, nullable: true, default: 0 }, // Mục tiêu số HV mới
    targetRevenue: { name: 'target_revenue', type: 'numeric', nullable: true, default: 0 }, // Mục tiêu doanh thu
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});


