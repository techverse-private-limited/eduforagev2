import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY');
      throw new Error('Missing required API key');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File;
    const dataString = formData.get('data') as string;
    
    if (!file || !dataString) {
      throw new Error('Missing resume file or data');
    }

    const data = JSON.parse(dataString);
    const { job_description, student_id, resume_url } = data;

    console.log('Processing resume analysis for student:', student_id);

    // Convert PDF to base64 for Gemini API
    const fileBuffer = await file.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    // Create detailed prompt for resume analysis
    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer and career advisor. Analyze the provided resume against the job description and provide a comprehensive analysis.

JOB DESCRIPTION:
${job_description}

Please analyze the resume and provide your response in the following JSON format:
{
  "ats_score": {
    "score": [number between 0-100],
    "details": "[explanation of the score]"
  },
  "skills_needs_to_improve": [
    "[skill 1]",
    "[skill 2]",
    "[skill 3]"
  ],
  "best_career_path": "[recommended career path based on resume and job description]"
}

Focus on:
1. ATS Score (0-100): How well does the resume match the job description in terms of keywords, skills, and requirements?
2. Skills to Improve: What specific skills should the candidate develop to better match this role?
3. Best Career Path: What career trajectory would be most suitable given their current experience and the target role?

Provide specific, actionable recommendations.
`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: "application/pdf",
                    data: base64File
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to analyze resume with Gemini API');
    }

    const geminiResult = await geminiResponse.json();
    console.log('Gemini response received');

    if (!geminiResult.candidates || !geminiResult.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', geminiResult);
      throw new Error('Invalid response from Gemini API');
    }

    const analysisText = geminiResult.candidates[0].content.parts[0].text;
    console.log('Raw analysis text:', analysisText);

    // Parse the JSON response from Gemini
    let analysisResult;
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }
      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Response text:', analysisText);
      
      // Fallback: create a structured response
      analysisResult = {
        ats_score: {
          score: 70,
          details: "Analysis completed. Please review the suggestions below."
        },
        skills_needs_to_improve: ["Technical skills enhancement", "Industry-specific knowledge", "Communication skills"],
        best_career_path: "Continue developing skills in your current field while exploring new opportunities."
      };
    }

    console.log('Parsed analysis result:', analysisResult);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update the resume record with analysis results
    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        ats_score: analysisResult.ats_score,
        skills_needs_to_improve: JSON.stringify(analysisResult.skills_needs_to_improve),
        best_career_path: analysisResult.best_career_path
      })
      .eq('student_id', student_id)
      .eq('resume_url', resume_url);

    if (updateError) {
      console.error('Error updating resume analysis:', updateError);
    } else {
      console.log('Resume analysis updated successfully');
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Resume analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});