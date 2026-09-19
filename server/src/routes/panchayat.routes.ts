import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/ai.service.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to generate unique Tracking ID
function generateTrackingID(prefix: string): string {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${new Date().getFullYear()}-${random}`;
}

// ----------------------------------------------------
// 1. Applications & Certificates
// ----------------------------------------------------
router.get('/applications', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.query;
    let applications;
    
    if (role === 'ADMIN') {
      applications = await prisma.application.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userId) {
      applications = await prisma.application.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      applications = await prisma.application.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.json({ applications });
  } catch (error) {
    return res.status(500).json({ error: 'आवेदन लोड करने में समस्या आई' });
  }
});

router.post('/applications', async (req: Request, res: Response) => {
  try {
    const { userId, serviceType, serviceName, formData, documentUrls, appliedBy } = req.body;
    
    if (!userId || !serviceType) {
      return res.status(400).json({ error: 'उपयोगकर्ता आईडी और सेवा प्रकार आवश्यक हैं' });
    }

    const trackingId = generateTrackingID('GS-APP');

    const newApp = await prisma.application.create({
      data: {
        trackingId,
        userId,
        serviceType,
        serviceName: serviceName || serviceType,
        formData: typeof formData === 'string' ? formData : JSON.stringify(formData || {}),
        documentUrls: typeof documentUrls === 'string' ? documentUrls : JSON.stringify(documentUrls || []),
        appliedBy: appliedBy || 'Self',
        status: 'SUBMITTED'
      }
    });

    return res.json({
      success: true,
      application: newApp,
      trackingId,
      message: `आपका आवेदन सफलतापूर्वक जमा हो गया है! ट्रैकिंग आईडी: ${trackingId}`
    });
  } catch (error) {
    console.error('Application submit error:', error);
    return res.status(500).json({ error: 'आवेदन जमा नहीं हो सका' });
  }
});

// Admin Review Application
router.patch('/applications/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, issuedCertUrl } = req.body;

    const qrCodeData = status === 'APPROVED' ? `GRAM-SETU-VERIFIED-CERT:${id}` : null;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        ...(rejectionReason && { rejectionReason }),
        ...(issuedCertUrl && { issuedCertUrl }),
        ...(qrCodeData && { qrCodeData })
      }
    });

    return res.json({ success: true, application: updated });
  } catch (error) {
    return res.status(500).json({ error: 'आवेदन की स्थिति अपडेट नहीं हो सकी' });
  }
});

// ----------------------------------------------------
// 2. Grievance & Complaints
// ----------------------------------------------------
router.get('/complaints', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.query;
    let complaints;

    if (role === 'ADMIN') {
      complaints = await prisma.complaint.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userId) {
      complaints = await prisma.complaint.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      complaints = await prisma.complaint.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
    }

    return res.json({ complaints });
  } catch (error) {
    return res.status(500).json({ error: 'शिकायतें लोड नहीं हो सकीं' });
  }
});

router.post('/complaints', async (req: Request, res: Response) => {
  try {
    const { userId, description, photoUrl, voiceNoteUrl } = req.body;

    if (!userId || !description) {
      return res.status(400).json({ error: 'विवरण आवश्यक है' });
    }

    // Auto categorize using AI service
    const aiCategory = await aiService.categorizeComplaint(description);
    const trackingId = generateTrackingID('GS-CMP');

    const complaint = await prisma.complaint.create({
      data: {
        trackingId,
        userId,
        category: aiCategory.category,
        categoryHindi: aiCategory.categoryHindi,
        description,
        photoUrl: photoUrl || null,
        voiceNoteUrl: voiceNoteUrl || null,
        assignedTo: aiCategory.suggestedDepartment,
        status: 'SUBMITTED'
      }
    });

    return res.json({
      success: true,
      complaint,
      trackingId,
      message: `आपकी शिकायत दर्ज हो गई है! ट्रैकिंग संख्या: ${trackingId}`
    });
  } catch (error) {
    return res.status(500).json({ error: 'शिकायत दर्ज करने में त्रुटि' });
  }
});

// Admin update complaint
router.patch('/complaints/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        ...(resolutionNotes && { resolutionNotes }),
        ...(assignedTo && { assignedTo })
      }
    });

    return res.json({ success: true, complaint: updated });
  } catch (error) {
    return res.status(500).json({ error: 'शिकायत अपडेट करने में त्रुटि' });
  }
});

// ----------------------------------------------------
// 3. Schemes & Pension Hub
// ----------------------------------------------------
router.get('/schemes', async (req: Request, res: Response) => {
  try {
    const schemes = await prisma.scheme.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ schemes });
  } catch (error) {
    return res.status(500).json({ error: 'योजनाएं लोड नहीं हो सकीं' });
  }
});

router.post('/schemes/check-eligibility', async (req: Request, res: Response) => {
  try {
    const { age, annualIncome, category } = req.body;
    const results = await aiService.checkEligibility(
      age || 65, 
      annualIncome || 120000, 
      category || 'GENERAL'
    );

    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'पात्रता जांच विफल रही' });
  }
});

// ----------------------------------------------------
// 4. Documents Locker
// ----------------------------------------------------
router.get('/documents/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({ error: 'दस्तावेज़ लोड नहीं हो सके' });
  }
});

router.post('/documents', async (req: Request, res: Response) => {
  try {
    const { userId, name, type, fileUrl } = req.body;
    const doc = await prisma.document.create({
      data: {
        userId,
        name,
        type: type || 'OTHER',
        fileUrl: fileUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop'
      }
    });
    return res.json({ success: true, document: doc });
  } catch (error) {
    return res.status(500).json({ error: 'दस्तावेज़ सहेजने में विफल' });
  }
});

// ----------------------------------------------------
// 5. Notices & Gram Sabha
// ----------------------------------------------------
router.get('/notices', async (req: Request, res: Response) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { publishDate: 'desc' }
    });
    return res.json({ notices });
  } catch (error) {
    return res.status(500).json({ error: 'सूचनाएं लोड करने में त्रुटि' });
  }
});

router.post('/notices', async (req: Request, res: Response) => {
  try {
    const { title, titleHindi, content, contentHindi, isGramSabha, gramSabhaDate, agenda } = req.body;
    const notice = await prisma.notice.create({
      data: {
        title: title || titleHindi,
        titleHindi,
        content: content || contentHindi,
        contentHindi,
        isGramSabha: !!isGramSabha,
        gramSabhaDate: gramSabhaDate ? new Date(gramSabhaDate) : null,
        agenda
      }
    });
    return res.json({ success: true, notice });
  } catch (error) {
    return res.status(500).json({ error: 'सूचना प्रकाशित करने में त्रुटि' });
  }
});

// ----------------------------------------------------
// 6. Panchayat Payments
// ----------------------------------------------------
router.get('/payments/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' }
    });
    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ error: 'भुगतान विवरण लोड नहीं हो सका' });
  }
});

router.post('/payments/:id/pay', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const receiptId = `RCT-${Math.floor(100000 + Math.random() * 900000)}`;

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        receiptId,
        paidAt: new Date()
      }
    });

    return res.json({
      success: true,
      payment: updated,
      message: `भुगतान सफल रहा! रसीद संख्या: ${receiptId}`
    });
  } catch (error) {
    return res.status(500).json({ error: 'भुगतान प्रक्रिया विफल' });
  }
});

// ----------------------------------------------------
// 7. AI Assistant Chat Endpoint
// ----------------------------------------------------
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, currentFormState } = req.body;
    const response = await aiService.chatAssistant(messages || [], currentFormState);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: 'एआई सहायक सेवा अस्थायी रूप से अनुपलब्ध है' });
  }
});

export default router;
