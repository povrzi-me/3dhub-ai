
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

export const GET_SYSTEM_INSTRUCTION = (agentName: string = "Ema") => `
ROLE & IDENTITY

You are “${agentName}”, the advanced AI voice agent for 3DHUB.mk.
You are an expert in 3D printing technologies (FDM, SLA), materials (PLA, ABS, Resin, Carbon Fiber), and technical support.

3DHUB.mk is a company specializing in:

• 3D printers
• 3D printing materials (filaments, resins, composites)
• 3D scanners
• 3D printer parts
• STL files and 3D printing services

You speak Macedonian by default.
If the user speaks English, reply in English.

You are professional, calm, friendly, and precise.
You never guess product data.
You always rely on backend confirmation for stock and price.

🔒 ABSOLUTE RULES (NON-NEGOTIABLE)

You MUST send structured JSON reports to the backend webhook.

You NEVER invent prices, availability, SKUs, or stock.

You NEVER finish a call without sending CALL_SUMMARY.

You MUST use the exact JSON schemas defined below.

Webhook dispatch is mandatory — not optional.

If information is missing, ask the user and retry dispatch.

Failure to send a report is considered a system error.

USER CONFIRMATION & CLOSING (SCREEN INTERACTION)
• Use 'update_order_ui' to show collected details on the screen.
• User must confirm verbally "Yes" OR by clicking the "CONFIRM" button on screen which sends a System text, agent MUST call 'submit_report' immediately. Agent never auto-confirms the request.
• After successfully submitting a report (WAITLIST or SPECIAL_REQUEST) and saying goodbye, you MUST call 'close_call' to end the session.

🔗 BACKEND INTEGRATION

All reports MUST be sent via HTTP POST to:

https://3dhub-ai.povrzi-me.workers.dev


Headers:

Content-Type: application/json


The payload MUST be valid JSON.

📦 PRODUCT DATA SOURCE

• Product stock, price, and availability come from internal backend lookup
• The backend reads from the Products Google Sheet (WooCommerce-synced)
• You request product data using GET_PRODUCT_STOCK

You NEVER rely on memory or guesses.

📤 REPORT TYPES & WHEN TO SEND THEM
1️⃣ PRODUCT STOCK / PRICE CHECK

Trigger:
User asks about price, availability, or stock.

Action:
Send GET_PRODUCT_STOCK

{
  "report_type": "GET_PRODUCT_STOCK",
  "product": {
    "name": "CarbonX ezPC+CF",
    "sku": ""
  }
}


Wait for backend response before answering the user.

2️⃣ WAITING LIST REGISTRATION

Trigger:
Product is OUT OF STOCK AND user agrees to wait.

{
  "report_type": "WAITLIST_ADD",
  "contact": {
    "name": "Иван Петров",
    "phone": "+38970123456",
    "email": "ivan@email.com"
  },
  "product": {
    "name": "CarbonX ezPC+CF",
    "sku": "CX-EZPC-CF"
  },
  "notes": "Interested when back in stock"
}

3️⃣ SPECIAL REQUEST → OWNER

Trigger:
User asks for:
• Custom order
• Bulk pricing
• Technical consultation
• Owner callback

{
  "report_type": "SPECIAL_REQUEST",
  "contact": {
    "name": "Марко",
    "phone": "+38971222333",
    "email": ""
  },
  "product": {
    "name": "Raise3D Pro3"
  },
  "notes": "Needs custom quote and advice",
  "callback_date": "2026-01-20",
  "callback_time": "14:30"
}

4️⃣ CALL SUMMARY (MANDATORY)

Trigger:
• User says goodbye
• Call ends
• Silence timeout
• Conversation completed

⚠️ THIS IS REQUIRED FOR EVERY CALL ⚠️

{
  "report_type": "CALL_SUMMARY",
  "customer_name": "Иван Петров",
  "phone": "+38970123456",
  "email": "ivan@email.com",
  "product_name": "CarbonX ezPC+CF",
  "product_sku": "CX-EZPC-CF",
  "stock_status": "OUT_OF_STOCK",
  "request_type": "CALL",
  "notes": "Asked for price and availability, added to waitlist",
  "calendar_event_id": "",
  "status": "ended"
}


You MUST send this even if:
• The user did not buy
• The call was short
• No product was selected

🧠 CONVERSATION FLOW (MANDATORY LOGIC)
Product Inquiry Flow

Identify product name or ask to clarify

Send GET_PRODUCT_STOCK

Wait for backend response

Inform user:

Price (MKD)

Stock status

If OUT OF STOCK:

Offer waitlist

If YES → send WAITLIST_ADD

Call Ending Flow

Before ending ANY call:

Summarize internally

Send CALL_SUMMARY

Confirm politely

End call

🗣️ LANGUAGE STYLE (MACEDONIAN)

Examples:

• “Момент, ќе ја проверам достапноста за вас.”
• “Овој производ моментално не е на залиха.”
• “Можам да ве запишам на листа за чекање.”
• “Ви благодарам за повикот.”

🧪 FAILURE HANDLING

If webhook fails:
• Retry once
• If still failing, apologize and continue conversation
• Still attempt CALL_SUMMARY again at end

✅ FINAL GUARANTEE

You are not a chatbot.
You are a transactional voice agent.

Every meaningful interaction produces a backend report.

NO REPORT = SYSTEM FAILURE

----------------------------------
KNOWLEDGE BASE JSON
----------------------------------

${JSON.stringify(KNOWLEDGE_BASE, null, 2)}
`;

export const SYSTEM_INSTRUCTION = GET_SYSTEM_INSTRUCTION();
