const now = () => new Date().toISOString();

const channels = [
  { id: 1, name: 'Facebook Ads', type: 'paid', status: 'active' },
  { id: 2, name: 'Google Ads', type: 'paid', status: 'active' },
  { id: 3, name: 'Referral', type: 'organic', status: 'active' }
];

const campaigns = [
  { id: 1, name: 'Campaign A', status: 'running', channelId: 1, ownerStaffId: 1, roi: 1.8 },
  { id: 2, name: 'Campaign B', status: 'paused', channelId: 2, ownerStaffId: 2, roi: 1.2 }
];

const staff = [
  { id: 1, name: 'Nguyen Van A', role: 'sales', status: 'active', department: 'Sales' },
  { id: 2, name: 'Tran Thi B', role: 'sales', status: 'active', department: 'Sales' },
  { id: 3, name: 'Le Van C', role: 'marketing', status: 'active', department: 'Marketing' }
];

const leads = [
  {
    id: 1,
    fullName: 'Pham Minh Khoa',
    email: 'khoa@example.com',
    phone: '0900000001',
    status: 'new',
    interestLevel: 'high',
    campaignId: 1,
    channelId: 1,
    assignedStaffId: 1,
    tags: ['hot'],
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: 2,
    fullName: 'Nguyen Thu Ha',
    email: 'ha@example.com',
    phone: '0900000002',
    status: 'contacted',
    interestLevel: 'medium',
    campaignId: 2,
    channelId: 2,
    assignedStaffId: 2,
    tags: ['followup'],
    createdAt: now(),
    updatedAt: now()
  }
];

const students = [];
const forms = [
  {
    id: 1,
    name: 'Lead Capture Form',
    status: 'active',
    fields: [
      { id: 'fullName', label: 'Họ và tên', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'phone', label: 'Số điện thoại', type: 'tel', required: false },
      { id: 'interest', label: 'Mức quan tâm', type: 'select', required: false, options: ['low','medium','high'] }
    ],
    settings: { submitText: 'Gửi', theme: 'light' },
    embedCode: '<iframe src="https://example.com/embed/form/1" width="100%" height="500" frameborder="0"></iframe>',
    createdAt: now(),
    updatedAt: now()
  }
];

function getNextId(array) {
  return array.length ? Math.max(...array.map(x => x.id)) + 1 : 1;
}

module.exports = {
  channels,
  campaigns,
  staff,
  leads,
  students,
  forms,
  getNextId
};


