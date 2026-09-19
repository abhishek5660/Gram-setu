import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌾 Seeding Gram Setu database with sample Rampur Panchayat data...');

  // 1. Clean existing records
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Sample Users
  const seniorUser = await prisma.user.create({
    data: {
      phone: '9876543210',
      name: 'रमेश प्रसाद काका (Ramesh Prasad Kaka)',
      age: 70,
      village: 'ग्राम रामपुर (Rampur)',
      ward: 'वार्ड 4 (Ward 4)',
      aadhaarMasked: 'XXXX-XXXX-8921',
      role: 'CITIZEN',
      isSenior: true
    }
  });

  const familyUser = await prisma.user.create({
    data: {
      phone: '9123456789',
      name: 'सुनील कुमार (Sunil Kumar - Ramesh Kaka\'s Son)',
      age: 36,
      village: 'ग्राम रामपुर (Rampur)',
      ward: 'वार्ड 4 (Ward 4)',
      aadhaarMasked: 'XXXX-XXXX-4512',
      role: 'ASSISTED',
      isSenior: false
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      phone: '9999999999',
      name: 'श्री रामेश्वर शर्मा (ग्राम पंचायत सचिव)',
      age: 44,
      village: 'ग्राम रामपुर (Rampur)',
      ward: 'पंचायत भवन रामपुर',
      aadhaarMasked: 'XXXX-XXXX-1122',
      role: 'ADMIN',
      isSenior: false
    }
  });

  console.log(`Created test users: Senior Citizen (${seniorUser.name}), Admin (${adminUser.name})`);

  // 3. Create Sample Documents for Locker
  await prisma.document.createMany({
    data: [
      {
        userId: seniorUser.id,
        name: 'आधार कार्ड (Aadhaar Card)',
        type: 'AADHAAR',
        fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop'
      },
      {
        userId: seniorUser.id,
        name: 'राशन कार्ड (Ration Card)',
        type: 'RATION_CARD',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop'
      },
      {
        userId: seniorUser.id,
        name: 'बैंक पासबुक (Bank Passbook)',
        type: 'OTHER',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop'
      }
    ]
  });

  // 4. Create Sample Applications
  await prisma.application.createMany({
    data: [
      {
        trackingId: 'GS-APP-2026-10492',
        userId: seniorUser.id,
        serviceType: 'income_certificate',
        serviceName: 'आय प्रमाण पत्र (Income Certificate)',
        status: 'APPROVED',
        formData: JSON.stringify({ annualIncome: '96000', purpose: 'Pension Application', occupation: 'Agriculture' }),
        documentUrls: JSON.stringify(['Aadhaar Card', 'Ration Card']),
        appliedBy: 'सुनील कुमार (Son)',
        issuedCertUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
        qrCodeData: 'GRAM-SETU-VERIFIED-CERT:GS-APP-2026-10492'
      },
      {
        trackingId: 'GS-APP-2026-88120',
        userId: seniorUser.id,
        serviceType: 'domicile_certificate',
        serviceName: 'निवास प्रमाण पत्र (Domicile Certificate)',
        status: 'IN_REVIEW',
        formData: JSON.stringify({ resYears: '45', address: 'Ward 4, Near School Rampur' }),
        documentUrls: JSON.stringify(['Aadhaar Card']),
        appliedBy: 'Self (Panchayat Mitra Voice AI)'
      }
    ]
  });

  // 5. Create Sample Complaints
  await prisma.complaint.createMany({
    data: [
      {
        trackingId: 'GS-CMP-2026-44120',
        userId: seniorUser.id,
        category: 'street_light',
        categoryHindi: 'स्ट्रीट लाइट खराब है (Street Light Fault)',
        description: 'वार्ड 4 प्राथमिक विद्यालय के पास सड़क की लाइट पिछले 4 दिनों से बंद है।',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop',
        status: 'ASSIGNED',
        assignedTo: 'विद्युत तकनीशियन (Electrician Smt. Malti)'
      },
      {
        trackingId: 'GS-CMP-2026-90123',
        userId: seniorUser.id,
        category: 'water_supply',
        categoryHindi: 'पेयजल हैंडपंप खराब (Handpump Repair)',
        description: 'रामपुर बस स्टैंड के पास का हैंडपंप गंदा पानी दे रहा है।',
        status: 'SUBMITTED',
        assignedTo: 'जल निगम रामपुर'
      }
    ]
  });

  // 6. Create Government Schemes
  await prisma.scheme.createMany({
    data: [
      {
        title: 'Indira Gandhi National Old Age Pension Scheme',
        titleHindi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना',
        category: 'PENSION',
        description: 'Monthly financial pension support for senior citizens aged 60 and above.',
        descriptionHindi: '60 वर्ष और उससे अधिक आयु के वरिष्ठ नागरिकों को ₹1,000 प्रति माह पेंशन सहायता।',
        benefitAmount: '₹1,000 / माह (Monthly)',
        eligibilityCriteria: 'आयु 60 वर्ष या अधिक, बीपीएल या कम आय परिवार',
        requiredDocs: 'आधार कार्ड, बैंक पासबुक, आय प्रमाण पत्र'
      },
      {
        title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
        titleHindi: 'आयुष्मान भारत कार्ड योजना (मुफ्त ₹5 लाख स्वास्थ्य बीमा)',
        category: 'HEALTH',
        description: 'Free hospital cashless treatment coverage up to Rs 5 Lakhs per family annually.',
        descriptionHindi: 'परिवार के लिए ₹5 लाख तक का सालाना मुफ्त इलाज सरकारी व सूचीबद्ध अस्पतालों में।',
        benefitAmount: '₹5,00,000 स्वास्थ सुरक्षा',
        eligibilityCriteria: 'पात्र राशन कार्ड धारक या सामाजिक-आर्थिक जनगणना परिवार',
        requiredDocs: 'आधार कार्ड, राशन कार्ड'
      },
      {
        title: 'Pradhan Mantri Awas Yojana Gramin',
        titleHindi: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
        category: 'HOUSING',
        description: 'Financial housing grant for construction of pucca house in rural villages.',
        descriptionHindi: 'ग्रामीण क्षेत्र में पक्का मकान बनाने के लिए ₹1,20,000 की सीधी बैंक मदद।',
        benefitAmount: '₹1,20,000 किस्तों में',
        eligibilityCriteria: 'कच्चा मकान या बेघर परिवार',
        requiredDocs: 'जमीन का पर्चा/खसरा, आधार कार्ड, बैंक खाता'
      },
      {
        title: 'PM Kisan Samman Nidhi',
        titleHindi: 'पीएम किसान सम्मान निधि योजना',
        category: 'EMPLOYMENT',
        description: 'Annual income support of Rs 6,000 in 3 equal installments to landholding farmer families.',
        descriptionHindi: 'किसानों को कृषि कार्यों हेतु प्रति वर्ष ₹6,000 (₹2000 की 3 किस्तें)।',
        benefitAmount: '₹6,000 / वर्ष',
        eligibilityCriteria: 'कृषक परिवार (खेती योग्य भूमिधारक)',
        requiredDocs: 'खतौनी, आधार कार्ड, बैंक खाता'
      }
    ]
  });

  // 7. Create Public Notices & Gram Sabha Agenda
  await prisma.notice.createMany({
    data: [
      {
        title: 'Upcoming Gram Sabha Meeting Announcement',
        titleHindi: 'विशेष ग्राम सभा बैठक - जल जीवन मिशन व स्वच्छता बजट चर्चा',
        content: 'All villagers are requested to participate in the upcoming Gram Sabha meeting at Panchayat Bhawan.',
        contentHindi: 'समस्त ग्रामवासियों को सूचित किया जाता है कि दिनांक 25 सितंबर 2026 को प्रातः 10 बजे पंचायत भवन रामपुर में ग्राम सभा की बैठक आयोजित होगी।',
        isGramSabha: true,
        gramSabhaDate: new Date('2026-09-25T10:00:00Z'),
        agenda: '1. पेयजल पाइपलाइन विस्तार\n2. वृद्धावस्था पेंशन सूची सत्यापन\n3. नए स्ट्रीट लाइट आवंटन'
      },
      {
        title: 'Free Health & Eye Checkup Camp',
        titleHindi: 'मुफ्त स्वास्थ्य जांच एवं मोतियाबिंद शिविर (प्राथमिक स्वास्थ्य केंद्र)',
        content: 'Free health camp for senior citizens this Sunday.',
        contentHindi: 'इस रविवार प्रातः 9 बजे से 2 बजे तक पीएचसी रामपुर में वरिष्ठ नागरिकों के लिए मुफ्त स्वास्थ्य एवं आंख जांच शिविर का आयोजन। मुफ्त चश्मे व दवाइयां दी जाएंगी।',
        isGramSabha: false
      }
    ]
  });

  // 8. Create Sample Payments
  await prisma.payment.createMany({
    data: [
      {
        userId: seniorUser.id,
        category: 'property_tax',
        titleHindi: 'गृह कर / संपत्ति कर (Property Tax 2025-26)',
        amount: 240.00,
        status: 'PENDING',
        dueDate: new Date('2026-10-31')
      },
      {
        userId: seniorUser.id,
        category: 'water_tax',
        titleHindi: 'जल कर शुल्क (Water Connection Fee)',
        amount: 120.00,
        status: 'PAID',
        dueDate: new Date('2026-08-31'),
        receiptId: 'RCT-2026-991204',
        paidAt: new Date('2026-08-15')
      }
    ]
  });

  console.log('✅ Database seeded successfully with Rampur Panchayat records!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
