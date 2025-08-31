import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const mindmapApiKey = Deno.env.get('GEMINI_MINDMAP_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!geminiApiKey || !mindmapApiKey) {
      throw new Error('Missing required API keys');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await req.formData();
    const file = formData.get('file_upload') as File;
    const userId = formData.get('user_id') as string;

    if (!file || !userId) {
      throw new Error('Missing file or user ID');
    }

    console.log('Processing file:', file.name, 'for user:', userId);

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    // Determine MIME type
    const mimeType = file.type;
    console.log('File MIME type:', mimeType);

    // Prepare the request for Gemini API
    const prompt = `Please analyze this document and provide:
1. A comprehensive summary broken into 3-5 key sections
2. Main topics covered
3. Important insights and takeaways
4. Action items or next steps (if applicable)

Please format your response as JSON with the following structure:
{
  "title": "Document Title or Main Topic",
  "summary": "Overall summary in 2-3 sentences",
  "sections": [
    "First key section summary",
    "Second key section summary",
    "Third key section summary"
  ],
  "topics": ["topic1", "topic2", "topic3"],
  "insights": ["insight1", "insight2", "insight3"],
  "actionItems": ["action1", "action2"]
}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    };

    console.log('Sending request to Gemini API...');
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    let analysisResult;
    try {
      const rawContent = geminiData.candidates[0].content.parts[0].text;
      console.log('Raw Gemini response:', rawContent);
      
      // Clean the response to extract JSON
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON structure found
        analysisResult = {
          title: "Document Summary",
          summary: rawContent.substring(0, 200) + "...",
          sections: [rawContent],
          topics: ["General"],
          insights: ["Document processed successfully"],
          actionItems: ["Review the summary"]
        };
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      const rawContent = geminiData.candidates[0].content.parts[0].text;
      analysisResult = {
        title: "Document Summary",
        summary: rawContent.substring(0, 200) + "...",
        sections: [rawContent],
        topics: ["General"],
        insights: ["Document processed successfully"],
        actionItems: ["Review the summary"]
      };
    }

    // Generate mind map using the second API key
    console.log('Generating mind map...');
    const mindmapPrompt = `Create a mind map structure for this content. Return a JSON object with nodes and connections suitable for visualization:
    
    Title: ${analysisResult.title}
    Topics: ${analysisResult.topics.join(', ')}
    Key Sections: ${analysisResult.sections.join(' | ')}
    
    Format as:
    {
      "centralNode": "Main Topic",
      "branches": [
        {
          "name": "Branch Name",
          "children": ["child1", "child2", "child3"]
        }
      ]
    }`;

    const mindmapPayload = {
      contents: [
        {
          parts: [{ text: mindmapPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    };

    const mindmapResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${mindmapApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mindmapPayload),
      }
    );

    let mindmapData = null;
    if (mindmapResponse.ok) {
      const mindmapResult = await mindmapResponse.json();
      try {
        const mindmapContent = mindmapResult.candidates[0].content.parts[0].text;
        const mindmapJson = mindmapContent.match(/\{[\s\S]*\}/);
        if (mindmapJson) {
          mindmapData = JSON.parse(mindmapJson[0]);
        }
      } catch (mindmapError) {
        console.error('Error parsing mindmap:', mindmapError);
      }
    }

    // Store in database
    const summaryText = analysisResult.sections.join('\n\n');
    const { error: dbError } = await supabase
      .from('ai_summarizer')
      .insert({
        student_id: userId,
        text: summaryText
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Return the complete analysis
    const response = {
      success: true,
      data: {
        ...analysisResult,
        mindmap: mindmapData,
        text: summaryText
      }
    };

    console.log('Analysis completed successfully');
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in document-summarizer function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process document'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});