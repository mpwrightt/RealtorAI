import OpenAI from 'openai';

async function testOpenRouter() {
  console.log('🔍 Testing OpenRouter connection...\n');
  
  // Check environment variables
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
  
  if (!apiKey || apiKey === 'sk-or-v1-your_openrouter_api_key_here') {
    console.error('❌ OPENROUTER_API_KEY not set or is placeholder');
    console.log('   Please set a valid OpenRouter API key in .env.local');
    process.exit(1);
  }
  
  console.log(`✓ API Key found: ${apiKey.substring(0, 20)}...`);
  console.log(`✓ Model: ${model}\n`);
  
  try {
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'Neighborhood Deal Finder',
      }
    });
    
    console.log('📡 Sending test request to OpenRouter...');
    
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { 
          role: 'user', 
          content: 'Say "Hello! OpenRouter is configured correctly." in one sentence.' 
        }
      ],
      max_tokens: 50,
    });
    
    console.log('\n✅ OpenRouter test successful!\n');
    console.log('Response:', response.choices[0].message.content);
    console.log('\n📊 Token usage:', {
      prompt: response.usage?.prompt_tokens,
      completion: response.usage?.completion_tokens,
      total: response.usage?.total_tokens,
    });
    
  } catch (error: any) {
    console.error('\n❌ OpenRouter test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testOpenRouter().catch(console.error);
