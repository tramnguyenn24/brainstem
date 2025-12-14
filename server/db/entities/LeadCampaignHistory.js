const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'LeadCampaignHistory',
  tableName: 'lead_campaign_history',
  columns: {
    id: { type: Number, primary: true, generated: true },
    leadId: { name: 'lead_id', type: Number, nullable: false },
    campaignId: { name: 'campaign_id', type: Number, nullable: true },
    channelId: { name: 'channel_id', type: Number, nullable: true },
    formId: { name: 'form_id', type: Number, nullable: true },
    status: { type: String, nullable: true, default: 'new' }, // new, contacted, qualified, converted
    interestLevel: { name: 'interest_level', type: String, nullable: true, default: 'medium' },
    notes: { type: String, nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  },
  relations: {
    lead: {
      type: 'many-to-one',
      target: 'Lead',
      joinColumn: { name: 'lead_id', referencedColumnName: 'id' },
      nullable: false,
      onDelete: 'CASCADE'
    },
    campaign: {
      type: 'many-to-one',
      target: 'Campaign',
      joinColumn: { name: 'campaign_id', referencedColumnName: 'id' },
      nullable: true,
      onDelete: 'SET NULL'
    },
    channel: {
      type: 'many-to-one',
      target: 'Channel',
      joinColumn: { name: 'channel_id', referencedColumnName: 'id' },
      nullable: true,
      onDelete: 'SET NULL'
    },
    form: {
      type: 'many-to-one',
      target: 'Form',
      joinColumn: { name: 'form_id', referencedColumnName: 'id' },
      nullable: true,
      onDelete: 'SET NULL'
    }
  }
});
