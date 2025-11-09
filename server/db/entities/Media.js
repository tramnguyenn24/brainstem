const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Media',
  tableName: 'media',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    type: { type: String, nullable: true }, // image, video, document, etc.
    url: { type: String, nullable: true },
    description: { type: String, nullable: true },
    fileSize: { name: 'file_size', type: 'numeric', nullable: true },
    mimeType: { name: 'mime_type', type: String, nullable: true },
    status: { type: String, nullable: true, default: 'active' },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    updatedAt: { name: 'updated_at', type: 'timestamptz', updateDate: true }
  }
});

