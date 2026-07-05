export type Role = 'admin' | 'lawyer' | 'tenant';

export interface Lawyer {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  password?: string; // Optional or mandatory, let's make it optional but present
  role?: 'lawyer';
}

export interface Tenant {
  id: string;
  name: string;
  propertyNo: string;
  email: string;
  phone: string;
  password?: string; // Optional or mandatory, let's make it optional but present
  role?: 'tenant';
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Session {
  id: string;
  caseId: string;
  caseTitle: string;
  date: string;
  day: string;
  time: string;
  plaintiff: string;      // المدعي
  defendant: string;      // المدعي عليه
  lawyerId: string;       // المحامي المسؤول
  tenantId: string;       // المستأجر المسؤول
  courtRoom: string;      // قاعة المحكمة / الدائرة
  status: 'scheduled' | 'postponed' | 'completed'; // مجدولة | مؤجلة | منتهية
  notes?: string;
  city?: string;            // المدينة
  circuitNo?: string;       // رقم الدائرة
  hijriDate?: string;       // التاريخ الهجري
  agencyNo?: string;        // رقم الوكالة
  agencyExpiryDate?: string; // تاريخ انتهاء الوكالة
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue'; // مدفوعة | غير مدفوعة | متأخرة
  description: string;
}

export interface Notification {
  id: string;
  targetRole: 'lawyer' | 'tenant' | 'all' | 'custom';
  targetId: string;       // معرف المحامي أو المستأجر المستهدف
  title: string;
  message: string;
  timestamp: string;      // تاريخ ووقت الإشعار
  isRead: boolean;
  type: 'session' | 'invoice' | 'system';
  sender?: string;        // الجهة أو الموظف المرسل للإشعار
}
