let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

function getNextId() {
  return users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
}

exports.listUsers = (req, res) => {
  res.json(users);
};

exports.getUser = (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

exports.createUser = (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const newUser = { id: getNextId(), name };
  users.push(newUser);
  res.status(201).json(newUser);
};

exports.updateUser = (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body || {};
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  if (!name) return res.status(400).json({ message: 'Name is required' });
  users[idx] = { ...users[idx], name };
  res.json(users[idx]);
};

exports.deleteUser = (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const deleted = users[idx];
  users.splice(idx, 1);
  res.json(deleted);
};


