import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are SilentEngine, an AI assistant for Authentic Hadith App. Provide respectful, accurate answers about Islamic teachings backed by authentic hadiths when relevant. Be concise and helpful.

Your role:
- Answer questions about Islamic teachings with references to authentic hadith
- Provide context and explanations for hadith interpretations
- Be respectful and scholarly in tone
- Cite hadith numbers when referencing specific narrations
- If you don't know, admit it rather than speculating

Response format:
- Keep answers concise but informative (2-4 paragraphs)
- Use bullet points for lists
- Always cite sources when mentioning specific hadith`

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { messages } = body
    
    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Invalid request: messages must be a non-empty array' },
        { status: 400 }
      )
    }
    
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      maxTokens: 512,
      temperature: 0.7,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error('[Mobile Chat API] Error:', error)
    return Response.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
