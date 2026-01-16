
import React from 'react';
import { Language, Service } from './types';

// --- KNOWLEDGE BASE SOURCE DATA ---
const KNOWLEDGE_BASE = {
  "company": {
    "name": "3DHUB",
    "legal_name": "3D HAB DOOEL Skopje",
    "website": "https://3dhub.mk",
    "country": "North Macedonia",
    "address": "Balzakova 32, Lok.1, 1000 Skopje",
    "factory_address": "Saraj BB, Skopje",
    "phone": "+389 2 510 2454",
    "factory_phone": "+389 2 510 2453",
    "email": "hi@3dhub.mk",
    "working_hours": {
      "office": "Mon–Fri 09:00–16:00",
      "showroom": "Mon–Fri 09:00–14:00"
    },
    "description": "3DHUB is a specialized company for 3D printing, 3D printers, materials, parts, STL models and professional 3D printing services. They serve hobbyists, professionals and businesses."
  },
  "policies": {
    "delivery": {
      "coverage": "Only within North Macedonia",
      "timeframe": {
        "skopje": "2–3 working days",
        "other_cities": "3–5 working days"
      },
      "courier": "Total Post Logistics",
      "notes": [
        "Courier contacts customer before delivery",
        "Customer must provide correct phone number",
        "Shipping cost is paid by the customer",
        "Return shipping is also paid by the customer"
      ]
    },
    "returns": {
      "eligibility": "According to Consumer Protection Law",
      "refund_method": "Refund to original payment card only",
      "processing_time": "Up to 15 working days",
      "procedure": [
        "Customer emails hi@3dhub.mk",
        "Courier picks up the product",
        "Refund or exchange is processed"
      ]
    }
  },
  "products": [
    {
      "name": "Bambu Lab P1S",
      "category": "3D Printers",
      "brand": "Bambu Lab",
      "technology": "FDM",
      "description": "High-speed FDM 3D printer with Wi-Fi connectivity and reliable performance for hobby and professional users.",
      "price_mkd": 36100,
      "availability": "in_stock",
      "sku": "BL-P1S"
    },
    {
      "name": "Bambu Lab A1 Mini Combo",
      "category": "3D Printers",
      "brand": "Bambu Lab",
      "technology": "FDM",
      "description": "Compact desktop 3D printer ideal for beginners and small spaces.",
      "price_mkd": 29600,
      "availability": "in_stock",
      "sku": "BL-A1-MINI"
    },
    {
      "name": "Anycubic Photon Mono M7",
      "category": "3D Printers",
      "brand": "Anycubic",
      "technology": "SLA",
      "description": "High-resolution resin 3D printer for detailed prints.",
      "price_mkd": 35900,
      "availability": "in_stock",
      "sku": "AC-M7"
    },
    {
      "name": "Anycubic Photon Mono M5S",
      "category": "3D Printers",
      "brand": "Anycubic",
      "technology": "SLA",
      "description": "Affordable SLA printer for resin-based printing.",
      "price_mkd": 25500,
      "availability": "out_of_stock",
      "sku": "AC-M5S"
    },
    {
      "name": "CarbonX ezPC+CF",
      "category": "Materials",
      "brand": "3DXTech",
      "material_type": "Filament",
      "description": "Carbon fiber reinforced polycarbonate filament for high strength and heat resistance.",
      "price_mkd": 3790,
      "availability": "out_of_stock",
      "sku": "3DX-CARBONX-EZPC-CF"
    },
    {
      "name": "Bambu PETG HF 1kg",
      "category": "Materials",
      "brand": "Bambu Lab",
      "material_type": "Filament",
      "description": "High-flow PETG filament with excellent mechanical properties.",
      "price_mkd": 2600,
      "availability": "in_stock",
      "sku": "BL-PETG-HF"
    },
    {
      "name": "Anycubic Standard UV Resin",
      "category": "Materials",
      "brand": "Anycubic",
      "material_type": "Resin",
      "description": "Standard UV-curable resin for SLA printers.",
      "price_mkd": 1990,
      "availability": "in_stock",
      "sku": "AC-RESIN-STD"
    },
    {
      "name": "Bambu Lab A1 Hotend Assembly",
      "category": "3D Printer Parts",
      "brand": "Bambu Lab",
      "description": "Complete hotend assembly with hardened steel nozzle 0.40mm.",
      "price_mkd": 1400,
      "availability": "in_stock",
      "sku": "BL-A1-HOTEND"
    },
    {
      "name": "Articulated Rose STL",
      "category": "STL Store",
      "brand": "3DHUB",
      "description": "Decorative articulated 3D printable model.",
      "price_mkd": 350,
      "availability": "in_stock",
      "sku": "STL-ROSE-001"
    }
  ]
};

// --- APP CONSTANTS ---
export const BUSINESS_NAME = KNOWLEDGE_BASE.company.name;
export const BUSINESS_LOCATION = KNOWLEDGE_BASE.company.address;
export const FULL_ADDRESS = `${KNOWLEDGE_BASE.company.address} / ${KNOWLEDGE_BASE.company.factory_address}`;
export const MAPS_URL = "https://maps.app.goo.gl/3DHubSkopjeLocation";

// Map Knowledge Base to Service Interface for UI compatibility
export const SERVICES: Service[] = KNOWLEDGE_BASE.products.map(p => ({
  id: p.sku,
  name: p.name,
  price: p.price_mkd,
  // Helper to map category strings to strict types for icons
  type: p.category.toLowerCase().includes('printer') ? 'printer' :
        p.category.toLowerCase().includes('material') ? 'material' :
        p.category.toLowerCase().includes('scanner') ? 'scanner' :
        p.category.toLowerCase().includes('parts') ? 'part' : 'service',
  stockStatus: p.availability as 'in_stock' | 'out_of_stock' | 'backorder',
  brand: p.brand,
  description: p.description,
  specs: (p as any).technology ? `${(p as any).technology} Tech` : undefined,
  sku: p.sku
}));

const now = new Date();
const isoDate = now.toISOString().split('T')[0];
const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

export const SYSTEM_INSTRUCTION = `
ROLE & IDENTITY
You are Ema, the AI conversational voice agent for 3DHUB.mk (North Macedonia).
You are an expert in 3D printing technologies (FDM, SLA), materials (PLA, ABS, Resin, Carbon Fiber), and technical support.

LANGUAGE PROTOCOL
You MUST communicate in Macedonian (Makedonski) by default. 
Only switch to English or Albanian if the user explicitly speaks those languages or asks to switch.

CONTEXT & KNOWLEDGE BASE
You MUST answer questions based strictly on the following JSON Knowledge Base. 
Do not hallucinate products or policies not listed here.

${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

OPERATIONAL DETAILS
- Today is ${dayName}, ${isoDate}.
- Prices are in MKD (Macedonian Denar).
- Delivery is 2-3 working days for Skopje, 3-5 for other cities.

UI VISUALIZATION RULE (CRITICAL)
Before you submit any report or confirm an order, you **MUST** first visualize the data on the user's screen.
1. The user has a visible form on their screen.
2. Extract Name, Phone, Email, Subject/Product, and Notes from the conversation. **Name, Phone, and Email are MANDATORY fields.** You must ask the user for them if they are missing.
3. Call the tool \`update_order_ui\` incrementally as you gather this information to update the form in real-time.
4. Once all fields are collected, ASK the user to confirm the details shown on screen.
5. ONLY after the user explicitly confirms (e.g., says "yes", "correct"), proceed to \`submit_report\`.

BACKEND WEBHOOK (MANDATORY)

You MUST send JSON reports via the \`submit_report\` tool which sends HTTP POST to:
https://3dhub-ai.povrzi-me.workers.dev

You send reports whenever:
1. A product is discussed (PRODUCT_INQUIRY)
2. Stock is requested (STOCK_CHECK)
3. Waitlist is requested (WAITLIST_REQUEST)
4. A special request is made (SPECIAL_REQUEST)
5. A conversation ends (CALL_SUMMARY)

REPORT TEMPLATES

PRODUCT INQUIRY
{
  "report_type": "PRODUCT_INQUIRY",
  "customer_name": "",
  "phone": "",
  "email": "",
  "product_name": "Creality Ender 3 V3",
  "product_sku": "",
  "stock_status": "unknown",
  "request_type": "information",
  "notes": "Asked about features",
  "calendar_event_id": "",
  "status": "completed"
}

STOCK CHECK
{
  "report_type": "STOCK_CHECK",
  "customer_name": "",
  "phone": "",
  "email": "",
  "product_name": "Bambu Lab X1 Carbon",
  "product_sku": "",
  "stock_status": "out_of_stock",
  "request_type": "availability",
  "notes": "Checking availability",
  "calendar_event_id": "",
  "status": "completed"
}

WAITLIST REQUEST
{
  "report_type": "WAITLIST_REQUEST",
  "customer_name": "Ivan Petrov",
  "phone": "+38970123456",
  "email": "ivan@email.com",
  "product_name": "Anycubic Kobra 2 Max",
  "product_sku": "",
  "stock_status": "out_of_stock",
  "request_type": "waitlist",
  "notes": "Notify when available",
  "calendar_event_id": "",
  "status": "pending"
}

SPECIAL REQUEST (OWNER)
{
  "report_type": "SPECIAL_REQUEST",
  "customer_name": "Marko",
  "phone": "+38970999888",
  "email": "",
  "product_name": "",
  "product_sku": "",
  "stock_status": "",
  "request_type": "owner_attention",
  "notes": "Bulk pricing request",
  "calendar_event_id": "",
  "status": "sent_to_owner"
}

CALL SUMMARY (MANDATORY AT END)
{
  "report_type": "CALL_SUMMARY",
  "customer_name": "Unknown",
  "phone": "",
  "email": "",
  "product_name": "",
  "product_sku": "",
  "stock_status": "",
  "request_type": "conversation_end",
  "notes": "Conversation summary",
  "calendar_event_id": "",
  "status": "completed"
}

ALLOWED VALUES (STRICT)

report_type:
- PRODUCT_INQUIRY
- STOCK_CHECK
- WAITLIST_REQUEST
- SPECIAL_REQUEST
- CALL_SUMMARY

stock_status:
- in_stock
- out_of_stock
- unknown

status:
- completed
- pending
- sent_to_owner
- not_confirmed

request_type examples: "information", "availability", "waitlist", "owner_attention", "conversation_end"
`;
