
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      })
    }

    const { message, conversationId, imageData } = await req.json()

    if (!message && !imageData) {
      return new Response('Message or image required', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Build Gemini API request
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`

    // Prepare content for Gemini
    const parts = []
    
    if (message) {
      parts.push({ text: message })
    }

    if (imageData) {
      // Extract base64 data and mime type
      const [mimeType, base64Data] = imageData.replace('data:', '').split(',')
      parts.push({
        inline_data: {
          mime_type: mimeType.replace(';base64', ''),
          data: base64Data
        }
      })
    }

    const geminiRequest = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    }

    console.log('Sending request to Gemini API...')
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.'

    // Create or get conversation
    let currentConversationId = conversationId

    if (!currentConversationId) {
      // Create a new conversation
      const { data: newConversation, error: convError } = await supabaseClient
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: message ? message.substring(0, 50) : 'Image Chat'
        })
        .select()
        .single()

      if (convError) {
        console.error('Error creating conversation:', convError)
        throw convError
      }

      currentConversationId = newConversation.id
    }

    // Save user message
    const { error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: 'user',
        content: message || '[Image uploaded]',
        image_url: imageData ? 'temp-image' : null // We'll handle image storage separately
      })

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      throw userMessageError
    }

    // Save AI response
    const { error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: 'assistant',
        content: aiResponse
      })

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError)
      throw aiMessageError
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        conversationId: currentConversationId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
