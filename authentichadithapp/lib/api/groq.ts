export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * Send a chat message to the AI assistant
 * Note: This uses a relative path '/api/chat' which works with Expo Router's API routes.
 * The path is resolved relative to the app's base URL in web builds.
 */
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
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || `Failed to get AI response: ${response.status} ${response.statusText}`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.response
}
