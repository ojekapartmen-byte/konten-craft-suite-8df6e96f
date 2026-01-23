import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentRequest {
  templateId: string;
  tone: string;
  duration: number;
  outputFormat: string;
  fieldValues: Record<string, string | string[]>;
  brandVoice: {
    targetAudience: { age: string; location: string; segment: string };
    goal: string;
    brandName: string;
    doWords: string[];
    dontWords: string[];
    glossary: { term: string; definition: string }[];
  };
  productionOptions: {
    includeCaption: boolean;
    includeHashtags: boolean;
    includeOnScreenText: boolean;
    includeShotList: boolean;
    includeSubtitleFriendly: boolean;
  };
  templateStructure: { id: string; name: string; timing?: string; description: string }[];
}

const buildSystemPrompt = (req: ContentRequest): string => {
  const { templateId, tone, duration, outputFormat, brandVoice, productionOptions, templateStructure } = req;

  const toneDescriptions: Record<string, string> = {
    'formal': 'formal, baku, profesional',
    'semi-formal': 'sopan tapi santai, tidak kaku',
    'santai': 'bahasa sehari-hari, friendly, conversational',
    'genz': 'gaul, kekinian, pakai slang Gen Z Indonesia, viral-ready',
    'corporate': 'bisnis, profesional, meyakinkan, cocok untuk presentasi',
    'jurnalistik': 'netral, faktual, objektif, informatif seperti berita',
  };

  const formatDescriptions: Record<string, string> = {
    'paragraf': 'teks mengalir dalam paragraf',
    'bullet': 'poin-poin terpisah dengan bullet points',
    'dialog': 'format percakapan/dialog',
    'scene-by-scene': 'per adegan dengan deskripsi visual',
  };

  let systemPrompt = `Kamu adalah penulis konten profesional Indonesia. 

ATURAN WAJIB:
1. SELURUH output HARUS dalam Bahasa Indonesia yang baik dan benar
2. DILARANG menggunakan bahasa Inggris, lorem ipsum, atau placeholder
3. DILARANG mencampur bahasa Indonesia dan Inggris kecuali diminta
4. Gunakan gaya bahasa: ${toneDescriptions[tone] || 'santai'}
5. Format output: ${formatDescriptions[outputFormat] || 'bullet'}
6. Durasi target: ${duration} detik (sekitar ${Math.round((duration / 60) * 140)} kata)

STRUKTUR KONTEN yang harus diikuti:
${templateStructure.map((s, i) => `${i + 1}. ${s.name}${s.timing ? ` (${s.timing})` : ''}: ${s.description}`).join('\n')}
`;

  if (brandVoice.targetAudience.age || brandVoice.targetAudience.location || brandVoice.targetAudience.segment) {
    systemPrompt += `\nTARGET AUDIENS:
- Usia: ${brandVoice.targetAudience.age || 'umum'}
- Lokasi: ${brandVoice.targetAudience.location || 'Indonesia'}
- Segmen: ${brandVoice.targetAudience.segment || 'umum'}
`;
  }

  if (brandVoice.goal) {
    systemPrompt += `\nTUJUAN KONTEN: ${brandVoice.goal}\n`;
  }

  if (brandVoice.brandName) {
    systemPrompt += `\nNAMA BRAND/PRODUK: ${brandVoice.brandName} (wajib disebutkan dalam konten)\n`;
  }

  if (brandVoice.doWords.length > 0) {
    systemPrompt += `\nKATA YANG WAJIB DIPAKAI: ${brandVoice.doWords.join(', ')}\n`;
  }

  if (brandVoice.dontWords.length > 0) {
    systemPrompt += `\nKATA YANG HARUS DIHINDARI: ${brandVoice.dontWords.join(', ')}\n`;
  }

  if (brandVoice.glossary.length > 0) {
    systemPrompt += `\nKAMUS ISTILAH (gunakan konsisten):
${brandVoice.glossary.map(g => `- ${g.term}: ${g.definition}`).join('\n')}
`;
  }

  systemPrompt += `\nFORMAT OUTPUT:
Berikan output dalam format JSON dengan struktur berikut:
{
  "mainScript": "Script utama lengkap sesuai struktur",
  ${productionOptions.includeCaption ? '"caption": "Caption untuk posting sosmed",' : ''}
  ${productionOptions.includeHashtags ? '"hashtags": ["array", "hashtag", "relevan"],' : ''}
  ${productionOptions.includeOnScreenText ? '"onScreenText": ["array", "teks", "yang muncul di layar"],' : ''}
  ${productionOptions.includeShotList ? '"shotList": ["array", "saran visual/B-roll"],' : ''}
  ${productionOptions.includeSubtitleFriendly ? '"subtitleFriendly": "Versi kalimat pendek-pendek untuk subtitle"' : ''}
}

PENTING: Pastikan JSON valid dan semua string dalam Bahasa Indonesia.`;

  return systemPrompt;
};

const buildUserPrompt = (req: ContentRequest): string => {
  const { templateId, fieldValues } = req;

  let prompt = `Buatkan konten dengan detail berikut:\n`;

  for (const [key, value] of Object.entries(fieldValues)) {
    if (Array.isArray(value)) {
      prompt += `\n${key}:\n${value.map((v, i) => `${i + 1}. ${v}`).join('\n')}`;
    } else if (value) {
      prompt += `\n${key}: ${value}`;
    }
  }

  const templateNames: Record<string, string> = {
    'tiktok-60s': 'Video Script 60 Detik untuk TikTok/Reels',
    'reels-30s': 'Reels 30 Detik untuk Instagram',
    'youtube-3m': 'Script YouTube 3-5 Menit',
    'jurnalistik-90s': 'Script Jurnalistik 90 Detik',
    'umkm-soft-sell': 'Script Soft Selling UMKM',
    'carousel-ig': 'Carousel Instagram 7 Slide',
    'voiceover-dokumenter': 'Voice Over Dokumenter',
    'presentasi': 'Script Presentasi',
  };

  prompt += `\n\nTipe template: ${templateNames[templateId] || templateId}`;

  return prompt;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentRequest: ContentRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating content for template:", contentRequest.templateId);
    console.log("Tone:", contentRequest.tone);
    console.log("Duration:", contentRequest.duration);

    const systemPrompt = buildSystemPrompt(contentRequest);
    const userPrompt = buildUserPrompt(contentRequest);

    console.log("System prompt length:", systemPrompt.length);
    console.log("User prompt:", userPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit tercapai. Coba lagi dalam beberapa menit." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit habis. Silakan tambah kredit di workspace Anda." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Try to parse as JSON
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.log("Failed to parse as JSON, using raw content");
      // If not valid JSON, wrap the content
      parsedContent = {
        mainScript: content,
      };
    }

    console.log("Content generated successfully");

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
