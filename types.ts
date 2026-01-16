
export enum Language {
  MK = 'mk',
  SQ = 'sq',
  EN = 'en'
}

export interface Service {
  id: string;
  name: string;
  price: number;
  type: 'printer' | 'material' | 'scanner' | 'part' | 'service';
  stockStatus: 'in_stock' | 'out_of_stock' | 'backorder';
  description?: string;
  specs?: string;
  brand?: string;
  sku?: string; // Added for 3DHub inventory
  technology?: string; // Added for printer tech (FDM/SLA)
  // Legacy fields kept for compatibility
  duration?: number; 
  reoccurrence?: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string; // Product ID
  serviceName: string; // Product Name
  date: string; // Used for order date
  time: string; // Used for preferred contact time or delivery
  status: 'confirmed' | 'pending' | 'cancelled'; // Order status
  notes?: string; // Shipping address or special request
  language: Language;
  createdAt: number;
}

export interface CallLog {
  id: string;
  timestamp: number;
  duration: number;
  status: 'completed' | 'abandoned' | 'failed';
  bookingStatus: 'confirmed' | 'pending' | 'none';
  customerName?: string;
  customerPhone?: string;
  transcripts: { text: string; type: 'input' | 'output' }[];
}

export interface CallReport {
  report_type: 'ORDER_CREATE' | 'INQUIRY' | 'SUPPORT' | 'CHECK_STOCK' | 'CALL_SUMMARY';
  call_status: 'completed' | 'abandoned' | 'failed';
  booking_status: 'confirmed' | 'pending' | 'none';
  language: string;
  contact: {
    name: string;
    phone: string;
  };
  booking: {
    service: string;
    price: string;
    date: string;
    time: string;
    duration_minutes: number;
  };
  notes: string;
}

export interface DashboardStats {
  totalCalls: number;
  totalAppointments: number;
  totalRevenue: number;
  serviceDistribution: { name: string; value: number }[];
}

export interface LandingPageSpec {
  hero: {
    headline: string;
    subheadline: string;
    primaryCTA: string;
    secondaryCTA: string;
  };
  benefits: {
    title: string;
    items: { title: string; description: string; icon: string }[];
  };
  agentSpotlight: {
    title: string;
    tagline: string;
    description: string;
    mockup: any;
  };
  servicesPreview: {
    title: string;
    description: string;
    highlights: string[];
  };
  howItWorks: {
    title: string;
    steps: { step: number; title: string; description: string }[];
  };
  footer: {
    companyName: string;
    location: string;
    contact: string;
    disclaimer: string;
  };
}
