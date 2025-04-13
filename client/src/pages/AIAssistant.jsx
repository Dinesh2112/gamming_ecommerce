import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from '../axiosConfig';
import { UserContext } from '../context/UserContext';
import '../styles/AIAssistant.css';

/**
 * AIAssistant Component
 * 
 * This component provides an AI-powered chat interface for helping users build gaming PCs.
 * It uses the Gemini API to generate responses and suggest products based on user queries.
 * 
 * Features:
 * - Natural language conversation about PC components and builds
 * - Budget-based recommendations
 * - Product suggestions from the store's inventory
 * - Chat history persistence
 * - Markdown rendering for formatted responses
 * - Chat history management
 * 
 * Setup Requirements:
 * 1. Backend needs a valid GEMINI_API_KEY in .env file
 * 2. Products need to be added to the database with detailed specifications
 * 3. AIChat, AIMessage, and ProductReference tables need to exist in the database
 * 
 */
const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useContext(UserContext);
  const [chatId, setChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [error, setError] = useState(null);

  // Initialize chat when component loads
  useEffect(() => {
    const initChat = async () => {
      if (!user) {
        console.log('User not authenticated, skipping chat initialization');
        return;
      }

      try {
        // Get chat history
        try {
          const historyRes = await axios.get('/api/ai/chat/history');
          setChatHistory(historyRes.data.chats || []);
        } catch (historyError) {
          console.error('Error fetching chat history:', historyError);
          // Non-critical error, continue with initialization
        }
        
        // Initialize chat session
        try {
          const chatRes = await axios.post('/api/ai/chat/initialize', {});
          setChatId(chatRes.data.chatId);
          
          // Process messages to include any product suggestions
          if (chatRes.data.messages) {
            const initialMessages = chatRes.data.messages.map(msg => {
              // Process assistant messages to include suggested products
              if (msg.role === 'assistant' && msg.productReferences && msg.productReferences.length > 0) {
                const productIds = msg.productReferences.map(ref => ref.productId);
                let suggestedProducts = [];
                
                if (chatRes.data.products && chatRes.data.products.length > 0) {
                  suggestedProducts = chatRes.data.products
                    .filter(product => productIds.includes(product.id))
                    .map(enhanceProductData);
                }
                
                return {...msg, suggestedProducts};
              }
              return msg;
            });
            
            setMessages(initialMessages);
          } else {
            // If no messages, set a default welcome message
            setMessages([{
              role: 'assistant',
              content: "Hello! I'm your PC building assistant. I can help you choose components for your gaming PC based on your budget and requirements. What are you looking for today?",
              timestamp: new Date().toISOString()
            }]);
          }
        } catch (chatError) {
          console.error('Error initializing chat:', chatError);
          setError('Unable to initialize chat. The AI service might be unavailable.');
          
          // Set a fallback message
          setMessages([{
            role: 'assistant',
            content: "I'm experiencing some technical difficulties connecting to the AI service. Please try again later or contact support if the issue persists.",
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('General error in chat initialization:', error);
        setError('Failed to initialize chat. Please try again later.');
      }
    };
    
    initChat();
  }, [user]); // Add user as a dependency to re-initialize when user changes

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when typing state changes
  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    
    if (!user) {
      setError('You need to be logged in to send messages');
      return;
    }
    
    if (!chatId) {
      setError('Chat session not initialized. Please refresh the page or try again later.');
      return;
    }
    
    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);
    
    try {
      const response = await axios.post('/api/ai/chat/message', {
        chatId,
        content: userMessage.content
      });
      
      // Log the full response for debugging
      console.log('Full API response:', JSON.stringify(response.data, null, 2));
      
      // Check specifically for product data structure
      if (response.data.products || response.data.suggestedProducts) {
        console.log('Raw product data from API:', 
          response.data.products || response.data.suggestedProducts);
        
        // Check the first product's image properties
        const firstProduct = (response.data.products && response.data.products[0]) || 
                           (response.data.suggestedProducts && response.data.suggestedProducts[0]);
        
        if (firstProduct) {
          console.log('First product image properties:', {
            imageUrl: firstProduct.imageUrl,
            image: firstProduct.image,
            images: firstProduct.images,
            hasImageUrl: !!firstProduct.imageUrl,
            hasImage: !!firstProduct.image,
            hasImages: !!firstProduct.images,
          });
        }
      }
      
      // If session expired, reinitialize
      if (response.data.status === 'SESSION_EXPIRED') {
        console.log('Chat session expired, reinitializing...');
        try {
          // Initialize a new chat
          const newChatRes = await axios.post('/api/ai/chat/initialize', {});
          setChatId(newChatRes.data.chatId);
          
          // Try sending the message again
          const retryResponse = await axios.post('/api/ai/chat/message', {
            chatId: newChatRes.data.chatId,
            content: userMessage.content
          });
          
          // Process the retry response
          const assistantMessage = {
            role: 'assistant',
            content: retryResponse.data.message || retryResponse.data.response || retryResponse.data.content,
            timestamp: new Date().toISOString()
          };
          
          // Process product suggestions if any
          if (retryResponse.data.suggestedProducts && retryResponse.data.suggestedProducts.length > 0) {
            console.log('Received product suggestions:', retryResponse.data.suggestedProducts);
            assistantMessage.suggestedProducts = retryResponse.data.suggestedProducts.map(enhanceProductData);
          } else if (retryResponse.data.products && retryResponse.data.products.length > 0) {
            console.log('Received products array:', retryResponse.data.products);
            assistantMessage.suggestedProducts = retryResponse.data.products.map(enhanceProductData);
          } else if (retryResponse.data.productReferences && retryResponse.data.productReferences.length > 0) {
            console.log('Received product references:', retryResponse.data.productReferences);
            // If we have product references but not full product data
            const productIds = retryResponse.data.productReferences.map(ref => ref.productId);
            
            // Try to find product details in the response data
            if (retryResponse.data.productDetails && retryResponse.data.productDetails.length > 0) {
              assistantMessage.suggestedProducts = retryResponse.data.productDetails
                .filter(product => productIds.includes(product.id))
                .map(enhanceProductData);
            } else {
              // Just use the references as-is if no detailed product data available
              assistantMessage.suggestedProducts = retryResponse.data.productReferences.map(enhanceProductData);
            }
          }
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Update chat history
          const historyRes = await axios.get('/api/ai/chat/history');
          setChatHistory(historyRes.data.chats || []);
        } catch (error) {
          console.error('Error reinitializing chat:', error);
          setError('Failed to reinitialize chat. Please try again later.');
        }
      } else {
        // Process normal response
        const assistantMessage = {
          role: 'assistant',
          content: response.data.message || response.data.response || response.data.content,
          timestamp: new Date().toISOString()
        };
        
        // Process product suggestions if any
        if (response.data.suggestedProducts && response.data.suggestedProducts.length > 0) {
          console.log('Received product suggestions:', response.data.suggestedProducts);
          assistantMessage.suggestedProducts = response.data.suggestedProducts.map(enhanceProductData);
        } else if (response.data.products && response.data.products.length > 0) {
          console.log('Received products array:', response.data.products);
          assistantMessage.suggestedProducts = response.data.products.map(enhanceProductData);
        } else if (response.data.productReferences && response.data.productReferences.length > 0) {
          console.log('Received product references:', response.data.productReferences);
          // If we have product references but not full product data
          const productIds = response.data.productReferences.map(ref => ref.productId);
          
          // Try to find product details in the response data
          if (response.data.productDetails && response.data.productDetails.length > 0) {
            assistantMessage.suggestedProducts = response.data.productDetails
              .filter(product => productIds.includes(product.id))
              .map(enhanceProductData);
          } else {
            // Just use the references as-is if no detailed product data available
            assistantMessage.suggestedProducts = response.data.productReferences.map(enhanceProductData);
          }
        }
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "I'm sorry, I encountered an error. Please try again later.";
      
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = "Your session has expired. Please log in again to continue.";
        } else if (error.response.status === 429) {
          errorMessage = "Too many requests. Please wait a moment before sending another message.";
        } else if (error.response.status >= 500) {
          errorMessage = "The AI service is currently unavailable. Please try again later.";
        }
      } else if (error.request) {
        // Request was made but no response received (network error)
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }]);
      
      setError(errorMessage);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  // Helper function to enhance product data and ensure it has required fields
  const enhanceProductData = (product) => {
    if (!product) return null;
    
    // Create a copy to avoid modifying the original
    const enhancedProduct = { ...product };
    
    // Define a base URL for product images
    const baseUrl = 'http://localhost:5000'; // Adjust this to match your backend URL
    
    // Ensure imageUrl is properly set
    if (!enhancedProduct.imageUrl) {
      if (enhancedProduct.image) {
        enhancedProduct.imageUrl = enhancedProduct.image;
      } else if (enhancedProduct.images && Array.isArray(enhancedProduct.images) && enhancedProduct.images.length > 0) {
        enhancedProduct.imageUrl = enhancedProduct.images[0];
      }
    }
    
    // Check if it's a data URL (base64 encoded image)
    const isDataUrl = enhancedProduct.imageUrl && 
                     (enhancedProduct.imageUrl.startsWith('data:image') || 
                      enhancedProduct.imageUrl.includes('base64'));
    
    // For non-data URLs, apply normal path handling
    if (!isDataUrl) {
      // Check for empty or placeholder imageUrl
      if (!enhancedProduct.imageUrl || enhancedProduct.imageUrl === 'placeholder.png') {
        enhancedProduct.imageUrl = baseUrl + '/images/placeholder.png';
      }
      
      // If the image URL doesn't start with http or /, add the base URL
      if (enhancedProduct.imageUrl && 
          !enhancedProduct.imageUrl.startsWith('http') && 
          !enhancedProduct.imageUrl.startsWith('/')) {
        enhancedProduct.imageUrl = '/' + enhancedProduct.imageUrl;
      }
      
      // For relative URLs that start with /, add the base URL
      if (enhancedProduct.imageUrl && enhancedProduct.imageUrl.startsWith('/')) {
        enhancedProduct.imageUrl = baseUrl + enhancedProduct.imageUrl;
      }
    }
    
    // Ensure price is a number
    if (typeof enhancedProduct.price !== 'number') {
      if (typeof enhancedProduct.price === 'string') {
        enhancedProduct.price = parseFloat(enhancedProduct.price.replace(/[^0-9.]/g, '')) || 0;
      } else {
        enhancedProduct.price = 0;
      }
    }
    
    return enhancedProduct;
  };

  // Render a compact product card for inline display
  const renderInlineProductCard = (product) => {
    if (!product || !product.id) {
      console.error('Invalid product object:', product);
      return null;
    }
    
    // Check if the image URL is a data URL (base64 encoded)
    const isDataUrl = product.imageUrl && 
                     (product.imageUrl.startsWith('data:image') || 
                      product.imageUrl.includes('base64'));
                      
    let imageUrl = product.imageUrl;
    
    // Only apply base URL logic for non-data URLs
    if (!isDataUrl && imageUrl) {
      const baseUrl = 'http://localhost:5000';
      
      // If the image URL doesn't start with http or /, add the base URL
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      
      // For relative URLs that start with /, add the base URL
      if (imageUrl.startsWith('/')) {
        imageUrl = baseUrl + imageUrl;
      }
    }
    
    // Placeholder for when there's no valid image
    const placeholderUrl = '/images/placeholder.png';

    return (
      <div className="inline-product-card">
        <div className="product-image">
          <img
            src={imageUrl || placeholderUrl}
            alt={product.name}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.target.src = placeholderUrl;
            }}
          />
        </div>
        <div className="inline-product-details">
          <h4>{product.name || 'Unnamed Product'}</h4>
          <p className="inline-product-price">₹{(product.price || 0).toLocaleString()}</p>
          <div className="inline-product-actions">
            <button 
              className="inline-view-btn"
              onClick={() => window.location.href = `/product/${product.id}`}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Format the message content with markdown-like syntax and inline product cards
  const formatMessage = (content, suggestedProducts) => {
    if (!content) return null;
    
    // Debug suggested products if available
    if (suggestedProducts && suggestedProducts.length > 0) {
      console.log('Formatting message with products:', suggestedProducts);
    }
    
    // Handle code blocks
    let formatted = content.replace(/```(\w*)([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');
    
    // Handle inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Handle bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle lists
    formatted = formatted.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>');
    
    // Handle links
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle paragraphs (split by newline)
    const paragraphs = formatted.split('\n\n').filter(p => p.trim());
    
    return (
      <div className="message-content-wrapper">
        <div dangerouslySetInnerHTML={{ 
          __html: paragraphs.map(p => {
            // Check if paragraph starts with list items
            if (p.startsWith('<li>')) {
              return `<ul>${p}</ul>`;
            }
            // Skip wrapping already formatted elements
            if (p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<ol')) {
              return p;
            }
            return `<p>${p}</p>`;
          }).join('')
        }} />
        
        {/* Display inline product cards if this message has suggested products */}
        {suggestedProducts && Array.isArray(suggestedProducts) && suggestedProducts.length > 0 && (
          <div className="inline-products-container">
            <h4 className="inline-products-heading">Recommended Products:</h4>
            <div className="inline-products-grid">
              {suggestedProducts.map((product, index) => (
                <React.Fragment key={`product-${product.id || index}`}>
                  {renderInlineProductCard(product)}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProductCard = (product) => {
    if (!product || !product.id) {
      console.error('Invalid product object:', product);
      return null;
    }
    
    // Check if the image URL is a data URL (base64 encoded)
    const isDataUrl = product.imageUrl && 
                     (product.imageUrl.startsWith('data:image') || 
                      product.imageUrl.includes('base64'));
                      
    let imageUrl = product.imageUrl;
    
    // Only apply base URL logic for non-data URLs
    if (!isDataUrl && imageUrl) {
      const baseUrl = 'http://localhost:5000';
      
      // If the image URL doesn't start with http or /, add the base URL
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      
      // For relative URLs that start with /, add the base URL
      if (imageUrl.startsWith('/')) {
        imageUrl = baseUrl + imageUrl;
      }
    }
    
    // Placeholder for when there's no valid image
    const placeholderUrl = '/images/placeholder.png';
    
    return (
    <div className="ai-suggested-product" key={product.id}>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="product-thumbnail"
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            e.target.src = placeholderUrl;
          }}
        />
      )}
      <div className="product-info">
        <h4 title={product.name}>{product.name}</h4>
        <p className="product-price">₹{product.price.toLocaleString()}</p>
        <p className="product-desc">
          {product.description 
            ? (product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description)
            : "No description available"}
        </p>
        <div className="product-actions">
          <button 
            className="view-details-btn"
            onClick={() => window.location.href = `/product/${product.id}`}
          >
            Details
          </button>
          <button 
            className="add-to-cart-btn"
            onClick={() => addToCart(product.id)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart/add', {
        productId,
        quantity: 1
      });
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'add-to-cart-notification';
      notification.textContent = 'Added to cart!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  // Suggested prompts for user to get started
  const suggestedPrompts = [
    "I need a gaming PC under ₹70,000",
    "What's the best GPU for 1440p gaming?",
    "Recommend me a complete setup for streaming",
    "I want to upgrade my CPU, what are my options?",
    "What parts do I need to build a PC for video editing?"
  ];

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const startNewChat = async () => {
    try {
      // Create a new chat session
      const res = await axios.post('/api/ai/chat/new', {});
      setChatId(res.data.chatId);
      
      // Reset messages and display welcome message
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your PC building assistant. I can help you choose components for your gaming PC based on your budget and requirements. What are you looking for today?",
        timestamp: new Date().toISOString()
      }]);
      
      // Update chat history
      const historyRes = await axios.get('/api/ai/chat/history');
      setChatHistory(historyRes.data.chats || []);
      
      // Hide chat history panel
      setShowChatHistory(false);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      setError('Failed to create a new chat session. Please try again later.');
    }
  };

  const loadChat = async (selectedChatId) => {
    try {
      const res = await axios.get(`/api/ai/chat/${selectedChatId}`);
      
      if (res.data.messages && res.data.messages.length > 0) {
        // Process messages to include product suggestions from the backend
        const processedMessages = res.data.messages.map(msg => {
          // Process assistant messages to include suggested products
          if (msg.role === 'assistant' && msg.productReferences && msg.productReferences.length > 0) {
            const productIds = msg.productReferences.map(ref => ref.productId);
            let suggestedProducts = [];
            
            if (res.data.products && res.data.products.length > 0) {
              suggestedProducts = res.data.products
                .filter(product => productIds.includes(product.id))
                .map(enhanceProductData);
            }
            
            return {...msg, suggestedProducts};
          }
          return msg;
        });
        
        setMessages(processedMessages);
        setChatId(selectedChatId);
        setShowChatHistory(false);
      } else {
        setError('This chat session appears to be empty.');
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError('Unable to load this chat conversation. It may have been deleted or you do not have permission to access it.');
    }
  };

  if (!user) {
    return (
      <div className="ai-assistant-container">
        <div className="login-prompt">
          <h2>AI PC Building Assistant</h2>
          <p>Please log in to chat with our AI assistant</p>
          <button onClick={() => window.location.href = '/login'}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <h2>AI PC Building Assistant</h2>
        <p>Get personalized recommendations for your gaming PC build</p>
        <div className="chat-controls">
          <button 
            className="new-chat-btn"
            onClick={startNewChat}
            title="Start a new chat"
          >
            New Chat
          </button>
          <button 
            className="history-btn"
            onClick={() => setShowChatHistory(!showChatHistory)}
            title="View chat history"
          >
            {showChatHistory ? 'Hide History' : 'Chat History'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="chat-interface">
        {showChatHistory && (
          <div className="chat-history-panel">
            <h3>Recent Conversations</h3>
            {chatHistory.length > 0 ? (
              <div className="chat-history-list">
                {chatHistory.map(chat => (
                  <div 
                    key={chat.id} 
                    className="chat-history-item"
                    onClick={() => loadChat(chat.id)}
                  >
                    <p className="chat-title">
                      {chat.title || 'Conversation ' + new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                    <p className="chat-date">
                      {new Date(chat.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-history">No previous conversations</p>
            )}
          </div>
        )}
        
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                {formatMessage(msg.content, msg.suggestedProducts)}
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message assistant-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {messages.length === 1 && (
            <div className="suggested-prompts">
              <p>Try asking:</p>
              <div className="prompts-container">
                {suggestedPrompts.map((prompt, index) => (
                  <button 
                    key={index} 
                    className="prompt-btn"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about PC builds, components, or recommendations..."
              disabled={isTyping || isSending}
              ref={inputRef}
            />
            <button 
              type="submit" 
              disabled={isTyping || isSending || !input.trim()}
              className={isSending ? "sending" : ""}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 