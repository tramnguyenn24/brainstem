const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Channel',
  tableName: 'channels',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    type: { type: String, nullable: true },
    status: { type: String, nullable: true, default: 'active' }
  }
});


