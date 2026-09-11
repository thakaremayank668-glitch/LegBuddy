import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  Filter,
  CheckSquare,
  Award,
  ArrowUpRight,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ComplianceTask, LicenceItem, LanguageCode } from '../types';

interface DashboardProps {
  language: LanguageCode;
  tasks: ComplianceTask[];
  setTasks: React.Dispatch<React.SetStateAction<ComplianceTask[]>>;
  licences: LicenceItem[];
  setLicences: React.Dispatch<React.SetStateAction<LicenceItem[]>>;
  onNavigateToChat: () => void;
  onNavigateToBusiness: () => void;
}

export const ComplianceDashboard: React.FC<DashboardProps> = ({
  language,
  tasks,
  setTasks,
  licences,
  setLicences,
  onNavigateToChat,
  onNavigateToBusiness,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddLicenceModal, setShowAddLicenceModal] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'tax' | 'registration' | 'licence' | 'statutory' | 'labour'>('tax');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAuthority, setNewTaskAuthority] = useState('CBIC / Income Tax');
  const [newTaskPenalty, setNewTaskPenalty] = useState('');

  // New licence form state
  const [newLicName, setNewLicName] = useState('');
  const [newLicNumber, setNewLicNumber] = useState('');
  const [newLicAuthority, setNewLicAuthority] = useState('');
  const [newLicExpiry, setNewLicExpiry] = useState('');
  const [newLicPortal, setNewLicPortal] = useState('https://www.india.gov.in');

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDueDate) return;

    const task: ComplianceTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      category: newTaskCategory,
      dueDate: newTaskDueDate,
      status: 'pending',
      priority: 'high',
      authority: newTaskAuthority,
      penaltyRisk: newTaskPenalty || 'Statutory delay fee applies.',
    };

    setTasks([task, ...tasks]);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskPenalty('');
  };

  const handleCreateLicence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicName || !newLicExpiry || !newLicAuthority) return;

    const expiryTime = new Date(newLicExpiry).getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)));

    const lic: LicenceItem = {
      id: `lic-${Date.now()}`,
      name: newLicName,
      licenceNumber: newLicNumber || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      authority: newLicAuthority,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: newLicExpiry,
      daysRemaining,
      status: daysRemaining <= 30 ? 'renewal_due' : 'active',
      portalUrl: newLicPortal,
    };

    setLicences([lic, ...licences]);
    setShowAddLicenceModal(false);
    setNewLicName('');
    setNewLicNumber('');
    setNewLicAuthority('');
    setNewLicExpiry('');
  };

  const filteredTasks = tasks.filter((t) => (filterCategory === 'all' ? true : t.category === filterCategory));

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const renewalDueCount = licences.filter((l) => l.status === 'renewal_due').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Indian Statutory Compliance & Licence Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'hi'
                ? 'अनुपालन एवं लाइसेंस डैशबोर्ड'
                : language === 'gu'
                ? 'કમ્પ્લાયન્સ અને લાયસન્સ ડેશબોર્ડ'
                : 'Compliance Deadlines & Licences Hub'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Never miss a GSTR-3B return, Advance Tax installment, annual ROC filing, or municipal licence renewal.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task</span>
            </button>
            <button
              onClick={() => setShowAddLicenceModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Track New Licence</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block font-medium">Pending Statutory Filings</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">{pendingCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block font-medium">Completed Compliances</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{completedCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block font-medium">Active Licences / Permits</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{licences.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400 block font-medium">Renewals Due (&lt;30 Days)</span>
            <span className="text-xl font-extrabold text-red-400 mt-1 block">{renewalDueCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tasks, Right Licences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Statutory Filings & Deadlines */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upcoming Statutory Filings & Deadlines</h2>
              <p className="text-xs text-slate-500">Official Indian regulatory deadlines & penalty warnings</p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {['all', 'tax', 'registration', 'statutory'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-1 rounded-md capitalize transition-colors ${
                    filterCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No tasks found in this category.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'border-slate-200 bg-slate-50/60 opacity-70'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 hover:border-slate-500 text-transparent'
                          }`}
                          title={isCompleted ? 'Mark pending' : 'Mark completed'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <h3
                            className={`text-xs font-bold ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">{task.authority}</span>
                            {task.formName && <span>• Form: {task.formName}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          Due: {task.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Penalty warning */}
                    {!isCompleted && task.penaltyRisk && (
                      <div className="mt-2.5 p-2 rounded-lg bg-red-50/70 border border-red-200/60 text-[11px] text-red-900 flex items-start space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>Penalty for Delay: {task.penaltyRisk}</span>
                      </div>
                    )}

                    {task.portalUrl && !isCompleted && (
                      <div className="mt-2 text-right">
                        <a
                          href={task.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-700 hover:text-amber-600"
                        >
                          <span>File on Portal</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Columns: Tracked Government Licences */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tracked Government Licences</h2>
              <p className="text-xs text-slate-500">Validity periods and renewal countdowns</p>
            </div>
            <button
              onClick={() => setShowAddLicenceModal(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {licences.map((lic) => {
              const isRenewalDue = lic.status === 'renewal_due';
              return (
                <div
                  key={lic.id}
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    isRenewalDue
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{lic.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">No: {lic.licenceNumber}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isRenewalDue
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {lic.daysRemaining} Days Left
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400">Authority:</span>
                      <p className="font-medium text-slate-800 line-clamp-1">{lic.authority}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Expires On:</span>
                      <p className="font-semibold text-slate-900">{lic.expiryDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">
                      {lic.renewalFee ? `Fee: ${lic.renewalFee}` : 'Statutory fee'}
                    </span>
                    <a
                      href={lic.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 hover:text-amber-900"
                    >
                      <span>Renew Online</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs mt-4">
            <h4 className="font-bold text-amber-400 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Need help filing any compliance?</span>
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Ask Nyaya AI for step-by-step guidance on filing GSTR-3B, TDS, or Form AOC-4 without penalties.
            </p>
            <button
              onClick={onNavigateToChat}
              className="w-full py-2 bg-white text-slate-900 font-bold rounded-lg text-xs hover:bg-slate-100 mt-1 cursor-pointer"
            >
              Ask Nyaya AI Now →
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Statutory Compliance Task</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title / Return Name:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Advance Tax 4th Installment"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="tax">Tax</option>
                    <option value="registration">Registration</option>
                    <option value="licence">Licence</option>
                    <option value="statutory">Statutory</option>
                    <option value="labour">Labour</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date:</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authority / Ministry:</label>
                <input
                  type="text"
                  value={newTaskAuthority}
                  onChange={(e) => setNewTaskAuthority(e.target.value)}
                  placeholder="e.g. Income Tax Dept, MCA, GSTN"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Penalty Warning (Optional):</label>
                <input
                  type="text"
                  value={newTaskPenalty}
                  onChange={(e) => setNewTaskPenalty(e.target.value)}
                  placeholder="e.g. 1% interest per month under Sec 234C"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Licence Modal */}
      {showAddLicenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Track Government Licence / Permit</h3>
              <button
                onClick={() => setShowAddLicenceModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLicence} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Licence Name:</label>
                <input
                  type="text"
                  required
                  value={newLicName}
                  onChange={(e) => setNewLicName(e.target.value)}
                  placeholder="e.g. FSSAI Central Licence, Trade Licence"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Licence Number:</label>
                  <input
                    type="text"
                    value={newLicNumber}
                    onChange={(e) => setNewLicNumber(e.target.value)}
                    placeholder="e.g. 11524036000189"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date:</label>
                  <input
                    type="date"
                    required
                    value={newLicExpiry}
                    onChange={(e) => setNewLicExpiry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuing Authority:</label>
                <input
                  type="text"
                  required
                  value={newLicAuthority}
                  onChange={(e) => setNewLicAuthority(e.target.value)}
                  placeholder="e.g. Food Safety and Standards Authority of India"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Portal URL for Renewal:</label>
                <input
                  type="url"
                  value={newLicPortal}
                  onChange={(e) => setNewLicPortal(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddLicenceModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Save Licence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
