const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CampaignChannel',
  tableName: 'campaign_channels',
  columns: {
    id: { type: Number, primary: true, generated: true },
    campaignId: { name: 'campaign_id', type: Number },
    channelId: { name: 'channel_id', type: Number },
    cost: { type: 'numeric', nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});

