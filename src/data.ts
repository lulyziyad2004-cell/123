import { Lawyer, Tenant, Session, Invoice, Notification } from './types';

// The database is initialized empty so the user can enter their own data
export const INITIAL_LAWYERS: Lawyer[] = [];

export const INITIAL_TENANTS: Tenant[] = [];

export const INITIAL_SESSIONS: Session[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

// Optional demo data helper in case they want to load mock data for demonstration
export const DEMO_LAWYERS: Lawyer[] = [
  {
    id: 'L1',
    name: 'أ. عبد العزيز بن فهد آل سعود',
    specialty: 'القضايا العقارية والمالية',
    email: 'lawyer1@asal.com',
    phone: '0501234567',
    password: '123'
  },
  {
    id: 'L2',
    name: 'أ. سارة عبد الرحمن الحجيلان',
    specialty: 'عقود الإيجار والشركات',
    email: 'lawyer2@asal.com',
    phone: '0559876543',
    password: '123'
  }
];

export const DEMO_TENANTS: Tenant[] = [
  {
    id: 'T1',
    name: 'فيصل خالد الشمري',
    propertyNo: 'قضية رقم 1024 - مطالبة مالية وتعويض أضرار',
    email: 'client1@asal.com',
    phone: '0562233445',
    password: '123'
  },
  {
    id: 'T2',
    name: 'مؤسسة الابتكار التقني للتجارة',
    propertyNo: 'عقد رقم 402 - صياغة اتفاقية الاندماج والشركاء',
    email: 'client2@asal.com',
    phone: '0547788990',
    password: '123'
  }
];

export const DEMO_SESSIONS: Session[] = [
  {
    id: 'S1',
    caseId: 'CASE-1092',
    caseTitle: 'دعوى تجارية - تنفيذ شروط العقد المبرم ومطالبة بمستحقات مالية',
    date: '2026-07-05',
    hijriDate: '١٩ محرم ١٤٤٨ هـ',
    day: 'الأحد',
    time: '09:30 ص',
    plaintiff: 'مؤسسة الابتكار التقني للتجارة',
    defendant: 'شركة التوريدات العالمية للمقاولات',
    lawyerId: 'L1',
    tenantId: 'T1',
    courtRoom: 'المحكمة التجارية بالرياض - الدائرة الأولى للاستئناف',
    status: 'scheduled',
    notes: 'الرجاء إعداد مذكرة الدفوع ومراجعة البند الرابع من الاتفاقية وتجهيز كشف المطالبات.'
  }
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'INV-4011',
    tenantId: 'T1',
    tenantName: 'فيصل خالد الشمري',
    amount: 15000,
    issueDate: '2026-06-01',
    dueDate: '2026-07-01',
    status: 'overdue',
    description: 'أتعاب صياغة ومراجعة لوائح الإدعاء والمرافعة في القضية التجارية رقم 1024'
  }
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'N1',
    targetRole: 'tenant',
    targetId: 'T1',
    title: 'تحديث في جلسة المرافعة التجارية',
    message: 'تذكير: تم تحديد موعد الجلسة القادمة يوم الأحد 2026-07-05 الساعة 09:30 ص في قاعة المحكمة التجارية الدائرة الأولى بخصوص القضية رقم CASE-1092.',
    timestamp: '2026-07-01 10:00 ص',
    isRead: false,
    type: 'session'
  }
];
