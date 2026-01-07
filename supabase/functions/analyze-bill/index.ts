import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  imageBase64: string;
  language: 'english' | 'hindi' | 'tamil' | 'telugu' | 'marathi' | 'bengali';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language = 'english' }: AnalysisRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing bill analysis request with language:', language);

    const languageInstructions = {
      english: 'Provide the explanation in English with some Hinglish phrases for better understanding.',
      hindi: 'Provide the explanation primarily in Hindi (Devanagari script) with simple language that a common person can understand.',
      tamil: 'Provide the explanation primarily in Tamil (தமிழ்) script with simple language.',
      telugu: 'Provide the explanation primarily in Telugu (తెలుగు) script with simple language.',
      marathi: 'Provide the explanation primarily in Marathi (मराठी) script with simple language.',
      bengali: 'Provide the explanation primarily in Bengali (বাংলা) script with simple language.'
    };

    const systemPrompt = `You are an expert Indian electricity bill analyzer. Your job is to:
1. Extract key information from electricity bills (OCR the image)
2. Explain the bill in simple terms that common Indian households can understand
3. Identify why the bill might be high or low
4. Provide practical savings tips specific to Indian households

${languageInstructions[language]}

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "billData": {
    "billingMonth": "extracted billing month",
    "totalUnits": number,
    "totalAmount": number,
    "previousUnits": number or 0 if not visible,
    "previousAmount": number or 0 if not visible,
    "tariffCategory": "tariff category if visible",
    "consumerNumber": "masked consumer number",
    "dueDate": "due date if visible"
  },
  "aiExplanation": {
    "summary": "Brief summary of the bill in 2-3 sentences",
    "hinglishExplanation": "Detailed explanation in the requested language about why the bill is this amount, what factors contribute to it",
    "factors": ["factor 1", "factor 2", "factor 3", "factor 4"]
  },
  "nextBillEstimate": {
    "estimatedUnits": number,
    "estimatedAmount": number,
    "methodology": "Brief explanation of estimation method",
    "confidence": "low" | "medium" | "high"
  },
  "savingsTips": [
    {
      "id": "1",
      "icon": "emoji",
      "title": "Tip title",
      "description": "Detailed tip description",
      "potentialSavings": "₹XXX-XXX/month"
    }
  ]
}

If you cannot read parts of the bill, make reasonable estimates based on visible information and Indian electricity pricing patterns.`;

    const userPrompt = `Please analyze this electricity bill image and extract all the information. The bill is from India. Provide analysis in ${language} language.`;

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
    console.log('AI response received successfully');
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
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
