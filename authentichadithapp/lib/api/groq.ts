export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export class QuotaExceededError extends Error {
  quota: {
    daily_remaining: number
    monthly_remaining: number
    daily_limit: number
    monthly_limit: number
    tier: string
  }

  constructor(message: string, quota: QuotaExceededError['quota']) {
    super(message)
    this.name = 'QuotaExceededError'
    this.quota = quota
  }
}

/**
 * Send a chat message to the AI assistant
 * Note: This uses a relative path '/api/chat' which works with Expo Router's API routes.
 * The path is resolved relative to the app's base URL in web builds.
 */
export async function sendChatMessage(messages: ChatMessage[], userId?: string): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      userId,
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    if (response.status === 429 && errorData.error === 'quota_exceeded') {
      throw new QuotaExceededError(
        errorData.message || 'AI query limit reached. Upgrade for more.',
        errorData.quota
      )
    }

    const errorMessage = errorData.error || `Failed to get AI response: ${response.status} ${response.statusText}`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.response
}
