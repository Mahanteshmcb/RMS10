// Define role constants and helper functions

const Roles = {
  OWNER: 'owner',
  MANAGER: 'manager',
  CHEF: 'chef',
  WAITER: 'waiter',
  CASHIER: 'cashier',
};

function canPerform(role, action) {
  // simplistic; expand as needed
  const permissions = {
    owner: ['*'],
    manager: ['*'],
    chef: ['view_orders', 'update_status'],
    waiter: ['create_orders', 'view_menu', 'view_reports'],
    cashier: ['create_bills', 'view_reports'],
  };
  const allowed = permissions[role];
  if (!allowed) return false;
  return allowed.includes('*') || allowed.includes(action);
}

module.exports = { Roles, canPerform };
