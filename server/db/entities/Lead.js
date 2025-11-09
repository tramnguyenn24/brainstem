const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Lead',
  tableName: 'leads',
  columns: {
    id: { type: Number, primary: true, generated: true },
    fullName: { name: 'full_name', type: String, nullable: true },
    email: { type: String, nullable: true },
    phone: { type: String, nullable: true },
    status: { type: String, nullable: true },
    interestLevel: { name: 'interest_level', type: String, nullable: true },
    campaignId: { name: 'campaign_id', type: Number, nullable: true },
    channelId: { name: 'channel_id', type: Number, nullable: true },
    assignedStaffId: { name: 'assigned_staff_id', type: Number, nullable: true },
    tags: { type: 'text', array: true, nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});


