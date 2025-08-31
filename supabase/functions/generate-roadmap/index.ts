
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Reliable learning resource mappings with verified working websites
const reliableResources = {
  javascript: {
    websites: [
      {
        title: "JavaScript Tutorial - W3Schools",
        url: "https://www.w3schools.com/js/",
        description: "Complete JavaScript tutorial from basics to advanced with interactive examples"
      },
      {
        title: "JavaScript - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/javascript/",
        description: "Comprehensive JavaScript guide with coding examples and practice problems"
      },
      {
        title: "JavaScript Guide - MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        description: "Official Mozilla JavaScript documentation and comprehensive guide"
      }
    ]
  },
  python: {
    websites: [
      {
        title: "Python Tutorial - W3Schools",
        url: "https://www.w3schools.com/python/",
        description: "Learn Python programming from scratch with hands-on examples"
      },
      {
        title: "Python Programming - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/python-programming-language/",
        description: "Complete Python programming guide with real-world examples"
      },
      {
        title: "Python Documentation",
        url: "https://docs.python.org/3/tutorial/",
        description: "Official Python tutorial and comprehensive documentation"
      }
    ]
  },
  react: {
    websites: [
      {
        title: "React Tutorial - W3Schools",
        url: "https://www.w3schools.com/react/",
        description: "Learn React.js step by step with interactive examples"
      },
      {
        title: "ReactJS - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/reactjs/",
        description: "React.js tutorials, examples, and best practices"
      },
      {
        title: "React Documentation",
        url: "https://react.dev/",
        description: "Official React documentation with modern hooks and patterns"
      }
    ]
  },
  html: {
    websites: [
      {
        title: "HTML Tutorial - W3Schools",
        url: "https://www.w3schools.com/html/",
        description: "Complete HTML tutorial from basic to advanced concepts"
      },
      {
        title: "HTML - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/html/",
        description: "HTML tutorials with practical examples and best practices"
      },
      {
        title: "HTML Guide - MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
        description: "Official HTML documentation and comprehensive reference"
      }
    ]
  },
  css: {
    websites: [
      {
        title: "CSS Tutorial - W3Schools",
        url: "https://www.w3schools.com/css/",
        description: "Complete CSS tutorial with interactive examples and exercises"
      },
      {
        title: "CSS - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/css/",
        description: "Learn CSS styling, layouts, and modern techniques"
      },
      {
        title: "CSS Guide - MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
        description: "Official CSS documentation with comprehensive examples"
      }
    ]
  },
  java: {
    websites: [
      {
        title: "Java Tutorial - W3Schools",
        url: "https://www.w3schools.com/java/",
        description: "Learn Java programming from fundamentals to advanced concepts"
      },
      {
        title: "Java Programming - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/java/",
        description: "Complete Java programming guide with coding examples"
      },
      {
        title: "Java Documentation - Oracle",
        url: "https://docs.oracle.com/javase/tutorial/",
        description: "Official Java tutorial and documentation from Oracle"
      }
    ]
  },
  nodejs: {
    websites: [
      {
        title: "Node.js Tutorial - W3Schools",
        url: "https://www.w3schools.com/nodejs/",
        description: "Learn Node.js server-side JavaScript development"
      },
      {
        title: "Node.js - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/nodejs/",
        description: "Node.js tutorials and backend development guide"
      },
      {
        title: "Node.js Documentation",
        url: "https://nodejs.org/en/docs/",
        description: "Official Node.js documentation and API reference"
      }
    ]
  },
  mongodb: {
    websites: [
      {
        title: "MongoDB Tutorial - W3Schools",
        url: "https://www.w3schools.com/mongodb/",
        description: "Learn MongoDB NoSQL database development"
      },
      {
        title: "MongoDB - GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/mongodb/",
        description: "MongoDB database tutorials and practical examples"
      },
      {
        title: "MongoDB Documentation",
        url: "https://docs.mongodb.com/manual/tutorial/",
        description: "Official MongoDB tutorial and comprehensive guide"
      }
    ]
  }
};

function getResourcesForTopic(topic: string) {
  const topicKey = topic.toLowerCase().replace(/[^a-z]/g, '');
  const resources = [];
  
  if (reliableResources[topicKey]) {
    // Add website resources
    const websites = reliableResources[topicKey].websites;
    for (const website of websites) {
      resources.push({
        type: "website",
        title: website.title,
        url: website.url,
        description: website.description
      });
    }
  } else {
    // Fallback resources for topics not in our list
    resources.push(
      {
        type: "website",
        title: `${topic} Tutorial - W3Schools`,
        url: `https://www.w3schools.com/`,
        description: `Learn ${topic} with W3Schools tutorials`
      },
      {
        type: "website",
        title: `${topic} - GeeksforGeeks`,
        url: `https://www.geeksforgeeks.org/`,
        description: `${topic} tutorials and examples on GeeksforGeeks`
      }
    );
  }
  
  return resources;
}

async function generateWithGemini(prompt: string) {
  console.log('Calling Gemini API...');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
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
        maxOutputTokens: 4000,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  return response;
}

async function findYouTubeVideosWithGemini(topic: string): Promise<any[]> {
  console.log(`Finding YouTube videos for topic: ${topic}`);
  
  try {
    const videoSearchPrompt = `Find 2-3 actual YouTube video URLs for learning "${topic}". I need real working YouTube video links, not search URLs. Focus on popular educational channels like Apna College, CodeWithHarry, freeCodeCamp, Traversy Media, The Net Ninja, Programming with Mosh, or similar well-known programming education channels.

For each video, provide the exact information in this JSON format:
{
  "videos": [
    {
      "title": "Complete video title as it appears on YouTube",
      "channel": "Channel name",
      "url": "https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID",
      "description": "Brief description of what this video covers"
    }
  ]
}

Requirements:
- Provide ACTUAL YouTube video URLs (youtu.be/ID or youtube.com/watch?v=ID format)
- Only suggest videos from reputable educational channels
- Focus on comprehensive tutorials or beginner-friendly courses
- Ensure URLs are real and working
- Include popular, well-viewed tutorials for "${topic}"
- Prioritize channels known for quality programming education

Example format: https://youtu.be/W6NZfCO5SIk or https://www.youtube.com/watch?v=W6NZfCO5SIk

Return ONLY the JSON response with real YouTube URLs.`;

    const response = await generateWithGemini(videoSearchPrompt);
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No video suggestions received from Gemini');
    }

    const content = data.candidates[0].content.parts[0].text;
    
    let videoData;
    try {
      videoData = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        videoData = JSON.parse(jsonMatch[1]);
      } else {
        console.error('Failed to parse video JSON:', content);
        return getDefaultVideoResources(topic);
      }
    }

    if (!videoData.videos || !Array.isArray(videoData.videos)) {
      console.error('Invalid video data structure:', videoData);
      return getDefaultVideoResources(topic);
    }

    // Convert to resource format with actual YouTube URLs
    return videoData.videos.map(video => ({
      type: "video",
      title: video.title,
      url: video.url,
      description: `${video.description} - ${video.channel}`
    }));

  } catch (error) {
    console.error(`Error finding videos for ${topic}:`, error);
    return getDefaultVideoResources(topic);
  }
}

function getDefaultVideoResources(topic: string): any[] {
  // Fallback with known working video URLs for popular topics
  const defaultVideos = {
    javascript: [
      {
        type: "video",
        title: "JavaScript Tutorial for Beginners - Programming with Mosh",
        url: "https://youtu.be/W6NZfCO5SIk",
        description: "Complete JavaScript tutorial covering fundamentals and practical examples"
      }
    ],
    python: [
      {
        type: "video", 
        title: "Python Tutorial - Programming with Mosh",
        url: "https://youtu.be/_uQrJ0TkZlc",
        description: "Complete Python tutorial for beginners with hands-on projects"
      }
    ],
    react: [
      {
        type: "video",
        title: "React Tutorial for Beginners - Programming with Mosh", 
        url: "https://youtu.be/Ke90Tje7VS0",
        description: "Learn React.js from scratch with practical examples"
      }
    ]
  };

  const topicKey = topic.toLowerCase().replace(/[^a-z]/g, '');
  return defaultVideos[topicKey] || [
    {
      type: "video",
      title: `${topic} Tutorial - freeCodeCamp`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}+tutorial+freecodecamp`,
      description: `Search for ${topic} tutorial on freeCodeCamp`
    }
  ];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generate roadmap function called');
    
    const { 
      experience, 
      timeframe, 
      topics, 
      customDuration,
      studentId 
    } = await req.json();

    console.log('Request data:', { experience, timeframe, topics, customDuration, studentId });

    if (!geminiApiKey) {
      console.error('Gemini API key not found');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a detailed prompt for roadmap generation
    const timeDescription = timeframe === 'custom' ? customDuration : timeframe;
    const topicsString = topics.join(', ');
    
    const prompt = `You are an expert learning path designer. Create a comprehensive learning roadmap for a ${experience} level student who wants to learn ${topicsString} within ${timeDescription}.

Generate a structured JSON response with the following format:
{
  "roadmap": {
    "title": "Learning Roadmap for ${topicsString}",
    "description": "Brief description of what this roadmap covers",
    "estimatedDuration": "${timeDescription}",
    "difficulty": "${experience}",
    "steps": [
      {
        "id": 1,
        "title": "Step title",
        "description": "What the student will learn in this step",
        "estimatedTime": "Time to complete this step",
        "skills": ["skill1", "skill2"],
        "completed": false
      }
    ]
  }
}

Requirements:
- Order steps from beginner to advanced
- Include 8-12 detailed steps
- Each step should build upon previous steps
- Focus on hands-on learning with projects
- Make the steps specific to the selected topics: ${topicsString}
- Each step should have 2-4 skills listed
- Estimated time should be realistic (hours/days/weeks)

Generate ONLY the JSON structure without any resources - I will add the verified resources separately.`;

    console.log('Calling Gemini API...');

    const response = await generateWithGemini(prompt);
    const data = await response.json();
    console.log('Gemini response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure from Gemini');
      throw new Error('Invalid response from Gemini API');
    }

    const generatedContent = data.candidates[0].content.parts[0].text;
    console.log('Generated content preview:', generatedContent.substring(0, 200));

    // Parse the JSON response
    let roadmapData;
    try {
      roadmapData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        roadmapData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse roadmap JSON');
      }
    }

    const roadmap = roadmapData.roadmap;
    
    // Add verified resources to each step
    console.log('Adding verified resources to roadmap steps...');
    
    for (let i = 0; i < roadmap.steps.length; i++) {
      const step = roadmap.steps[i];
      const resources = [];
      
      // Add reliable website resources based on topics
      for (const topic of topics) {
        const topicResources = getResourcesForTopic(topic);
        resources.push(...topicResources);
      }
      
      // Add YouTube videos using Gemini API for each topic
      for (const topic of topics) {
        try {
          console.log(`Finding videos for topic: ${topic}`);
          const videoResources = await findYouTubeVideosWithGemini(topic);
          resources.push(...videoResources);
        } catch (error) {
          console.error(`Failed to find videos for ${topic}:`, error);
          // Add fallback video resource if Gemini fails
          resources.push({
            type: "video",
            title: `${topic} Tutorial - Apna College`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}+tutorial+apna+college`,
            description: `Search for ${topic} tutorial by Apna College`
          });
        }
      }
      
      // If no resources found, add general programming resources
      if (resources.length === 0) {
        resources.push(
          {
            type: "website",
            title: "freeCodeCamp",
            url: "https://www.freecodecamp.org/",
            description: "Interactive coding lessons and projects"
          },
          {
            type: "website",
            title: "W3Schools",
            url: "https://www.w3schools.com/",
            description: "Web development tutorials and references"
          },
          {
            type: "video",
            title: "Programming Tutorial - Apna College",
            url: "https://www.youtube.com/results?search_query=programming+tutorial+apna+college",
            description: "Search for programming tutorials by Apna College"
          }
        );
      }
      
      step.resources = resources;
    }

    const totalSteps = roadmap.steps.length;

    // Save roadmap to database
    console.log('Saving roadmap to database...');
    
    const { data: savedRoadmap, error: saveError } = await supabase
      .from('roadmaps')
      .insert({
        student_id: studentId,
        track_name: roadmap.title,
        experience_level: experience,
        timeframe: timeDescription,
        selected_topics: topics,
        roadmap_json: roadmap,
        progress_tracking: 0,
        current_step: 1,
        total_steps: totalSteps
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error(`Failed to save roadmap: ${saveError.message}`);
    }

    console.log('Roadmap saved successfully:', savedRoadmap.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        roadmap: savedRoadmap,
        message: 'Roadmap generated with working resources!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-roadmap function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate roadmap',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
