import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchemeRequest {
  state: string;
  monthlyConsumption?: number;
  category?: string;
}

interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicableStates: string[];
  category: 'subsidy' | 'free_electricity' | 'solar' | 'discount';
  sourceLink?: string;
  lastUpdated: string;
  isActive: boolean;
  applicationProcess?: string;
  deadline?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state = 'All India', monthlyConsumption, category }: SchemeRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Fetching government schemes for state:', state, 'consumption:', monthlyConsumption);

    const currentDate = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are an expert on Indian government electricity schemes, subsidies, and benefits. Your knowledge is current as of January 2025.

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "schemes": [
    {
      "id": "unique-scheme-id",
      "name": "Official scheme name",
      "description": "Detailed description of the scheme (2-3 sentences)",
      "eligibility": ["eligibility criteria 1", "eligibility criteria 2", "criteria 3"],
      "benefits": "Clear statement of what benefits the user gets",
      "applicableStates": ["State1", "State2"] or ["All India"],
      "category": "subsidy" | "free_electricity" | "solar" | "discount",
      "sourceLink": "official government website if known",
      "lastUpdated": "${currentDate}",
      "isActive": true,
      "applicationProcess": "Brief steps to apply",
      "deadline": "Application deadline if any, or 'Ongoing'"
    }
  ],
  "eligibilityNotes": "Personalized notes about which schemes are most relevant for this user"
}

Focus on REAL, CURRENTLY ACTIVE government schemes. Include:
1. Central government schemes (PM Surya Ghar, PM-KUSUM, MNRE schemes)
2. State-specific schemes for the requested state
3. Subsidy programs for domestic consumers
4. Solar rooftop incentives
5. Free electricity schemes (if applicable to the state)
6. Agricultural electricity schemes
7. Time-of-day tariff benefits

Be accurate about eligibility criteria and benefits. If unsure about a scheme's current status, mark isActive as false.`;

    const userPrompt = `Find all current electricity-related government schemes, subsidies, and benefits available for:
- State: ${state}
${monthlyConsumption ? `- Average Monthly Consumption: ${monthlyConsumption} kWh/units` : ''}
${category ? `- Focus on category: ${category}` : ''}

Include both central government schemes applicable across India and state-specific schemes for ${state}.
${monthlyConsumption ? `Highlight schemes where the user's consumption of ${monthlyConsumption} units makes them eligible for maximum benefits.` : ''}

Return at least 8-12 relevant schemes with accurate details. Focus on schemes that are currently accepting applications or providing benefits.`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a few moments.',
          fallback: true 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Service temporarily unavailable. Please try again later.',
          fallback: true 
        }), {
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse schemes data');
    }

    // Add metadata
    parsedContent.fetchedAt = new Date().toISOString();
    parsedContent.state = state;
    parsedContent.source = 'ai-powered-live-update';

    console.log(`Found ${parsedContent.schemes?.length || 0} schemes for ${state}`);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-government-schemes function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to fetch schemes',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
