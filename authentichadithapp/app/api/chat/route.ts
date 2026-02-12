import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  const { messages } = await request.json()
  
  const systemPrompt = `You are a knowledgeable Islamic scholar assistant specializing in authentic hadith. 
  
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

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    maxTokens: 1024,
    temperature: 0.7,
  })

  return Response.json({ response: text })
}
