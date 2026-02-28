import { useState, useMemo, useCallback } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, Wallet,
  Target, BarChart3, Plus, Search, Filter, X, ArrowUpRight, ArrowDownRight,
  Banknote, CreditCard, PiggyBank, Building, Landmark, ChevronDown,
  ChevronUp, Edit3, Trash2, Receipt, CircleDollarSign
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';
import TabBar from '../components/TabBar';
import ProgressRing from '../components/ProgressRing';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import AnimatedNumber from '../components/AnimatedNumber';
import Sparkline from '../components/Sparkline';
import useLocalStorage from '../hooks/useLocalStorage';
import { NAMESPACES, EXPENSE_CATEGORIES } from '../utils/constants';
import { getDateKey, getMonthKey, formatDate, formatDateShort } from '../utils/dateHelpers';

const ACCENT = '#22c55e';

const CATEGORY_COLORS = {
  Rent: '#ef4444',
  Utilities: '#f97316',
  Food: '#eab308',
  Transport: '#22c55e',
  'Music Gear': '#ec4899',
  'Going Out': '#a855f7',
  Subscriptions: '#6366f1',
  Savings: '#14b8a6',
  Investment: '#3b82f6',
  Other: '#64748b',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: PieChartIcon },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'savings', label: 'Savings', icon: PiggyBank },
  { id: 'networth', label: 'Net Worth', icon: Landmark },
];

function getDefaultFinanceData() {
  return {
    income: {},
    expenses: [],
    savingsGoals: [
      { id: 'emergency', name: 'Emergency Fund', target: 11520, current: 0, color: '#ef4444', icon: 'shield' },
      { id: 'saas', name: 'SaaS Side Project Fund', target: 3000, current: 0, color: '#6366f1', icon: 'code' },
      { id: 'music', name: 'Music Investment Fund', target: 2000, current: 0, color: '#ec4899', icon: 'music' },
      { id: 'skill', name: 'Skill Development Fund', target: 1500, current: 0, color: '#f59e0b', icon: 'book' },
    ],
    netWorthHistory: [],
    assets: {},
    debts: {},
  };
}

function ChartTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-sm px-3 py-2 text-xs">
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#fff' }} className="font-medium">
          {entry.name}: {entry.value.toLocaleString()} €
        </p>
      ))}
    </div>
  );
}

function PieTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-sm px-3 py-2 text-xs">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].value.toLocaleString()} €</p>
    </div>
  );
}

function OverviewTab({ financeData, setFinanceData, currentMonth }) {
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');

  const monthlyIncome = financeData.income[currentMonth] || 0;

  const handleSetIncome = (e) => {
    e.preventDefault();
    const amount = parseFloat(incomeInput);
    if (isNaN(amount) || amount < 0) return;
    setFinanceData(prev => ({
      ...prev,
      income: { ...prev.income, [currentMonth]: amount }
    }));
    setShowIncomeInput(false);
    setIncomeInput('');
  };

  const monthlyExpenses = useMemo(() => {
    return (financeData.expenses || [])
      .filter((e) => e.month === currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financeData.expenses, currentMonth]);

  const net = monthlyIncome - monthlyExpenses;

  const expensesByCategory = useMemo(() => {
    const map = {};
    (financeData.expenses || [])
      .filter((e) => e.month === currentMonth)
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        fill: CATEGORY_COLORS[name] || '#64748b',
      }))
      .sort((a, b) => b.value - a.value);
  }, [financeData.expenses, currentMonth]);

  const needsCategories = ['Rent', 'Utilities', 'Food', 'Transport'];
  const wantsCategories = ['Music Gear', 'Going Out', 'Subscriptions', 'Other'];
  const savingsCategories = ['Savings', 'Investment'];

  const needsActual = useMemo(() => {
    return (financeData.expenses || [])
      .filter((e) => e.month === currentMonth && needsCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financeData.expenses, currentMonth]);

  const wantsActual = useMemo(() => {
    return (financeData.expenses || [])
      .filter((e) => e.month === currentMonth && wantsCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financeData.expenses, currentMonth]);

  const savingsActual = useMemo(() => {
    return (financeData.expenses || [])
      .filter((e) => e.month === currentMonth && savingsCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financeData.expenses, currentMonth]);

  const needsBudget = monthlyIncome > 0 ? monthlyIncome * 0.5 : 0;
  const wantsBudget = monthlyIncome > 0 ? monthlyIncome * 0.3 : 0;
  const savingsBudget = monthlyIncome > 0 ? monthlyIncome * 0.2 : 0;

  const donutData = [
    { name: 'Expenses', value: monthlyExpenses, fill: '#ef4444' },
    { name: 'Remaining', value: Math.max(0, monthlyIncome - monthlyExpenses), fill: '#22c55e' },
  ];

  return (
    <div className="space-y-4">
      {/* Monthly Income */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2">
            <Banknote size={18} style={{ color: ACCENT }} />
            Monthly Income
          </h3>
          {!showIncomeInput ? (
            <button onClick={() => setShowIncomeInput(true)} className="text-xs" style={{ color: ACCENT }}>
              {monthlyIncome > 0 ? 'Edit' : 'Set Income'}
            </button>
          ) : null}
        </div>
        {showIncomeInput ? (
          <form onSubmit={handleSetIncome} className="flex gap-2 mt-3">
            <input type="number" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} className="glass-input text-sm flex-1" placeholder="Monthly income in \u20ac" min="0" step="0.01" />
            <button type="submit" className="btn-primary text-sm px-4">Save</button>
          </form>
        ) : monthlyIncome > 0 ? (
          <p className="text-2xl font-heading font-bold text-white mt-2">{monthlyIncome.toLocaleString()} \u20ac</p>
        ) : (
          <p className="text-sm text-white/40 mt-2">Set your monthly income to track budget</p>
        )}
      </GlassCard>

      {/* Overspending Alert */}
      {monthlyIncome > 0 && monthlyExpenses > monthlyIncome && (
        <GlassCard className="border border-red-500/30" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <div className="flex items-center gap-3">
            <TrendingDown size={20} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Overspending Alert</p>
              <p className="text-xs text-red-300/70 mt-0.5">
                You've spent {(monthlyExpenses - monthlyIncome).toLocaleString()} \u20ac more than your income this month.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-3 gap-3">
        <GlassCard padding="p-4" className="text-center">
          <ArrowUpRight size={18} className="text-green-400 mx-auto mb-2" />
          <div className="text-lg font-heading font-bold text-green-400">
            <AnimatedNumber value={monthlyIncome} suffix=" \u20ac" />
          </div>
          <p className="text-xs text-white/40 mt-1">Income</p>
        </GlassCard>
        <GlassCard padding="p-4" className="text-center">
          <ArrowDownRight size={18} className="text-red-400 mx-auto mb-2" />
          <div className="text-lg font-heading font-bold text-red-400">
            <AnimatedNumber value={monthlyExpenses} suffix=" \u20ac" />
          </div>
          <p className="text-xs text-white/40 mt-1">Expenses</p>
        </GlassCard>
        <GlassCard padding="p-4" className="text-center">
          <Banknote size={18} className={`${net >= 0 ? 'text-green-400' : 'text-red-400'} mx-auto mb-2`} />
          <div className={`text-lg font-heading font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <AnimatedNumber value={Math.abs(net)} prefix={net >= 0 ? '+' : '-'} suffix=" \u20ac" />
          </div>
          <p className="text-xs text-white/40 mt-1">Net</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Monthly Budget</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0 0 4px ${entry.fill}40)` }} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-bold text-white">
                {monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0}%
              </span>
              <span className="text-[10px] text-white/40">spent</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          {donutData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill }} />
              <span className="text-xs text-white/50">{entry.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-1">50/30/20 Rule Tracker</h3>
        <p className="text-xs text-white/40 mb-4">Budget allocation based on your income</p>

        {monthlyIncome === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">Set your monthly income above to see budget allocation</p>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Needs</span>
                  <Badge color="#ef4444" size="sm">50%</Badge>
                </div>
                <span className="text-xs text-white/50">
                  {needsActual.toLocaleString()} / {needsBudget.toLocaleString()} \u20ac
                </span>
              </div>
              <ProgressBar
                value={needsActual}
                max={needsBudget || 1}
                color={needsBudget > 0 && needsActual > needsBudget ? '#ef4444' : '#22c55e'}
                height={8}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {needsCategories.map((c) => (
                  <span key={c} className="text-[10px] text-white/30">{c}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Wants</span>
                  <Badge color="#f59e0b" size="sm">30%</Badge>
                </div>
                <span className="text-xs text-white/50">
                  {wantsActual.toLocaleString()} / {wantsBudget.toLocaleString()} \u20ac
                </span>
              </div>
              <ProgressBar
                value={wantsActual}
                max={wantsBudget || 1}
                color={wantsBudget > 0 && wantsActual > wantsBudget ? '#ef4444' : '#f59e0b'}
                height={8}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {wantsCategories.map((c) => (
                  <span key={c} className="text-[10px] text-white/30">{c}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Savings</span>
                  <Badge color="#22c55e" size="sm">20%</Badge>
                </div>
                <span className="text-xs text-white/50">
                  {savingsActual.toLocaleString()} / {savingsBudget.toLocaleString()} \u20ac
                </span>
              </div>
              <ProgressBar
                value={savingsActual}
                max={savingsBudget || 1}
                color={savingsBudget > 0 && savingsActual >= savingsBudget ? '#22c55e' : '#6366f1'}
                height={8}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {savingsCategories.map((c) => (
                  <span key={c} className="text-[10px] text-white/30">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {expensesByCategory.length > 0 && (
        <GlassCard>
          <h3 className="font-heading font-semibold text-white mb-4">Spending by Category</h3>
          <div className="space-y-2.5">
            {expensesByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
                <span className="text-sm text-white/70 flex-1">{cat.name}</span>
                <span className="text-sm text-white font-medium">{cat.value.toLocaleString()} \u20ac</span>
                <span className="text-xs text-white/30 w-10 text-right">
                  {monthlyExpenses > 0 ? Math.round((cat.value / monthlyExpenses) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function ExpensesTab({ financeData, setFinanceData, currentMonth }) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    note: '',
    date: getDateKey(),
  });

  const monthlyExpenses = useMemo(() => {
    return (financeData.expenses || [])
      .filter((e) => e.month === currentMonth)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [financeData.expenses, currentMonth]);

  const prevMonthDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 15);
  }, []);
  const prevMonth = getMonthKey(prevMonthDate);

  const prevMonthTotal = useMemo(() => {
    return (financeData.expenses || [])
      .filter((e) => e.month === prevMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financeData.expenses, prevMonth]);

  const currentMonthTotal = useMemo(() => {
    return monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthlyExpenses]);

  const filteredExpenses = useMemo(() => {
    let list = monthlyExpenses;
    if (filterCategory !== 'All') {
      list = list.filter((e) => e.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.note.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.amount.toString().includes(q)
      );
    }
    return list;
  }, [monthlyExpenses, filterCategory, searchQuery]);

  const handleAddExpense = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    const expense = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      note: formData.note || formData.category,
      date: formData.date,
      month: formData.date.substring(0, 7),
    };
    setFinanceData((prev) => ({
      ...prev,
      expenses: [expense, ...(prev.expenses || [])],
    }));
    setFormData({ amount: '', category: 'Food', note: '', date: getDateKey() });
    setShowForm(false);
  };

  const handleDeleteExpense = (id) => {
    setFinanceData((prev) => ({
      ...prev,
      expenses: (prev.expenses || []).filter((e) => e.id !== id),
    }));
  };

  const monthDiff = currentMonthTotal - prevMonthTotal;
  const monthDiffPercent = prevMonthTotal > 0 ? Math.round((monthDiff / prevMonthTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-white">Monthly Comparison</h3>
          <Badge
            color={monthDiff <= 0 ? '#22c55e' : '#ef4444'}
            variant="outlined"
          >
            {monthDiff > 0 ? '+' : ''}{monthDiffPercent}%
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <p className="text-xs text-white/40 mb-1">This Month</p>
            <p className="text-lg font-heading font-bold text-white">
              {currentMonthTotal.toLocaleString()} €
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <p className="text-xs text-white/40 mb-1">Last Month</p>
            <p className="text-lg font-heading font-bold text-white/60">
              {prevMonthTotal.toLocaleString()} €
            </p>
          </div>
        </div>
      </GlassCard>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border border-dashed border-green-500/30 text-green-400 text-sm hover:bg-green-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Expense
        </button>
      ) : (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-white">Log Expense</h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/50">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Amount (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="glass-input w-full text-sm py-2.5 px-3"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="glass-input w-full text-sm py-2.5 px-3 appearance-none bg-transparent"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                className="glass-input w-full text-sm py-2.5 px-3"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Note</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                placeholder="What was this for?"
                className="glass-input w-full text-sm py-2.5 px-3"
              />
            </div>
            <button onClick={handleAddExpense} className="btn-primary w-full text-sm">
              Add Expense
            </button>
          </div>
        </GlassCard>
      )}

      <GlassCard padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="glass-input w-full text-sm py-2 pl-9 pr-3"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              filterCategory !== 'All' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <Filter size={16} />
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterCategory === 'All'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-white/40 bg-white/5 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? 'text-white border'
                    : 'text-white/40 bg-white/5 hover:bg-white/10'
                }`}
                style={
                  filterCategory === cat
                    ? { background: `${CATEGORY_COLORS[cat]}20`, borderColor: `${CATEGORY_COLORS[cat]}50`, color: CATEGORY_COLORS[cat] }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description={searchQuery || filterCategory !== 'All' ? 'Try adjusting your filters.' : 'Add your first expense to get started.'}
        />
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <GlassCard key={expense.id} padding="p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[expense.category] || '#64748b'}15` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: CATEGORY_COLORS[expense.category] || '#64748b' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{expense.note || expense.category}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/40">{expense.category}</span>
                    <span className="text-xs text-white/20">&middot;</span>
                    <span className="text-xs text-white/40">{formatDateShort(expense.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading font-bold text-white">
                    {expense.amount.toLocaleString()} €
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-white/10 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function SavingsTab({ financeData, setFinanceData, currentMonth }) {
  const [addFundsId, setAddFundsId] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  const savingsGoals = financeData.savingsGoals || [];

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0);

  const monthlyIncome = financeData.income[currentMonth] || 0;
  const monthlyExpenses = (financeData.expenses || [])
    .filter((e) => e.month === currentMonth && !['Savings', 'Investment'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlySaved = (financeData.expenses || [])
    .filter((e) => e.month === currentMonth && ['Savings', 'Investment'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySaved / monthlyIncome) * 100) : 0;

  const savingsRateHistory = [savingsRate];

  const handleAddFunds = (goalId) => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) return;

    setFinanceData((prev) => ({
      ...prev,
      savingsGoals: (prev.savingsGoals || []).map((g) =>
        g.id === goalId ? { ...g, current: Math.min(g.current + amount, g.target) } : g
      ),
    }));
    setAddAmount('');
    setAddFundsId(null);
  };

  const getGoalIcon = (iconName) => {
    switch (iconName) {
      case 'shield': return Target;
      case 'code': return CircleDollarSign;
      case 'music': return Banknote;
      case 'book': return Building;
      default: return PiggyBank;
    }
  };

  return (
    <div className="space-y-4">
      <GlassCard className="text-center">
        <h3 className="font-heading font-semibold text-white mb-4">Savings Rate</h3>
        <div className="flex justify-center mb-4">
          <ProgressRing
            value={savingsRate}
            size={140}
            strokeWidth={10}
            color={savingsRate >= 20 ? '#22c55e' : '#f59e0b'}
            label={`${savingsRate}%`}
            sublabel="of income"
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm text-white/50">This month:</span>
          <span className="text-sm font-medium text-white">{monthlySaved.toLocaleString()} € saved</span>
        </div>
        <div className="flex justify-center">
          <Sparkline data={savingsRateHistory} color={ACCENT} width={120} height={32} />
        </div>
        <p className="text-xs text-white/30 mt-2">6 month trend</p>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-heading font-semibold text-white">Total Saved</h3>
          <span className="text-lg font-heading font-bold text-green-400">
            <AnimatedNumber value={totalSaved} suffix=" €" />
          </span>
        </div>
        <ProgressBar value={totalSaved} max={totalTarget || 1} color={ACCENT} height={6} />
        <p className="text-xs text-white/40 mt-1.5">
          {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% of all goals ({totalTarget.toLocaleString()} €)
        </p>
      </GlassCard>

      <div className="space-y-3">
        {savingsGoals.map((goal) => {
          const percent = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
          const GoalIcon = getGoalIcon(goal.icon);
          const isAdding = addFundsId === goal.id;

          return (
            <GlassCard key={goal.id}>
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${goal.color}20` }}
                >
                  <GoalIcon size={18} style={{ color: goal.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white">{goal.name}</h4>
                    <ProgressRing
                      value={percent}
                      size={44}
                      strokeWidth={4}
                      color={goal.color}
                      label={`${percent}%`}
                      sublabel=""
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} €
                  </p>
                </div>
              </div>

              <ProgressBar value={goal.current} max={goal.target} color={goal.color} height={6} />

              {isAdding ? (
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Amount in €"
                    className="glass-input flex-1 text-sm py-2 px-3"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddFunds(goal.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-sm font-medium border border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddFundsId(null); setAddAmount(''); }}
                    className="p-2 text-white/30 hover:text-white/50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddFundsId(goal.id)}
                  className="mt-3 w-full py-2 rounded-xl bg-white/5 text-white/50 text-xs hover:bg-white/10 hover:text-white/70 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Funds
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function NetWorthTab({ financeData, setFinanceData }) {
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', amount: '' });

  const netWorthHistory = financeData.netWorthHistory || [];
  const assets = financeData.assets || {};
  const debts = financeData.debts || {};

  const totalAssets = Object.values(assets).reduce((sum, v) => sum + v, 0);
  const totalDebts = Object.values(debts).reduce((sum, v) => sum + v, 0);
  const netWorth = totalAssets - totalDebts;

  const latestNet = netWorthHistory.length > 0 ? netWorthHistory[netWorthHistory.length - 1].net : 0;
  const prevNet = netWorthHistory.length > 1 ? netWorthHistory[netWorthHistory.length - 2].net : 0;
  const netChange = latestNet - prevNet;
  const netChangePercent = prevNet > 0 ? Math.round((netChange / prevNet) * 100) : 0;

  const handleAddAsset = () => {
    if (!newEntry.name || !newEntry.amount) return;
    setFinanceData((prev) => ({
      ...prev,
      assets: { ...prev.assets, [newEntry.name]: parseFloat(newEntry.amount) },
    }));
    setNewEntry({ name: '', amount: '' });
    setShowAddAsset(false);
  };

  const handleAddDebt = () => {
    if (!newEntry.name || !newEntry.amount) return;
    setFinanceData((prev) => ({
      ...prev,
      debts: { ...prev.debts, [newEntry.name]: parseFloat(newEntry.amount) },
    }));
    setNewEntry({ name: '', amount: '' });
    setShowAddDebt(false);
  };

  const handleDeleteAsset = (name) => {
    setFinanceData((prev) => {
      const newAssets = { ...prev.assets };
      delete newAssets[name];
      return { ...prev, assets: newAssets };
    });
  };

  const handleDeleteDebt = (name) => {
    setFinanceData((prev) => {
      const newDebts = { ...prev.debts };
      delete newDebts[name];
      return { ...prev, debts: newDebts };
    });
  };

  return (
    <div className="space-y-4">
      <GlassCard className="text-center">
        <p className="text-xs text-white/40 mb-2">Net Worth</p>
        <div className={`text-3xl font-heading font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <AnimatedNumber value={netWorth} suffix=" €" />
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {netChange >= 0 ? (
            <TrendingUp size={14} className="text-green-400" />
          ) : (
            <TrendingDown size={14} className="text-red-400" />
          )}
          <span className={`text-xs font-medium ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netChange >= 0 ? '+' : ''}{netChange.toLocaleString()} € ({netChangePercent}%)
          </span>
          <span className="text-xs text-white/30">vs last month</span>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-heading font-semibold text-white mb-4">Net Worth Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={netWorthHistory}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="net"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#netWorthGrad)"
              name="Net Worth"
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard padding="p-4" className="text-center">
          <ArrowUpRight size={18} className="text-green-400 mx-auto mb-2" />
          <div className="text-lg font-heading font-bold text-green-400">
            <AnimatedNumber value={totalAssets} suffix=" €" />
          </div>
          <p className="text-xs text-white/40 mt-1">Total Assets</p>
        </GlassCard>
        <GlassCard padding="p-4" className="text-center">
          <ArrowDownRight size={18} className="text-red-400 mx-auto mb-2" />
          <div className="text-lg font-heading font-bold text-red-400">
            <AnimatedNumber value={totalDebts} suffix=" €" />
          </div>
          <p className="text-xs text-white/40 mt-1">Total Debts</p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white">Assets</h3>
          <button
            onClick={() => { setShowAddAsset(!showAddAsset); setShowAddDebt(false); }}
            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {showAddAsset && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <input
              type="text"
              value={newEntry.name}
              onChange={(e) => setNewEntry((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
              className="glass-input flex-1 text-sm py-2 px-3"
              autoFocus
            />
            <input
              type="number"
              value={newEntry.amount}
              onChange={(e) => setNewEntry((p) => ({ ...p, amount: e.target.value }))}
              placeholder="Amount"
              className="glass-input w-28 text-sm py-2 px-3"
            />
            <button
              onClick={handleAddAsset}
              className="px-3 py-2 rounded-xl bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30"
            >
              Save
            </button>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(assets).map(([name, value]) => (
            <div key={name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-white/70">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">{value.toLocaleString()} €</span>
                <button onClick={() => handleDeleteAsset(name)} className="text-white/10 hover:text-red-400 p-0.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-white">Debts</h3>
          <button
            onClick={() => { setShowAddDebt(!showAddDebt); setShowAddAsset(false); }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {showAddDebt && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <input
              type="text"
              value={newEntry.name}
              onChange={(e) => setNewEntry((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
              className="glass-input flex-1 text-sm py-2 px-3"
              autoFocus
            />
            <input
              type="number"
              value={newEntry.amount}
              onChange={(e) => setNewEntry((p) => ({ ...p, amount: e.target.value }))}
              placeholder="Amount"
              className="glass-input w-28 text-sm py-2 px-3"
            />
            <button
              onClick={handleAddDebt}
              className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30"
            >
              Save
            </button>
          </div>
        )}

        {Object.keys(debts).length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-white/40">No debts! Great job staying debt-free.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(debts).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm text-white/70">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{value.toLocaleString()} €</span>
                  <button onClick={() => handleDeleteDebt(name)} className="text-white/10 hover:text-red-400 p-0.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [financeData, setFinanceData] = useLocalStorage(
    NAMESPACES.finance,
    null,
    getDefaultFinanceData()
  );

  const currentMonth = getMonthKey();

  const monthlyIncome = financeData.income?.[currentMonth] || 0;
  const monthlyExpenseTotal = (financeData.expenses || [])
    .filter((e) => e.month === currentMonth)
    .reduce((sum, e) => sum + e.amount, 0);
  const net = monthlyIncome - monthlyExpenseTotal;

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Finance"
        subtitle={`Net this month: ${net >= 0 ? '+' : ''}${net.toLocaleString()} €`}
        rightElement={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Wallet size={20} style={{ color: ACCENT }} />
            </div>
          </div>
        }
      />

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <OverviewTab financeData={financeData} setFinanceData={setFinanceData} currentMonth={currentMonth} />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab financeData={financeData} setFinanceData={setFinanceData} currentMonth={currentMonth} />
      )}

      {activeTab === 'savings' && (
        <SavingsTab financeData={financeData} setFinanceData={setFinanceData} currentMonth={currentMonth} />
      )}

      {activeTab === 'networth' && (
        <NetWorthTab financeData={financeData} setFinanceData={setFinanceData} />
      )}
    </div>
  );
}
