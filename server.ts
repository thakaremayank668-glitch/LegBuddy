import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  generateNyayaChatResponse,
  generateBusinessSetupRoadmap,
  analyzeLegalDocument,
  knowledgeStore,
  retrieveRelevantSources
} from './server/ragEngine';
import { ComplianceTask, LicenceItem } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with 25MB limit for document uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Simple in-memory rate limiter for production safety
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

app.use((req: Request, res: Response, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const userRate = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > userRate.resetTime) {
    userRate.count = 1;
    userRate.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    userRate.count++;
  }
  rateLimitMap.set(ip, userRate);

  if (userRate.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute before making more requests.',
    });
  }
  next();
});

// Mock in-memory state for initial tasks and licences
let userTasks: ComplianceTask[] = [
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
];

let userLicences: LicenceItem[] = [
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
];

// ================= API ROUTES =================

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    knowledgeSourcesCount: knowledgeStore.length,
    version: '1.0.0',
  });
});

// 2. Nyaya AI Chatbot
app.post('/api/nyaya/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const safeLanguage = ['en', 'hi', 'gu'].includes(language) ? language : 'en';
    const result = await generateNyayaChatResponse(message.trim(), history, safeLanguage);

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/nyaya/chat:', error);
    res.status(500).json({ error: error.message || 'Failed to generate legal guidance.' });
  }
});

// 3. Verified Knowledge Sources (RAG Library)
app.get('/api/rag/sources', (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    let items = [...knowledgeStore];

    if (category && typeof category === 'string' && category !== 'all') {
      items = items.filter(s => s.category === category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.actOrRegulation.toLowerCase().includes(q) ||
          s.ministryOrAuthority.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q)
      );
    }

    res.json({ sources: items, total: items.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch knowledge sources.' });
  }
});

// 4. Admin Add / Update Knowledge Source
app.post('/api/rag/sources', (req: Request, res: Response) => {
  try {
    const {
      title,
      actOrRegulation,
      sectionOrRule,
      ministryOrAuthority,
      officialUrl,
      summary,
      fullContent,
      category,
      version = '1.0'
    } = req.body;

    if (!title || !actOrRegulation || !officialUrl || !summary) {
      return res.status(400).json({ error: 'Missing required knowledge source fields.' });
    }

    const newId = `LEGAL-SRC-${Date.now().toString(36).toUpperCase()}`;
    const newSource: any = {
      id: newId,
      title,
      actOrRegulation,
      sectionOrRule: sectionOrRule || 'General',
      ministryOrAuthority: ministryOrAuthority || 'Government of India',
      officialUrl,
      summary,
      fullContent: fullContent || summary,
      verifiedDate: new Date().toISOString().split('T')[0],
      version,
      verificationStatus: 'verified',
      citationsCount: 0,
      category: category || 'statutory',
      keywords: [title, actOrRegulation, category].join(' ').toLowerCase().split(/\s+/),
    };

    knowledgeStore.unshift(newSource);
    res.status(201).json({ success: true, source: newSource });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create knowledge source.' });
  }
});

// 5. Admin Toggle Verification Status
app.post('/api/rag/sources/:id/verify', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const source = knowledgeStore.find(s => s.id === id);

    if (!source) {
      return res.status(404).json({ error: 'Source not found.' });
    }

    source.verificationStatus = source.verificationStatus === 'verified' ? 'updated' : 'verified';
    source.verifiedDate = new Date().toISOString().split('T')[0];

    res.json({ success: true, source });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update verification status.' });
  }
});

// 6. Business Setup Assistant
app.post('/api/business/setup', async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      domain,
      customDomain,
      scale = 'small',
      locationState = 'Maharashtra',
      entityType,
      operatesOnline = true,
      hasPhysicalPremises = true,
      language = 'en',
    } = req.body;

    if (!domain && !customDomain) {
      return res.status(400).json({ error: 'Please provide a business domain or industry.' });
    }

    const roadmap = await generateBusinessSetupRoadmap({
      businessName: businessName || 'New Venture',
      domain: domain || 'General Business',
      customDomain,
      scale,
      locationState,
      entityType,
      operatesOnline,
      hasPhysicalPremises,
      language,
    });

    res.json(roadmap);
  } catch (error: any) {
    console.error('Error generating business setup roadmap:', error);
    res.status(500).json({ error: error.message || 'Failed to generate business roadmap.' });
  }
});

// 7. Document Analysis & Explainer
app.post('/api/document/analyze', async (req: Request, res: Response) => {
  try {
    const { fileName = 'Document', rawText = '', language = 'en' } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Document text cannot be empty.' });
    }

    const safeLanguage = ['en', 'hi', 'gu'].includes(language) ? language : 'en';
    const analysis = await analyzeLegalDocument(fileName, rawText, safeLanguage);

    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing legal document:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze document.' });
  }
});

// 8. Dashboard Data (Tasks & Licences)
app.get('/api/dashboard/data', (req: Request, res: Response) => {
  try {
    res.json({
      tasks: userTasks,
      licences: userLicences,
      metrics: {
        totalTasks: userTasks.length,
        pendingTasks: userTasks.filter(t => t.status === 'pending').length,
        completedTasks: userTasks.filter(t => t.status === 'completed').length,
        activeLicences: userLicences.filter(l => l.status === 'active').length,
        renewalDueLicences: userLicences.filter(l => l.status === 'renewal_due').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard data.' });
  }
});

// 9. Add or Update Compliance Task
app.post('/api/dashboard/tasks', (req: Request, res: Response) => {
  try {
    const { id, title, category, dueDate, status, priority, authority, portalUrl, formName, penaltyRisk } = req.body;

    if (id) {
      // Update existing
      const existing = userTasks.find(t => t.id === id);
      if (existing) {
        if (status !== undefined) existing.status = status;
        if (title !== undefined) existing.title = title;
        if (dueDate !== undefined) existing.dueDate = dueDate;
        return res.json({ success: true, task: existing });
      }
    }

    if (!title || !dueDate || !category) {
      return res.status(400).json({ error: 'Title, category, and due date are required.' });
    }

    const newTask: ComplianceTask = {
      id: `task-${Date.now()}`,
      title,
      category,
      dueDate,
      status: status || 'pending',
      priority: priority || 'medium',
      authority: authority || 'Regulatory Body',
      portalUrl,
      formName,
      penaltyRisk: penaltyRisk || 'Statutory fines may apply for delayed filing.'
    };

    userTasks.unshift(newTask);
    res.status(201).json({ success: true, task: newTask });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update compliance task.' });
  }
});

// 10. Add or Update Licence
app.post('/api/dashboard/licences', (req: Request, res: Response) => {
  try {
    const { name, licenceNumber, authority, issueDate, expiryDate, portalUrl, renewalFee } = req.body;

    if (!name || !authority || !expiryDate) {
      return res.status(400).json({ error: 'Name, authority, and expiry date are required.' });
    }

    const expiryTime = new Date(expiryDate).getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24)));

    const newLicence: LicenceItem = {
      id: `lic-${Date.now()}`,
      name,
      licenceNumber: licenceNumber || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
      authority,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate,
      daysRemaining,
      status: daysRemaining <= 30 ? 'renewal_due' : 'active',
      portalUrl: portalUrl || 'https://www.india.gov.in',
      renewalFee: renewalFee || 'Statutory government fee'
    };

    userLicences.unshift(newLicence);
    res.status(201).json({ success: true, licence: newLicence });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save licence.' });
  }
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegBuddy Indian Legal Assistant running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
