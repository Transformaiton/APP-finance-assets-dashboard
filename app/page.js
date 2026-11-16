'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEYS,
  buildSeedActivities,
  cloneSeedAccounts,
  defaultCategories
} from './demo-data';

const typeLabel = {
  bank: 'Banks',
  credit: 'Credit Cards',
  crypto: 'Crypto',
  cash: 'Cash',
  investment: 'Investments',
  gift: 'Gift Cards',
  metal: 'Gold & Silver',
  other: 'Other'
};

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function toNumber(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function load(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function Page() {
  const [accounts, setAccounts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [columns, setColumns] = useState(3);
  const [modal, setModal] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [reportRange, setReportRange] = useState('month');
  const [reportCategory, setReportCategory] = useState('all');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialized = window.localStorage.getItem(STORAGE_KEYS.initialized) === '1';
    if (initialized) {
      setAccounts(load(STORAGE_KEYS.accounts, cloneSeedAccounts()));
      setActivities(load(STORAGE_KEYS.activities, []));
      setCategories(load(STORAGE_KEYS.categories, defaultCategories));
      const storedColumns = Number(load(STORAGE_KEYS.columns, 3));
      setColumns(storedColumns >= 1 && storedColumns <= 6 ? storedColumns : 3);
    } else {
      const nextAccounts = cloneSeedAccounts();
      const nextActivities = buildSeedActivities();
      setAccounts(nextAccounts);
      setActivities(nextActivities);
      setCategories(defaultCategories);
      setColumns(3);
      window.localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(nextAccounts));
      window.localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(nextActivities));
      window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(defaultCategories));
      window.localStorage.setItem(STORAGE_KEYS.columns, JSON.stringify(3));
      window.localStorage.setItem(STORAGE_KEYS.initialized, '1');
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
  }, [accounts, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
  }, [activities, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
  }, [categories, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEYS.columns, JSON.stringify(columns));
  }, [columns, ready]);

  const filtered = useMemo(() => {
    let list = accounts.filter((account) => filter === 'all' || account.type === filter);
    if (selected.length) list = list.filter((account) => selected.includes(account.id));
    return list;
  }, [accounts, filter, selected]);

  const filteredTotal = filtered.reduce((sum, account) => sum + account.balance, 0);
  const assets = accounts.filter((account) => account.balance > 0).reduce((sum, account) => sum + account.balance, 0);
  const debt = Math.abs(accounts.filter((account) => account.balance < 0).reduce((sum, account) => sum + account.balance, 0));
  const net = assets - debt;

  const groups = useMemo(() => {
    const totals = {};
    accounts.forEach((account) => {
      totals[account.type] = (totals[account.type] || 0) + Math.max(account.balance, 0);
    });
    totals.debt = debt;
    return totals;
  }, [accounts, debt]);

  const donut = useMemo(() => {
    const entries = Object.entries(groups).filter(([, value]) => value > 0);
    const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
    const palette = ['#6d5dfc', '#2eb67d', '#f5a623', '#0ea5e9', '#f43f5e', '#8b5cf6', '#14b8a6', '#64748b'];
    let start = 0;
    const stops = [];
    entries.forEach(([, value], index) => {
      const end = start + (value / total) * 360;
      stops.push(`${palette[index % palette.length]} ${start}deg ${end}deg`);
      start = end;
    });
    return { background: stops.length ? `conic-gradient(${stops.join(',')})` : '#e6eaf0', entries, palette, total };
  }, [groups]);

  function openAccount(account = null) {
    setModal({
      kind: 'account',
      account: account ? { ...account } : { id: '', name: '', type: 'bank', balance: 0, apy: 0 }
    });
  }

  function saveAccount(form) {
    const name = form.name.trim();
    if (!name) return;
    const next = {
      ...form,
      name,
      balance: toNumber(form.balance),
      apy: toNumber(form.apy)
    };
    if (form.id) {
      setAccounts((prev) => prev.map((account) => (account.id === form.id ? next : account)));
    } else {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'account';
      setAccounts((prev) => [...prev, { ...next, id: `${slug}-${Date.now()}` }]);
    }
    setModal(null);
  }

  function addActivity(account) {
    setModal({ kind: 'activity', account, sign: -1, amount: '', category: categories[0] || 'Other', note: '' });
  }

  function saveActivity(draft) {
    const amount = Math.abs(toNumber(draft.amount));
    if (!amount) return;
    const delta = draft.sign === 1 ? amount : -amount;
    const activity = {
      id: newId('activity'),
      accountId: draft.account.id,
      accountName: draft.account.name,
      delta,
      category: draft.category,
      note: draft.note || '',
      createdAt: new Date().toISOString()
    };
    setActivities((prev) => [activity, ...prev]);
    setAccounts((prev) => prev.map((account) => (
      account.id === draft.account.id
        ? { ...account, balance: Number((account.balance + delta).toFixed(2)) }
        : account
    )));
    setModal(null);
  }

  function addInterest(account) {
    const monthly = Math.max(account.balance, 0) * (toNumber(account.apy) / 100) / 12;
    if (monthly <= 0) return;
    const activity = {
      id: newId('interest'),
      accountId: account.id,
      accountName: account.name,
      delta: Number(monthly.toFixed(2)),
      category: 'Interest',
      note: `Estimated monthly interest at ${account.apy}% APY`,
      createdAt: new Date().toISOString()
    };
    setActivities((prev) => [activity, ...prev]);
    setAccounts((prev) => prev.map((item) => (
      item.id === account.id
        ? { ...item, balance: Number((item.balance + activity.delta).toFixed(2)) }
        : item
    )));
  }

  function removeAccount(id) {
    if (!window.confirm('Delete this account from this browser?')) return;
    setAccounts((prev) => prev.filter((account) => account.id !== id));
    setSelected((prev) => prev.filter((item) => item !== id));
  }

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function dropOn(targetId) {
    if (!dragId || dragId === targetId) return;
    setAccounts((prev) => {
      const from = prev.findIndex((account) => account.id === dragId);
      const to = prev.findIndex((account) => account.id === targetId);
      if (from < 0 || to < 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setDragId(null);
  }

  function resetDemo() {
    if (!window.confirm('Replace everything in this browser with the fictional demo portfolio?')) return;
    const nextAccounts = cloneSeedAccounts();
    const nextActivities = buildSeedActivities();
    setAccounts(nextAccounts);
    setActivities(nextActivities);
    setCategories([...defaultCategories]);
    setSelected([]);
    setFilter('all');
    setColumns(3);
    setReportRange('month');
    setReportCategory('all');
    setModal(null);
  }

  function clearSaved() {
    if (!window.confirm('Remove all accounts and activities stored in this browser?')) return;
    setAccounts([]);
    setActivities([]);
    setSelected([]);
    setFilter('all');
    setModal(null);
  }

  const reportActivities = useMemo(() => {
    const now = Date.now();
    const days = reportRange === 'day' ? 1 : reportRange === 'week' ? 7 : reportRange === 'month' ? 30 : 36500;
    const allowed = selected.length ? new Set(selected) : null;
    return activities.filter((activity) => {
      const within = now - new Date(activity.createdAt).getTime() <= days * 86400000;
      const categoryOk = reportCategory === 'all' || activity.category === reportCategory;
      const accountOk = !allowed || allowed.has(activity.accountId);
      return within && categoryOk && accountOk;
    });
  }, [activities, reportRange, reportCategory, selected]);

  const spendTotal = Math.abs(
    reportActivities.filter((activity) => activity.delta < 0).reduce((sum, activity) => sum + activity.delta, 0)
  );

  if (!ready) {
    return (
      <main className="app-shell loading-shell">
        <p className="eyebrow">Transformaiton.com</p>
        <h1>Finance & Assets Dashboard</h1>
        <p className="muted">Loading the fictional demo portfolio…</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow"><a href="https://transformaiton.com/">Transformaiton.com</a></p>
          <h1>Finance & Assets Dashboard</h1>
          <p>One view for cash, debt, investments, and the activity you record yourself.</p>
        </div>
        <div className="top-actions">
          <button type="button" className="ghost" onClick={clearSaved}>Clear saved data</button>
          <button type="button" className="ghost" onClick={resetDemo}>Reset demo data</button>
          <button type="button" className="primary" onClick={() => openAccount()}>+ Add account</button>
        </div>
      </header>

      <p className="demo-banner" role="note">
        <strong>Fictional demo.</strong> Account names, balances, and activities in this copy are invented. They stay in this browser and are not sent to Transformaiton.com.
      </p>

      <section className="stats-grid" aria-label="Portfolio totals">
        <Stat title="Net worth" value={money(net)} accent="net" />
        <Stat title="Assets" value={money(assets)} accent="asset" />
        <Stat title="Debt" value={money(-debt)} accent="debt" />
        <Stat title="Filtered total" value={money(filteredTotal)} accent="focus" />
      </section>

      <section className="panel overview-panel">
        <div className="donut-wrap">
          <div className="donut" style={{ background: donut.background }} role="img" aria-label="Portfolio mix">
            <div className="donut-hole"><strong>{money(net)}</strong><span>net</span></div>
          </div>
        </div>
        <div className="legend">
          <h2>Portfolio mix</h2>
          {donut.entries.map(([key, value], index) => (
            <div className="legend-row" key={key}>
              <span className="dot" style={{ background: donut.palette[index % donut.palette.length] }}></span>
              <span>{key === 'debt' ? 'Debt' : (typeLabel[key] || key)}</span>
              <strong>{money(key === 'debt' ? -value : value)}</strong>
            </div>
          ))}
          {!donut.entries.length && <p className="muted">Add an account to see the mix.</p>}
        </div>
      </section>

      <section className="toolbar panel">
        <div className="filters" role="toolbar" aria-label="Filter by account type">
          {['all', 'bank', 'credit', 'crypto', 'cash', 'investment', 'gift', 'metal', 'other'].map((key) => (
            <button
              type="button"
              key={key}
              className={filter === key ? 'chip active' : 'chip'}
              onClick={() => setFilter(key)}
            >
              {key === 'all' ? 'All' : typeLabel[key]}
            </button>
          ))}
        </div>
        <label className="density">
          Tiles per row
          <input
            type="range"
            min="1"
            max="6"
            value={columns}
            aria-valuemin={1}
            aria-valuemax={6}
            aria-valuenow={columns}
            onChange={(event) => setColumns(Number(event.target.value))}
          />
          <strong>{columns}</strong>
        </label>
      </section>

      <section className="accounts-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {filtered.map((account) => {
          const monthlyInterest = Math.max(account.balance, 0) * (toNumber(account.apy) / 100) / 12;
          return (
            <article
              key={account.id}
              className={`account-card ${selected.includes(account.id) ? 'selected' : ''}`}
              draggable
              onDragStart={() => setDragId(account.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(account.id)}
            >
              <div className="card-head">
                <label className="select-box">
                  <input
                    type="checkbox"
                    checked={selected.includes(account.id)}
                    onChange={() => toggleSelect(account.id)}
                    aria-label={`Select ${account.name}`}
                  />
                  <span></span>
                </label>
                <span className="type-pill">{typeLabel[account.type] || account.type}</span>
                <button type="button" className="icon-btn" onClick={() => removeAccount(account.id)} aria-label={`Delete ${account.name}`}>×</button>
              </div>
              <h3>{account.name}</h3>
              <div className={account.balance < 0 ? 'balance negative' : 'balance positive'}>{money(account.balance)}</div>
              {toNumber(account.apy) > 0 && (
                <div className="apy">{account.apy}% APY · est. {money(monthlyInterest)}/mo</div>
              )}
              <div className="card-actions">
                <button type="button" onClick={() => addActivity(account)}>+ Activity</button>
                <button type="button" onClick={() => setModal({ kind: 'history', account })}>History</button>
                <button type="button" onClick={() => openAccount(account)}>Edit</button>
              </div>
              {toNumber(account.apy) > 0 && (
                <button type="button" className="interest-btn" onClick={() => addInterest(account)}>Add estimated monthly interest</button>
              )}
            </article>
          );
        })}
        {!filtered.length && (
          <p className="empty-accounts">No accounts in this view. Add an account, choose another filter, or reset the demo portfolio.</p>
        )}
      </section>

      <section className="panel report-panel">
        <div className="report-head">
          <div>
            <h2>Spending report</h2>
            <p>Money out from the activities you recorded, for every account or only the ones you select.</p>
          </div>
          <div className="report-total"><span>Spent</span><strong>{money(spendTotal)}</strong></div>
        </div>
        <div className="report-controls">
          <label className="select-label">
            <span>Period</span>
            <select value={reportRange} onChange={(event) => setReportRange(event.target.value)}>
              <option value="day">Last day</option>
              <option value="week">Last week</option>
              <option value="month">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </label>
          <label className="select-label">
            <span>Category</span>
            <select value={reportCategory} onChange={(event) => setReportCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => setModal({ kind: 'categories' })}>Manage categories</button>
        </div>
        <div className="report-list">
          {reportActivities.slice(0, 12).map((activity) => (
            <div className="activity-row" key={activity.id}>
              <div>
                <strong>{activity.accountName}</strong>
                <span>{activity.category}{activity.note ? ` · ${activity.note}` : ''}</span>
              </div>
              <b className={activity.delta < 0 ? 'negative' : 'positive'}>{money(activity.delta)}</b>
            </div>
          ))}
          {!reportActivities.length && <p className="muted">No matching activities yet.</p>}
        </div>
      </section>

      <footer className="site-footer">
        <p><strong>Finance & Assets Dashboard</strong> by <a href="https://transformaiton.com/">Transformaiton.com</a></p>
        <p>
          <a href="mailto:info@transformaiton.com">info@transformaiton.com</a>
          {' · '}
          <a href="https://github.com/Transformaiton">GitHub</a>
          {' · '}
          333 S. Beaudry St, Los Angeles, CA
        </p>
      </footer>

      {modal && (
        <Modal
          modal={modal}
          setModal={setModal}
          saveAccount={saveAccount}
          saveActivity={saveActivity}
          categories={categories}
          setCategories={setCategories}
          activities={activities}
        />
      )}
    </main>
  );
}

function Stat({ title, value, accent }) {
  return <div className={`stat ${accent}`}><span>{title}</span><strong>{value}</strong></div>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Modal({ modal, setModal, saveAccount, saveActivity, categories, setCategories, activities }) {
  const [form, setForm] = useState(modal.kind === 'account' ? { ...modal.account } : modal.kind === 'activity' ? { ...modal } : {});
  const [newCategory, setNewCategory] = useState('');
  const history = modal.kind === 'history' ? activities.filter((activity) => activity.accountId === modal.account.id) : [];

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button type="button" className="close" onClick={() => setModal(null)} aria-label="Close">×</button>
        {modal.kind === 'account' && (
          <>
            <h2 id="modal-title">{form.id ? 'Edit account' : 'Add account'}</h2>
            <Field label="Account name">
              <div className="input-clear">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                <button type="button" onClick={() => setForm({ ...form, name: '' })} aria-label="Clear account name">×</button>
              </div>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {Object.keys(typeLabel).map((key) => <option value={key} key={key}>{typeLabel[key]}</option>)}
              </select>
            </Field>
            <Field label="Current balance (enter credit card debt as a negative number)">
              <div className="input-clear">
                <input type="number" step="0.01" value={form.balance} onChange={(event) => setForm({ ...form, balance: event.target.value })} />
                <button type="button" onClick={() => setForm({ ...form, balance: '' })} aria-label="Clear balance">×</button>
              </div>
            </Field>
            <Field label="APY / annual yield % (optional)">
              <input type="number" step="0.01" value={form.apy} onChange={(event) => setForm({ ...form, apy: event.target.value })} />
            </Field>
            <button type="button" className="primary wide" onClick={() => saveAccount(form)}>Save account</button>
          </>
        )}
        {modal.kind === 'activity' && (
          <>
            <h2 id="modal-title">Add activity</h2>
            <p className="muted">{modal.account.name}</p>
            <div className="sign-toggle" role="group" aria-label="Income or expense">
              <button type="button" className={form.sign === 1 ? 'active' : ''} onClick={() => setForm({ ...form, sign: 1 })}>Income +</button>
              <button type="button" className={form.sign === -1 ? 'active minus' : ''} onClick={() => setForm({ ...form, sign: -1 })}>Expense −</button>
            </div>
            <Field label="Amount">
              <input type="number" step="0.01" autoFocus value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Note (optional)">
              <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </Field>
            <button type="button" className="primary wide" onClick={() => saveActivity(form)}>Save activity</button>
          </>
        )}
        {modal.kind === 'history' && (
          <>
            <h2 id="modal-title">{modal.account.name} history</h2>
            <div className="history-list">
              {history.map((activity) => (
                <div className="activity-row" key={activity.id}>
                  <div>
                    <strong>{new Date(activity.createdAt).toLocaleString('en-US')}</strong>
                    <span>{activity.category}{activity.note ? ` · ${activity.note}` : ''}</span>
                  </div>
                  <b className={activity.delta < 0 ? 'negative' : 'positive'}>{money(activity.delta)}</b>
                </div>
              ))}
              {!history.length && <p className="muted">No activity recorded for this account yet.</p>}
            </div>
          </>
        )}
        {modal.kind === 'categories' && (
          <>
            <h2 id="modal-title">Categories</h2>
            <div className="category-list">
              {categories.map((category) => (
                <div key={category}>
                  <span>{category}</span>
                  <button type="button" onClick={() => setCategories(categories.filter((item) => item !== category))} aria-label={`Remove ${category}`}>×</button>
                </div>
              ))}
            </div>
            <div className="category-add">
              <input
                placeholder="New category"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                aria-label="New category"
              />
              <button
                type="button"
                className="primary"
                onClick={() => {
                  const value = newCategory.trim();
                  if (value && !categories.includes(value)) {
                    setCategories([...categories, value]);
                    setNewCategory('');
                  }
                }}
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
