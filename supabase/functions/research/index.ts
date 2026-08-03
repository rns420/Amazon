import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ResearchRequest {
  type: "market" | "niche" | "keyword" | "competition";
  query: string;
  category?: string;
  country?: string;
  bookType?: string;
  audience?: string;
}

function buildPrompt(req: ResearchRequest): string {
  const { type, query, category, country, bookType, audience } = req;

  if (type === "market") {
    return `You are an expert Amazon KDP market research analyst. Analyze the Amazon Kindle Direct Publishing marketplace for the category "${query}" in ${country ?? "United States"}.

Provide a comprehensive market analysis as a JSON object with this exact structure:
{
  "avgPrice": <number in USD>,
  "opportunityScore": <0-100>,
  "difficultyScore": <0-100>,
  "estMonthlyRevenue": <number in USD>,
  "bestSellers": [
    { "title": "<realistic bestselling book title>", "price": "$<X.XX>", "reviews": <number>, "bsr": "#<number>", "estSales": <number per month>, "rating": <1-5> }
  ],
  "gaps": [
    { "area": "<gap area name>", "detail": "<description of the underserved area>", "opportunity": "<high|medium|low>" }
  ],
  "trends": [
    { "trend": "<trend name>", "direction": "<growing|stable|declining>", "detail": "<description>" }
  ],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}

Base your analysis on real Amazon KDP marketplace knowledge for the "${query}" category. Include 5 bestsellers and 4 gap analysis items. Return ONLY the JSON, no other text.`;
  }

  if (type === "niche") {
    return `You are an expert Amazon KDP niche research analyst. Find profitable niches related to "${query}" for ${bookType ?? "puzzle book"} publishing on Amazon KDP.

Consider these factors: demand level, competition level, profitability, trend direction, and overall opportunity score.

Provide your analysis as a JSON object with this exact structure:
{
  "niches": [
    {
      "name": "<specific niche name>",
      "demand": "<High|Medium|Low>",
      "competition": "<High|Medium|Low>",
      "profitability": "<High|Medium|Low>",
      "trend": "<Growing|Stable|Declining|Emerging>",
      "score": <0-100>,
      "bookType": "<Puzzle Book|Coloring Book|Activity Book|Mixed Book>",
      "reasoning": "<1-2 sentence explanation of why this niche is attractive>",
      "targetAudience": "<specific audience description>",
      "suggestedPageCount": <number>,
      "suggestedPriceRange": "$<min> - $<max>"
    }
  ]
}

Return at least 8 niche ideas. Return ONLY the JSON, no other text.`;
  }

  if (type === "keyword") {
    return `You are an expert Amazon KDP keyword research specialist. Research keywords for a ${bookType ?? "puzzle book"} about "${query}" targeting ${audience ?? "adult"} readers on Amazon.

Provide keyword analysis as a JSON object with this exact structure:
{
  "keywords": [
    {
      "keyword": "<the keyword phrase>",
      "type": "<Primary|Secondary|Long-tail|Backend>",
      "difficulty": <0-100>,
      "intent": "<Commercial|Informational|Transactional|Navigational>",
      "volume": "<estimated monthly searches, e.g. '12,000/mo'>",
      "relevance": <0-100>,
      "recommendation": "<Use as main|Use in subtitle|Use as backend keyword|Skip>"
    }
  ],
  "recommendations": {
    "primaryKeyword": "<best primary keyword>",
    "titleKeywords": ["<keywords to include in title>"],
    "subtitleKeywords": ["<keywords for subtitle>"],
    "backendKeywords": ["<7 backend keywords for KDP>"]
  }
}

Return at least 12 keywords covering all types. Return ONLY the JSON, no other text.`;
  }

  if (type === "competition") {
    return `You are an expert Amazon KDP competition analyst. Analyze the competition for "${query}" in the ${category ?? "Puzzles & Games"} category on Amazon KDP.

Provide competition analysis as a JSON object with this exact structure:
{
  "competitors": [
    {
      "title": "<realistic competitor book title>",
      "price": "$<X.XX>",
      "reviews": <number>,
      "rating": <1-5>,
      "bsr": "#<number>",
      "strengths": ["<strength 1>", "<strength 2>"],
      "weaknesses": ["<weakness 1>", "<weakness 2>"],
      "differentiation": "<how to differentiate from this competitor>"
    }
  ],
  "marketGaps": [
    { "gap": "<description>", "opportunity": "<High|Medium|Low>" }
  ],
  "pricingAnalysis": {
    "lowEnd": "$<X.XX>",
    "highEnd": "$<X.XX>",
    "sweetSpot": "$<X.XX>",
    "recommendation": "<pricing recommendation>"
  },
  "differentiationStrategies": ["<strategy 1>", "<strategy 2>", "<strategy 3>"]
}

Return 5 competitors. Return ONLY the JSON, no other text.`;
  }

  return "Invalid research type.";
}

async function callAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("AI API key not configured");

  const baseUrl = Deno.env.get("ANTHROPIC_BASE_URL") ?? "https://api.anthropic.com";
  const model = Deno.env.get("ANTHROPIC_SMALL_FAST_MODEL") ?? "claude-3-5-sonnet-20241022";

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("AI returned empty response");

  return text;
}

function extractJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("AI response does not contain valid JSON");
  const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonStr);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ResearchRequest = await req.json();
    if (!body.type || !body.query) {
      return new Response(JSON.stringify({ error: "Missing required fields: type and query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(body);
    const aiResponse = await callAI(prompt);
    const result = extractJSON(aiResponse);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);

      if (userData?.user) {
        await supabase.from("research_results").insert({
          user_id: userData.user.id,
          research_type: body.type,
          query: body.query,
          result,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
