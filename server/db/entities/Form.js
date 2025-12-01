const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Form',
  tableName: 'forms',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    status: { type: String, nullable: true },
    fields: { type: 'jsonb', nullable: true },
    settings: { type: 'jsonb', nullable: true },
    embedCode: { name: 'embed_code', type: 'text', nullable: true },
    // Foreign keys
    campaignId: { name: 'campaign_id', type: Number, nullable: true },
    createdByStaffId: { name: 'created_by_staff_id', type: Number, nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  },
  relations: {
    campaign: {
      type: 'many-to-one',
      target: 'Campaign',
      joinColumn: { name: 'campaign_id', referencedColumnName: 'id' },
      nullable: true,
      onDelete: 'SET NULL'
    },
    createdBy: {
      type: 'many-to-one',
      target: 'Staff',
      joinColumn: { name: 'created_by_staff_id', referencedColumnName: 'id' },
      nullable: true,
      onDelete: 'SET NULL'
    }
  }
});


