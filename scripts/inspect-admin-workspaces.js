const { dbStore, workspaceRepo } = require('../src/lib/db');
const { verifySessionToken } = require('../src/lib/auth');

async function inspect() {
  const db = dbStore.read();
  console.log('Workspaces in DB:', db.workspaces.map(w => ({ id: w.id, name: w.name })));
  const admin = db.users.find(u => u.email === 'rupam@gmail.com');
  console.log('Admin user:', admin);
  const adminWorkspaces = workspaceRepo.listForUser(admin.id);
  console.log('Admin workspaces:', adminWorkspaces.map(w => ({ id: w.id, name: w.name })));
}
inspect();
