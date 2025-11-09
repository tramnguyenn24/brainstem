const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Course',
  tableName: 'courses',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    description: { type: String, nullable: true },
    price: { type: 'numeric', nullable: true },
    status: { type: String, nullable: true, default: 'active' },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});

