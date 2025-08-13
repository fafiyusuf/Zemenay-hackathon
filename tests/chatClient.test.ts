import assert from 'node:assert'
import { ChatClient } from '../lib/chatClient'

// Minimal mock fetch implementation
function createMockFetch(sequence: any[]) {
  let call = 0
  return async (_url: string, _init?: any) => {
    const item = sequence[call++]
    if (!item) throw new Error('Unexpected fetch call')
    return new Response(JSON.stringify(item.body), { status: item.status || 200 })
  }
}

async function run() {
  // Arrange mock responses: start, send, history
  const mockFetch = createMockFetch([
    { body: { id: 'conv1' } },
    { body: { message: { id: 'm2', role: 'assistant', content: 'Hello there', conversation_id: 'conv1' } } },
    { body: [
      { id: 'm1', role: 'user', content: 'Hi', conversation_id: 'conv1' },
      { id: 'm2', role: 'assistant', content: 'Hello there', conversation_id: 'conv1' }
    ] }
  ]) as any

  const client = new ChatClient({ baseUrl: 'https://example.test', fetchImpl: mockFetch })

  const convId = await client.startConversation()
  assert.equal(convId, 'conv1', 'Conversation id mismatch')

  const reply = await client.sendMessage(convId, 'Hi')
  assert.equal(reply.content, 'Hello there')
  assert.equal(reply.role, 'assistant')

  const history = await client.getChatHistory(convId)
  assert.equal(history.length, 2)
  assert.equal(history[0].content, 'Hi')
  assert.equal(history[1].content, 'Hello there')

  console.log('All chatClient tests passed.')
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
