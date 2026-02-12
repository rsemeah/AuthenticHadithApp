export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    })
  })

  if (!response.ok) {
    throw new Error('Failed to get AI response')
  }

  const data = await response.json()
  return data.response
}
