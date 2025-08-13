import { testAIHelper, generateText } from '../lib/gemini';

async function runAITests() {
  console.log('🧪 Testing AI Helper Functions...\n');

  try {
    // Test 1: Basic text generation
    console.log('Test 1: Basic text generation');
    const basicResponse = await generateText('Hello, what is 2+2?');
    console.log('Response:', basicResponse);
    console.log('✅ Basic test passed\n');

    // Test 2: System instruction
    console.log('Test 2: System instruction');
    const systemResponse = await generateText('What is your role?', {
      systemInstruction: 'You are a helpful math tutor. Always provide step-by-step explanations.'
    });
    console.log('Response:', systemResponse);
    console.log('✅ System instruction test passed\n');

    // Test 3: Conversation history
    console.log('Test 3: Conversation history');
    await testAIHelper();
    console.log('✅ Conversation history test passed\n');

    // Test 4: Complex conversation
    console.log('Test 4: Complex conversation');
    const complexResponse = await generateText('What was the first number I mentioned?', {
      conversationHistory: [
        { role: 'user', content: 'I need help with math' },
        { role: 'assistant', content: 'I\'d be happy to help with math! What specific problem are you working on?' },
        { role: 'user', content: 'I have a problem: 15 + 27' },
        { role: 'assistant', content: 'Let me help you solve 15 + 27. First, let\'s break it down: 15 + 27 = 42' }
      ]
    });
    console.log('Response:', complexResponse);
    console.log('✅ Complex conversation test passed\n');

    console.log('🎉 All AI tests completed successfully!');

  } catch (error) {
    console.error('❌ AI test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAITests();
}

export { runAITests };
