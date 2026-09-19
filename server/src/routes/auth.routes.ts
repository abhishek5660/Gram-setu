import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'gram_setu_secret_key_2026';

// Helper to mask Aadhaar
function maskAadhaar(aadhaar?: string): string {
  if (!aadhaar || aadhaar.length < 4) return 'XXXX-XXXX-8921';
  const clean = aadhaar.replace(/\D/g, '');
  const last4 = clean.slice(-4) || '8921';
  return `XXXX-XXXX-${last4}`;
}

// 1. Send OTP
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit mobile number)' });
    }

    const mockCode = '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otp.create({
      data: {
        phone,
        code: mockCode,
        expiresAt
      }
    });

    console.log(`[OTP SENT] Phone: ${phone}, Code: ${mockCode}`);

    return res.json({
      success: true,
      message: 'ओटीपी आपके मोबाइल नंबर पर भेज दिया गया है (OTP sent successfully)',
      mockOtp: mockCode // Provided for easy developer demo testing
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'ओटीपी भेजने में समस्या आई (Error sending OTP)' });
  }
});

// 2. Verify OTP & Login / Register
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, code, rolePreference } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'मोबाइल नंबर और ओटीपी दोनों आवश्यक हैं' });
    }

    // Accept mock code '123456' or valid database OTP
    const validOtp = code === '123456' || (await prisma.otp.findFirst({
      where: { phone, code, verified: false, expiresAt: { gte: new Date() } }
    }));

    if (!validOtp) {
      return res.status(400).json({ error: 'गलत या समय समाप्त ओटीपी (Invalid or expired OTP)' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Determine if admin by phone or role preference
      const isSecretaryAdmin = phone === '9999999999' || rolePreference === 'ADMIN';
      const isSenior = phone === '9876543210'; // Default test senior

      user = await prisma.user.create({
        data: {
          phone,
          name: isSecretaryAdmin ? 'श्री रामेश्वर शर्मा (ग्राम सचिव)' : (isSenior ? 'रमेश प्रसाद (वरिष्ठ नागरिक)' : 'सुभाष यादव'),
          age: isSenior ? 70 : (isSecretaryAdmin ? 42 : 38),
          village: 'रामपुर (Rampur)',
          ward: 'वार्ड 4 (Ward 4)',
          role: isSecretaryAdmin ? 'ADMIN' : (rolePreference || 'CITIZEN'),
          isSenior: isSenior,
          aadhaarMasked: maskAadhaar('987654328921')
        }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role, isSenior: user.isSenior },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'लॉगिन में त्रुटि (Login Error)' });
  }
});

// 3. Get Current User Profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'ऑथेंटिकेशन आवश्यक है (Unauthorized)' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ error: 'उपयोगकर्ता नहीं मिला (User not found)' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(401).json({ error: 'अमान्य टोकन (Invalid token)' });
  }
});

// 4. Update Profile & Auto-detect Senior Citizen
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { name, age, village, ward, aadhaarNumber } = req.body;
    const parsedAge = age ? parseInt(age, 10) : undefined;
    const isSenior = parsedAge !== undefined ? parsedAge >= 60 : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(parsedAge !== undefined && { age: parsedAge, isSenior }),
        ...(village && { village }),
        ...(ward && { ward }),
        ...(aadhaarNumber && { aadhaarMasked: maskAadhaar(aadhaarNumber) })
      }
    });

    return res.json({
      success: true,
      user: updatedUser,
      message: updatedUser.isSenior 
        ? 'वरिष्ठ नागरिक मोड स्वतः सक्रिय हो गया है (Senior Mode Auto-Enabled)' 
        : 'प्रोफाइल अपडेट हो गई है'
    });
  } catch (error) {
    return res.status(500).json({ error: 'प्रोफाइल अपडेट विफल' });
  }
});

export default router;
