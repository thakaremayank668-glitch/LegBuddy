import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LegalDisclaimerBanner } from './components/LegalDisclaimerBanner';
import { HomeHero } from './components/HomeHero';
import { NyayaChat } from './components/NyayaChat';
import { BusinessSetupAssistant } from './components/BusinessSetupAssistant';
import { DocumentAssistant } from './components/DocumentAssistant';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { AdminKnowledgeBase } from './components/AdminKnowledgeBase';
import { Footer } from './components/Footer';
import { ComplianceTask, LicenceItem, LanguageCode } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'business' | 'document' | 'dashboard' | 'admin'>('home');
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Dashboard state
  const [tasks, setTasks] = useState<ComplianceTask[]>([
    {
      id: 'task-1',
      title: 'GSTR-3B Monthly Return Filing',
      category: 'tax',
      dueDate: '2025-03-20',
      status: 'pending',
      priority: 'high',
      portalUrl: 'https://www.gst.gov.in',
      formName: 'Form GSTR-3B',
      authority: 'CBIC / GST Council',
      penaltyRisk: 'Late fee of Rs 50/day (Rs 20 for Nil return) + 18% p.a. interest on delayed tax.'
    },
    {
      id: 'task-2',
      title: 'TDS Payment Deposit (Challan ITNS 281)',
      category: 'tax',
      dueDate: '2025-03-07',
      status: 'pending',
      priority: 'high',
      portalUrl: 'https://www.incometax.gov.in',
      formName: 'ITNS 281',
      authority: 'Income Tax Department',
      penaltyRisk: '1.5% interest per month from the date of tax deduction under Section 201(1A).'
    },
    {
      id: 'task-3',
      title: 'Annual DGFT IEC Electronic Re-validation',
      category: 'registration',
      dueDate: '2025-06-30',
      status: 'pending',
      priority: 'medium',
      portalUrl: 'https://www.dgft.gov.in',
      formName: 'Online IEC Update',
      authority: 'Directorate General of Foreign Trade',
      penaltyRisk: 'Automatic deactivation of Import Export Code by DGFT portal under Para 2.05 of FTP 2023.'
    },
    {
      id: 'task-4',
      title: 'Professional Tax Half-Yearly Return',
      category: 'statutory',
      dueDate: '2025-03-31',
      status: 'completed',
      priority: 'low',
      portalUrl: 'https://labour.gov.in',
      formName: 'Form V / State PT',
      authority: 'State Commercial Tax Department',
      penaltyRisk: 'Interest of 1.25% per month and penalty up to 10% of tax.'
    }
  ]);

  const [licences, setLicences] = useState<LicenceItem[]>([
    {
      id: 'lic-1',
      name: 'FSSAI State Food Safety Licence',
      licenceNumber: '11524036000189',
      authority: 'Food Safety & Standards Authority of India (FSSAI)',
      issueDate: '2024-04-10',
      expiryDate: '2025-04-09',
      daysRemaining: 28,
      status: 'renewal_due',
      portalUrl: 'https://foscos.fssai.gov.in',
      renewalFee: 'Rs 2,000 / year'
    },
    {
      id: 'lic-2',
      name: 'Shop & Commercial Establishment Registration (Gumasta)',
      licenceNumber: 'SEA-MUM-2023-8821',
      authority: 'Municipal Corporation / State Labour Dept',
      issueDate: '2023-08-15',
      expiryDate: '2026-08-14',
      daysRemaining: 518,
      status: 'active',
      portalUrl: 'https://labour.gov.in',
      renewalFee: 'Rs 1,500'
    },
    {
      id: 'lic-3',
      name: 'Registered Trademark (Class 35 - Retail & Advertising)',
      licenceNumber: 'TM-5418902',
      authority: 'Trade Marks Registry (IP India)',
      issueDate: '2022-11-20',
      expiryDate: '2032-11-19',
      daysRemaining: 2800,
      status: 'active',
      portalUrl: 'https://ipindia.gov.in',
      renewalFee: 'Rs 4,500 (MSME discount)'
    }
  ]);

  // Sync with backend dashboard data on mount
  useEffect(() => {
    fetch('/api/dashboard/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.tasks?.length > 0) setTasks(data.tasks);
          if (data.licences?.length > 0) setLicences(data.licences);
        }
      })
      .catch((err) => console.warn('Using initial dashboard state:', err));
  }, []);

  const handleAddTask = (task: { title: string; category: any; dueDate: string; authority: string; penaltyRisk?: string }) => {
    const newTask: ComplianceTask = {
      id: `task-${Date.now()}`,
      title: task.title,
      category: task.category || 'statutory',
      dueDate: task.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      priority: 'high',
      authority: task.authority || 'Government Authority',
      penaltyRisk: task.penaltyRisk || 'Statutory fines may apply for delayed filing.',
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAddTasksToDashboard = (newTasks: ComplianceTask[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const handleAddLicencesToDashboard = (newLicences: LicenceItem[]) => {
    setLicences((prev) => [...newLicences, ...prev]);
  };

  const handleQuickInquiry = (query: string) => {
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-900 antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Top Statutory Disclaimer Banner */}
      <LegalDisclaimerBanner language={language} />

      {/* Main Header / Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeHero
            language={language}
            setActiveTab={setActiveTab}
            onQuickInquiry={handleQuickInquiry}
          />
        )}

        {activeTab === 'chat' && (
          <NyayaChat
            language={language}
            onNavigateToBusinessSetup={() => setActiveTab('business')}
            onAddTaskToDashboard={handleAddTask}
          />
        )}

        {activeTab === 'business' && (
          <BusinessSetupAssistant
            language={language}
            onAddTasksToDashboard={handleAddTasksToDashboard}
            onAddLicencesToDashboard={handleAddLicencesToDashboard}
          />
        )}

        {activeTab === 'document' && (
          <DocumentAssistant
            language={language}
            onAddTaskToDashboard={handleAddTask}
          />
        )}

        {activeTab === 'dashboard' && (
          <ComplianceDashboard
            language={language}
            tasks={tasks}
            setTasks={setTasks}
            licences={licences}
            setLicences={setLicences}
            onNavigateToChat={() => setActiveTab('chat')}
            onNavigateToBusiness={() => setActiveTab('business')}
          />
        )}

        {activeTab === 'admin' && <AdminKnowledgeBase language={language} />}
      </main>

      {/* Global Footer */}
      <Footer language={language} setActiveTab={setActiveTab} />
    </div>
  );
}
