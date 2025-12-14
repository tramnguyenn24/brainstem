require('dotenv').config();
require('reflect-metadata');
const { DataSource } = require('typeorm');
const Channel = require('./entities/Channel');
const Staff = require('./entities/Staff');
const Campaign = require('./entities/Campaign');
const Lead = require('./entities/Lead');
const Student = require('./entities/Student');
const Form = require('./entities/Form');
const Course = require('./entities/Course');
const CampaignChannel = require('./entities/CampaignChannel');
const LeadCampaignHistory = require('./entities/LeadCampaignHistory');

const isSslEnabled = (() => {
  const mode = (process.env.PGSSLMODE || '').toLowerCase();
  return mode === 'require' || mode === 'enable' || mode === 'true';
})();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
  entities: [Channel, Staff, Campaign, Lead, Student, Form, Course, CampaignChannel, LeadCampaignHistory],
  synchronize: false,
  logging: false,
  migrations: ['db/migrations/*.js']
});

async function seedIfEmpty() {
  const channelRepo = AppDataSource.getRepository('Channel');
  const staffRepo = AppDataSource.getRepository('Staff');
  const campaignRepo = AppDataSource.getRepository('Campaign');

  const channelCount = await channelRepo.count();
  if (channelCount === 0) {
    await channelRepo.save([
      { name: 'Facebook Ads', type: 'paid', status: 'active' },
      { name: 'Google Ads', type: 'paid', status: 'active' },
      { name: 'Referral', type: 'organic', status: 'active' }
    ]);
  }

  const staffCount = await staffRepo.count();
  if (staffCount === 0) {
    await staffRepo.save([
      { name: 'Nguyen Van A', role: 'sales', status: 'active', department: 'Sales' },
      { name: 'Tran Thi B', role: 'sales', status: 'active', department: 'Sales' },
      { name: 'Le Van C', role: 'marketing', status: 'active', department: 'Marketing' }
    ]);
  }

  const campaignCount = await campaignRepo.count();
  if (campaignCount === 0) {
    const fb = await channelRepo.findOneBy({ name: 'Facebook Ads' });
    const gg = await channelRepo.findOneBy({ name: 'Google Ads' });
    const a = await staffRepo.findOneBy({ name: 'Nguyen Van A' });
    const b = await staffRepo.findOneBy({ name: 'Tran Thi B' });
    await campaignRepo.save([
      { name: 'Campaign A', status: 'running', channelId: fb?.id || null, ownerStaffId: a?.id || null, roi: 1.8 },
      { name: 'Campaign B', status: 'paused', channelId: gg?.id || null, ownerStaffId: b?.id || null, roi: 1.2 }
    ]);
  }
}

module.exports = { AppDataSource, seedIfEmpty };


