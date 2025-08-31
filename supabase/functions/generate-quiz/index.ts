
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
    console.log('Generate quiz function called');
    const { topics, difficulty, numQuestions } = await req.json();
    console.log('Request payload:', { topics, difficulty, numQuestions });

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      console.error('Topics validation failed:', topics);
      throw new Error('Topics are required');
    }

    if (!difficulty || !['low', 'medium', 'high'].includes(difficulty)) {
      console.error('Difficulty validation failed:', difficulty);
      throw new Error('Valid difficulty level is required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('Gemini API key exists:', !!geminiApiKey);
    if (!geminiApiKey) {
      console.error('Gemini API key not found in environment');
      throw new Error('Gemini API key not configured');
    }

    // Create difficulty-specific prompts
    const difficultyPrompts = {
      low: 'Create basic, fundamental questions suitable for beginners. Focus on simple concepts and definitions.',
      medium: 'Create intermediate-level questions that require some understanding and application of concepts.',
      high: 'Create advanced questions that require deep understanding, critical thinking, and complex problem-solving.'
    };

    const prompt = `Generate a quiz with exactly ${numQuestions} multiple choice questions about: ${topics.join(', ')}.

Difficulty level: ${difficulty} - ${difficultyPrompts[difficulty]}

Return ONLY a valid JSON object in this exact format (no markdown, no backticks, no extra text):

{
  "title": "Quiz Title",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation of the correct answer",
      "topic": "${topics[0]}"
    }
  ]
}

Requirements:
- Exactly ${numQuestions} questions
- Each question must have exactly 4 options
- correctIndex must be 0, 1, 2, or 3
- Include clear explanations
- Questions should be relevant to the selected topics
- Match the ${difficulty} difficulty level`;

    console.log('Calling Gemini API with prompt:', prompt);

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', geminiData);

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    let responseText = geminiData.candidates[0].content.parts[0].text;
    console.log('Raw Gemini text:', responseText);

    // Clean up the response - remove markdown backticks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let quiz;
    try {
      quiz = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse quiz JSON from Gemini');
    }

    // Validate the quiz structure
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Invalid quiz format: missing questions array');
    }

    // Ensure each question has the required structure
    quiz.questions = quiz.questions.map((q, index) => ({
      id: index + 1,
      question: q.question || 'Question not available',
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 ? q.correctIndex : 0,
      explanation: q.explanation || 'Explanation not available',
      topic: q.topic || topics[0],
      difficulty: difficulty
    }));

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the quiz into the database
    const { data: quizData, error: insertError } = await supabase
      .from('quizzes')
      .insert({
        topic: topics.join(', '),
        questions: quiz.questions
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save quiz: ${insertError.message}`);
    }

    console.log('Quiz saved successfully:', quizData.id);

    return new Response(
      JSON.stringify({
        success: true,
        quizId: quizData.id,
        quiz: {
          ...quiz,
          id: quizData.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
