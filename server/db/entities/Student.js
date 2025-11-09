const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Student',
  tableName: 'students',
  columns: {
    id: { type: Number, primary: true, generated: true },
    fullName: { name: 'full_name', type: String, nullable: true },
    email: { type: String, nullable: true },
    phone: { type: String, nullable: true },
    status: { type: String, nullable: true },
    enrollmentStatus: { name: 'enrollment_status', type: String, nullable: true },
    campaignId: { name: 'campaign_id', type: Number, nullable: true },
    channelId: { name: 'channel_id', type: Number, nullable: true },
    courseId: { name: 'course_id', type: Number, nullable: true },
    assignedStaffId: { name: 'assigned_staff_id', type: Number, nullable: true },
    newStudent: { name: 'new_student', type: Boolean, nullable: true },
    sourceLeadId: { name: 'source_lead_id', type: Number, nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});


