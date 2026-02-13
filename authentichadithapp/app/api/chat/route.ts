import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { createClient } from "@supabase/supabase-js"

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not configured. Please add it to your .env file.')
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nqklipakrfuwebkdnhwg.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabaseAdmin() {
  if (!SUPABASE_SERVICE_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, userId } = body

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Invalid request: messages must be a non-empty array' },
        { status: 400 }
      )
    }

    // Quota check (if service role key is configured and userId provided)
    const supabase = getSupabaseAdmin()
    if (supabase && userId) {
      const { data: quotaData, error: quotaError } = await supabase
        .rpc('check_user_quota', { p_user_id: userId })
        .single()

      if (quotaError) {
        console.error('Quota check error:', quotaError)
      } else if (quotaData && !quotaData.allowed) {
        return Response.json(
          {
            error: 'quota_exceeded',
            message: quotaData.daily_remaining <= 0
              ? 'Daily AI query limit reached. Upgrade for more.'
              : 'Monthly AI query limit reached. Upgrade for more.',
            quota: {
              daily_remaining: quotaData.daily_remaining,
              monthly_remaining: quotaData.monthly_remaining,
              daily_limit: quotaData.daily_limit,
              monthly_limit: quotaData.monthly_limit,
              tier: quotaData.tier,
            },
          },
          { status: 429 }
        )
      }
    }

    const systemPrompt = `You are a knowledgeable Islamic scholar assistant specializing in authentic hadith.

Your role:
- Answer questions about Islamic teachings with references to authentic hadith
- Provide context and explanations for hadith interpretations
- Be respectful and scholarly in tone
- Cite hadith numbers when referencing specific narrations
- If you don't know, admit it rather than speculating
- Never issue fatwas or religious rulings
- Always direct users to qualified scholars for rulings

Response format:
- Keep answers concise but informative (2-4 paragraphs)
- Use bullet points for lists
- Always cite sources when mentioning specific hadith`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      maxTokens: 1024,
      temperature: 0.7,
    })

    // Increment usage after successful response
    if (supabase && userId) {
      const { error: usageError } = await supabase.rpc('increment_ai_usage', {
        p_user_id: userId,
      })
      if (usageError) {
        console.error('Usage increment error:', usageError)
      }
    }

    return Response.json({ response: text })
  } catch (error) {
    console.error('Error in chat API:', error)
    return Response.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
