/**
 * Fictional portfolio for the public demo.
 * Names, balances, and notes are invented. Nothing here is a real account.
 */

export const defaultCategories = [
  'Client meals',
  'Software',
  'Contractors',
  'Office',
  'Travel',
  'Utilities',
  'Income',
  'Transfer',
  'Interest',
  'Other'
];

export const seedAccounts = [
  { id: 'demo-harborview-checking', name: 'Harborview Checking', type: 'bank', balance: 8420.55, apy: 0 },
  { id: 'demo-northwind-savings', name: 'Northwind Savings', type: 'bank', balance: 24680.1, apy: 4.25 },
  { id: 'demo-lumen-rewards', name: 'Lumen Rewards Card', type: 'credit', balance: -1284.32, apy: 0 },
  { id: 'demo-paperplane-card', name: 'Paperplane Card', type: 'credit', balance: -420.18, apy: 0 },
  { id: 'demo-studio-cash', name: 'Studio Drawer Cash', type: 'cash', balance: 640, apy: 0 },
  { id: 'demo-cedar-brokerage', name: 'Cedar Hill Brokerage', type: 'investment', balance: 31850.75, apy: 0 },
  { id: 'demo-pebble-exchange', name: 'Pebble Exchange', type: 'crypto', balance: 4125.4, apy: 0 },
  { id: 'demo-silverline-gift', name: 'Silverline Gift Card', type: 'gift', balance: 75, apy: 0 },
  { id: 'demo-oak-iron', name: 'Oak & Iron Bullion', type: 'metal', balance: 2150, apy: 0 },
  { id: 'demo-workshop-tools', name: 'Workshop Tools', type: 'other', balance: 1800, apy: 0 }
];

export const STORAGE_KEYS = {
  accounts: 'tfa_finance_accounts',
  activities: 'tfa_finance_activities',
  categories: 'tfa_finance_categories',
  columns: 'tfa_finance_columns',
  initialized: 'tfa_finance_initialized'
};

export function cloneSeedAccounts() {
  return seedAccounts.map((account) => ({ ...account }));
}

export function buildSeedActivities(now = Date.now()) {
  const at = (daysAgo) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'demo-act-lunch',
      accountId: 'demo-lumen-rewards',
      accountName: 'Lumen Rewards Card',
      delta: -86.4,
      category: 'Client meals',
      note: 'Demo: lunch near a client site',
      createdAt: at(1)
    },
    {
      id: 'demo-act-software',
      accountId: 'demo-paperplane-card',
      accountName: 'Paperplane Card',
      delta: -49,
      category: 'Software',
      note: 'Demo: sample design-tool subscription',
      createdAt: at(2)
    },
    {
      id: 'demo-act-office',
      accountId: 'demo-lumen-rewards',
      accountName: 'Lumen Rewards Card',
      delta: -64.2,
      category: 'Office',
      note: 'Demo: paper and ink',
      createdAt: at(4)
    },
    {
      id: 'demo-act-invoice',
      accountId: 'demo-harborview-checking',
      accountName: 'Harborview Checking',
      delta: 4500,
      category: 'Income',
      note: 'Demo: sample invoice marked paid',
      createdAt: at(6)
    },
    {
      id: 'demo-act-utilities',
      accountId: 'demo-lumen-rewards',
      accountName: 'Lumen Rewards Card',
      delta: -96.5,
      category: 'Utilities',
      note: 'Demo: studio electricity',
      createdAt: at(9)
    },
    {
      id: 'demo-act-travel',
      accountId: 'demo-paperplane-card',
      accountName: 'Paperplane Card',
      delta: -210,
      category: 'Travel',
      note: 'Demo: regional train fare',
      createdAt: at(12)
    },
    {
      id: 'demo-act-contractor',
      accountId: 'demo-harborview-checking',
      accountName: 'Harborview Checking',
      delta: -350,
      category: 'Contractors',
      note: 'Demo: sample freelance invoice',
      createdAt: at(16)
    },
    {
      id: 'demo-act-yield',
      accountId: 'demo-northwind-savings',
      accountName: 'Northwind Savings',
      delta: 87.41,
      category: 'Interest',
      note: 'Demo: sample savings yield',
      createdAt: at(20)
    },
    {
      id: 'demo-act-older',
      accountId: 'demo-lumen-rewards',
      accountName: 'Lumen Rewards Card',
      delta: -30,
      category: 'Office',
      note: 'Demo: older receipt outside a 30-day window',
      createdAt: at(45)
    }
  ];
}
