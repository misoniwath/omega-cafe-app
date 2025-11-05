export const sendToTelegram = async (message) => {
  try {
    const response = await fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      // Try to get error details
      let errorData = {};
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      
      // Log full error details for debugging
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error(
          errorData.message || 'Too many requests. Please try again later.'
        );
      }
      
      // Handle 404 (API not found - development issue)
      if (response.status === 404) {
        throw new Error(
          'API endpoint not found. Make sure you are running the development server. See README.md for setup instructions.'
        );
      }
      
      // Handle other errors
      throw new Error(
        errorData.message || errorData.error || `Failed to send message (${response.status})`
      );
    }

    const result = await response.json();
    console.log('✅ Order sent to Telegram via serverless function!');
    return result;
  } catch (error) {
    // Enhanced error logging
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ Network error - API endpoint may not be available:', error);
      throw new Error('Cannot connect to API. Make sure the development server is running.');
    }
    console.error('❌ Send order error:', error);
    throw error; // Re-throw to let caller handle it
  }
};
