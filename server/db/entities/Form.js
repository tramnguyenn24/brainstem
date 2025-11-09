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
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});


