// Pluggable AI Client for Gram Setu
// Can be backed by Google Gemini API, OpenAI, or a fallback rules engine.

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIEligibilityCheckResult {
  eligible: boolean;
  schemeTitle: string;
  reasonHindi: string;
  reasonEnglish: string;
  missingDocs: string[];
}

export interface AIComplaintCategorization {
  category: string;
  categoryHindi: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  suggestedDepartment: string;
}

export class AIService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || null;
  }

  // 1. Panchayat Mitra Conversational Assistant & Guided Form Filling
  async chatAssistant(messages: AIChatMessage[], currentFormState?: any): Promise<{ textHindi: string; textEnglish: string; identifiedService?: string; nextFieldToAsk?: string; formUpdates?: any }> {
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // Intent recognition heuristics for fallback mode
    if (lastUserMsg.includes('income') || lastUserMsg.includes('आय प्रमाणपत्र') || lastUserMsg.includes('आया')) {
      return {
        textHindi: "आय प्रमाणपत्र (Income Certificate) के लिए आपको आधार कार्ड और राशन कार्ड की आवश्यकता होगी। क्या आपके पास ये दस्तावेज़ उपलब्ध हैं?",
        textEnglish: "For Income Certificate, you will need your Aadhaar card and Ration card. Do you have these documents ready?",
        identifiedService: "income_certificate",
        nextFieldToAsk: "annualIncome",
        formUpdates: { serviceType: "income_certificate" }
      };
    }

    if (lastUserMsg.includes('pension') || lastUserMsg.includes('पेंशन') || lastUserMsg.includes('वृद्धावस्था')) {
      return {
        textHindi: "ग्राम सेतु वृद्धावस्था और विधवा पेंशन में आपकी सहायता कर सकता है। क्या आप अपनी या किसी रिश्तेदार की पेंशन स्थिति जांचना चाहते हैं?",
        textEnglish: "Gram Setu can assist you with Old Age and Widow Pension schemes. Would you like to check pension eligibility or status?",
        identifiedService: "pension_scheme"
      };
    }

    if (lastUserMsg.includes('complaint') || lastUserMsg.includes('शिकायत') || lastUserMsg.includes('लाइट') || lastUserMsg.includes('पानी') || lastUserMsg.includes('सड़क')) {
      return {
        textHindi: "आप किसी भी समस्या (जैसे बिजली, पानी, सड़क या नालियों) की फोटो या बोलकर शिकायत दर्ज कर सकते हैं। क्या आप शिकायत दर्ज करना चाहते हैं?",
        textEnglish: "You can file complaints regarding water, street lights, or roads by speaking or uploading a photo. Would you like to submit a complaint?",
        identifiedService: "grievance"
      };
    }

    return {
      textHindi: "नमस्ते! मैं पंचायत मित्र हूँ। मैं आय प्रमाण पत्र, पेंशन, शिकायत दर्ज करने और ग्राम पंचायत की जानकारियों में आपकी मदद कर सकता हूँ। आप क्या करना चाहते हैं?",
      textEnglish: "Namaste! I am Panchayat Mitra. I can help you apply for certificates, check pensions, or file village complaints. How can I assist you today?"
    };
  }

  // 2. Auto Categorization for Complaints
  async categorizeComplaint(description: string): Promise<AIComplaintCategorization> {
    const text = description.toLowerCase();
    if (text.includes('light') || text.includes('लाइट') || text.includes('बिजली') || text.includes('खंभा')) {
      return {
        category: 'street_light',
        categoryHindi: 'स्ट्रीट लाइट एवं बिजली (Street Light)',
        priority: 'NORMAL',
        suggestedDepartment: 'विद्युत विभाग (Electricity Dept)'
      };
    }
    if (text.includes('water') || text.includes('पानी') || text.includes('नल') || text.includes('सप्लाई')) {
      return {
        category: 'water_supply',
        categoryHindi: 'पेयजल एवं जल आपूर्ति (Water Supply)',
        priority: 'HIGH',
        suggestedDepartment: 'जल निगम (Water Dept)'
      };
    }
    if (text.includes('road') || text.includes('सड़क') || text.includes('गड्ढा') || text.includes('रास्ता')) {
      return {
        category: 'road',
        categoryHindi: 'सड़क एवं मार्ग (Road & Highways)',
        priority: 'NORMAL',
        suggestedDepartment: 'लोक निर्माण विभाग (PWD)'
      };
    }
    if (text.includes('drain') || text.includes('नाली') || text.includes('सफाई') || text.includes('कचरा')) {
      return {
        category: 'drainage',
        categoryHindi: 'नाली एवं स्वच्छता (Drainage & Sanitation)',
        priority: 'HIGH',
        suggestedDepartment: 'ग्राम स्वच्छता समिति (Sanitation Dept)'
      };
    }
    return {
      category: 'other',
      categoryHindi: 'सामान्य शिकायत (General Complaint)',
      priority: 'NORMAL',
      suggestedDepartment: 'ग्राम पंचायत कार्यालय (Panchayat Office)'
    };
  }

  // 3. Scheme Eligibility Checker
  async checkEligibility(userAge: number, annualIncome: number, category: string): Promise<AIEligibilityCheckResult[]> {
    const results: AIEligibilityCheckResult[] = [];

    // Indira Gandhi National Old Age Pension Scheme
    if (userAge >= 60) {
      results.push({
        eligible: true,
        schemeTitle: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना (Old Age Pension)',
        reasonHindi: `आपकी आयु ${userAge} वर्ष है (60+ वर्ष के नागरिक पात्र हैं)। आपको प्रति माह ₹1,000 की वित्तीय सहायता मिलेगी।`,
        reasonEnglish: `Your age is ${userAge} years (60+ senior citizens eligible). You qualify for ₹1,000 monthly pension.`,
        missingDocs: ['आय प्रमाण पत्र', 'बैंक पासबुक फोटो']
      });
    }

    // Ayushman Bharat Health Insurance
    if (annualIncome <= 250000) {
      results.push({
        eligible: true,
        schemeTitle: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (Ayushman Bharat)',
        reasonHindi: `आपकी वार्षिक आय ₹${annualIncome.toLocaleString('en-IN')} है, जो गरीबी रेखा के दायरे में आती है। ₹5 लाख तक का मुफ्त इलाज।`,
        reasonEnglish: `Your family income qualifies for Ayushman Card with ₹5 Lakh free health coverage per year.`,
        missingDocs: ['राशन कार्ड', 'आधार कार्ड']
      });
    }

    // PM Awas Yojana Gramin
    if (annualIncome <= 180000) {
      results.push({
        eligible: true,
        schemeTitle: 'प्रधानमंत्री आवास योजना ग्रामीण (PM Awas Yojana)',
        reasonHindi: 'पक्के मकान निर्माण हेतु ₹1,20,000 की सरकारी सब्सिडी के लिए पात्र।',
        reasonEnglish: 'Eligible for ₹1.20 Lakh housing subsidy under PM Awas Yojana Gramin.',
        missingDocs: ['जमीन के कागज / खसरा', 'बैंक पासबुक']
      });
    }

    return results;
  }
}

export const aiService = new AIService();
