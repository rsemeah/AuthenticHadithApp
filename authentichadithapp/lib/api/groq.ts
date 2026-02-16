import { Platform } from 'react-native'
import Constants from 'expo-constants'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * Get the chat API base URL.
 * - On web: use relative path (Expo Router API routes work)
 * - On native (iOS/Android): use the deployed web app URL since
 *   Expo Router API routes don't run on native devices
 */
function getChatApiUrl(): string {
  if (Platform.OS === 'web') {
    return '/api/chat'
  }
  // For native, use the deployed web app's API endpoint
  const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'https://authentichadith.app'
  return `${baseUrl}/api/chat`
}

/**
 * Send a chat message to the AI assistant
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(getChatApiUrl(), {
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
