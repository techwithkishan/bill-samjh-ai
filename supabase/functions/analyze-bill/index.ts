import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to trusted domains only
const ALLOWED_ORIGINS = [
  'https://billsamajh.lovable.app',
  'https://lovable.dev',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovable.dev')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

type BillType = 'electricity' | 'water' | 'mobile' | 'internet';

interface AnalysisRequest {
  imageBase64: string;
  language: 'english' | 'hindi' | 'tamil' | 'telugu' | 'marathi' | 'bengali';
  billType: BillType;
}

const getBillTypePrompt = (billType: BillType): string => {
  const prompts: Record<BillType, string> = {
    electricity: `You are analyzing an ELECTRICITY BILL from India. Extract:
- Units consumed (kWh)
- Total amount payable
- Previous month units and amount
- Tariff category (Domestic/Commercial/Industrial)
- Fixed charges, energy charges, taxes
- Meter reading dates
- Consumer number (mask last 4 digits)
- Due date

Key factors to explain: Peak hour usage, slab-based pricing, power factor penalties, meter rent, fuel surcharge.
Savings tips should focus on: AC/heater optimization, LED lighting, appliance efficiency, solar options.`,

    water: `You are analyzing a WATER BILL from India. Extract:
- Water usage in Kiloliters (KL) or Liters
- Total amount payable
- Previous month usage and amount
- Connection type (Domestic/Commercial)
- Fixed charges, volumetric charges
- Sewerage charges (if applicable)
- Consumer/Connection number (mask last 4 digits)
- Due date

Key factors to explain: Slab-based water tariff, sewerage charges, minimum charges, arrears.
Savings tips should focus on: Fixing leaks, rainwater harvesting, efficient fixtures, recycling greywater.`,

    mobile: `You are analyzing a MOBILE/PHONE BILL from India. Extract:
- Data used (GB)
- Total amount payable
- Previous bill amount
- Plan/Tariff name
- Voice minutes used
- SMS count
- Roaming charges (if any)
- Additional services/VAS charges
- Mobile number (mask middle digits)
- Due date

Key factors to explain: Plan vs actual usage, data overage, roaming, VAS subscriptions, taxes.
Savings tips should focus on: Right plan selection, WiFi usage, monitoring data, removing VAS.`,

    internet: `You are analyzing an INTERNET/BROADBAND BILL from India. Extract:
- Data used (GB)
- Total amount payable
- Previous bill amount
- Plan name and speed
- Installation/equipment charges
- OTT bundle costs (if any)
- Customer ID (mask last 4 digits)
- Due date

Key factors to explain: Plan limits, FUP (Fair Usage Policy), speed tiers, equipment rental.
Savings tips should focus on: Right speed tier, annual plans, bundled offers, usage monitoring.`
  };

  return prompts[billType];
};

const getResponseStructure = (billType: BillType): string => {
  const baseStructure = `{
  "billData": {
    "billType": "${billType}",
    "billingMonth": "extracted billing month",
    "totalUnits": number (${billType === 'electricity' ? 'kWh' : billType === 'water' ? 'KL' : 'GB'}),
    "totalAmount": number,
    "previousUnits": number or 0,
    "previousAmount": number or 0,
    "tariffCategory": "plan or tariff name",
    "consumerNumber": "masked consumer/account number",
    "dueDate": "due date if visible"`;

  const typeSpecificFields: Record<BillType, string> = {
    electricity: `,
    "fixedCharges": number or 0,
    "energyCharges": number or 0,
    "taxes": number or 0`,
    water: `,
    "sewerageCharges": number or 0,
    "waterTaxes": number or 0`,
    mobile: `,
    "planName": "plan name",
    "dataLimit": number in GB,
    "talkTime": number in minutes,
    "smsCount": number`,
    internet: `,
    "planName": "plan name",
    "connectionSpeed": "speed in Mbps",
    "dataLimit": number in GB or null for unlimited`
  };

  return baseStructure + typeSpecificFields[billType] + `
  },
  "aiExplanation": {
    "summary": "Brief 2-3 sentence summary",
    "hinglishExplanation": "Detailed explanation in requested language",
    "factors": ["factor 1", "factor 2", "factor 3", "factor 4"]
  },
  "nextBillEstimate": {
    "estimatedUnits": number,
    "estimatedAmount": number,
    "methodology": "estimation method",
    "confidence": "low" | "medium" | "high"
  },
  "savingsTips": [
    {
      "id": "1",
      "icon": "relevant emoji",
      "title": "Tip title",
      "description": "Detailed tip",
      "potentialSavings": "₹XXX-XXX/month"
    }
  ]
}`;
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Verify origin for actual requests
  const isAllowedOrigin = origin && (
    ALLOWED_ORIGINS.includes(origin) || 
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovable.dev')
  );
  
  if (!isAllowedOrigin) {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({ error: 'Forbidden - Invalid origin' }), 
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { imageBase64, language = 'english', billType = 'electricity' }: AnalysisRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Processing ${billType} bill analysis request with language: ${language}`);

    const languageInstructions: Record<string, string> = {
      english: 'Provide the explanation in English with some Hinglish phrases for better understanding.',
      hindi: 'Provide the explanation primarily in Hindi (Devanagari script) with simple language.',
      tamil: 'Provide the explanation primarily in Tamil (தமிழ்) script with simple language.',
      telugu: 'Provide the explanation primarily in Telugu (తెలుగు) script with simple language.',
      marathi: 'Provide the explanation primarily in Marathi (मराठी) script with simple language.',
      bengali: 'Provide the explanation primarily in Bengali (বাংলা) script with simple language.'
    };

    const billTypeLabels: Record<BillType, string> = {
      electricity: 'electricity',
      water: 'water',
      mobile: 'mobile/phone',
      internet: 'internet/broadband'
    };

    const systemPrompt = `You are an expert Indian utility bill analyzer specializing in ${billTypeLabels[billType]} bills.

${getBillTypePrompt(billType)}

${languageInstructions[language]}

IMPORTANT: Return your response as a valid JSON object with this exact structure:
${getResponseStructure(billType)}

If you cannot read parts of the bill, make reasonable estimates based on visible information and Indian pricing patterns.`;

    const userPrompt = `Please analyze this ${billTypeLabels[billType]} bill image and extract all information. The bill is from India. Provide analysis in ${language} language.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
                } 
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`${billType} bill AI response received successfully`);
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    let parsedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
        // Ensure billType is set
        if (parsedContent.billData) {
          parsedContent.billData.billType = billType;
        }
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse bill analysis results');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-bill function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to analyze bill' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
