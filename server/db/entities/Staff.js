const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Staff',
  tableName: 'staff',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    role: { type: String, nullable: true },
    status: { type: String, nullable: true, default: 'active' },
    department: { type: String, nullable: true }
  }
});


