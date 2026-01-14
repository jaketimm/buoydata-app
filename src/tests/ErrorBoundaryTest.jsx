import React, { useState, useEffect } from 'react';

/**
 * Test component to verify Error Boundaries are working correctly
 * This component intentionally throws errors for testing purposes
 * 
 * To use: 
 * 1. Import this component in either page component
 * 2. Add <ErrorBoundaryTest /> anywhere in the component
 * 3. Click the buttons to trigger different error scenarios
 * 4. Remove this component from production code when finished
 */
const ErrorBoundaryTest = () => {
  const [throwError, setThrowError] = useState(null);
  const [asyncError, setAsyncError] = useState(false);

  // Test different error scenarios
  useEffect(() => {
    if (throwError === 'render') {
      throw new Error('💥 Render Error: This is a test error during render!');
    }
  }, [throwError]);

  // Simulate async error
  useEffect(() => {
    if (asyncError) {
      setTimeout(() => {
        throw new Error('💥 Async Error: This error occurred in setTimeout!');
      }, 1000);
    }
  }, [asyncError]);

  const handleNullError = () => {
    // Intentionally access property of null
    const data = null;
    console.log(data.someProperty); // This will throw
  };

  const handleUndefinedError = () => {
    // Intentionally call undefined as function
    const undefinedFunc = undefined;
    undefinedFunc(); // This will throw
  };

  const handleArrayError = () => {
    // Intentionally cause array error
    const arr = [1, 2, 3];
    arr[10].toString(); // Accessing undefined index
  };

  const handlePromiseRejection = () => {
    // Unhandled promise rejection
    Promise.reject(new Error('💥 Promise Rejection: Unhandled promise rejection test!'));
  };

  const handleTypeError = () => {
    // Type error
    const num = 42;
    num.toUpperCase(); // Number doesn't have toUpperCase method
  };

  const handleReferenceError = () => {
    // Reference error - using undeclared variable
    // eslint-disable-next-line no-undef
    undeclaredVariable.doSomething(); // This will throw ReferenceError
  };

  const handleNetworkError = async () => {
    // Simulate network error
    try {
      await fetch('https://this-api-does-not-exist-12345.com/data');
      // If somehow it succeeds, force an error
      throw new Error('Network request should have failed!');
    } catch (error) {
      // Re-throw to trigger error boundary
      throw new Error(`💥 Network Error: ${error.message}`);
    }
  };

  const handleJSONParseError = () => {
    // JSON parse error
    const invalidJSON = '{this is not valid JSON}';
    JSON.parse(invalidJSON); // This will throw SyntaxError
  };

  // Component that throws error during render
  const BrokenComponent = () => {
    throw new Error('💥 Component Error: This component always throws an error!');
  };

  const [showBroken, setShowBroken] = useState(false);

  if (showBroken) {
    return <BrokenComponent />;
  }

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: '2px dashed red',
      borderRadius: '8px',
      backgroundColor: '#fff3cd'
    }}>
      <h3 style={{ color: '#856404' }}>🧪 Error Boundary Test Component</h3>
      <p style={{ color: '#721c24', fontWeight: 'bold' }}>
        ⚠️ This is for testing only! Remove from production code!
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginTop: '15px'
      }}>
        
        <button
          onClick={() => setThrowError('render')}
          style={buttonStyle('#dc3545')}
        >
          🔥 Throw Render Error
        </button>

        <button
          onClick={handleNullError}
          style={buttonStyle('#fd7e14')}
        >
          ❌ Null Reference Error
        </button>

        <button
          onClick={handleUndefinedError}
          style={buttonStyle('#ffc107')}
        >
          ❓ Undefined Function Error
        </button>

        <button
          onClick={handleArrayError}
          style={buttonStyle('#28a745')}
        >
          📊 Array Index Error
        </button>

        <button
          onClick={handleTypeError}
          style={buttonStyle('#20c997')}
        >
          🔤 Type Error
        </button>

        <button
          onClick={handleReferenceError}
          style={buttonStyle('#17a2b8')}
        >
          🔍 Reference Error
        </button>

        <button
          onClick={handleJSONParseError}
          style={buttonStyle('#007bff')}
        >
          📝 JSON Parse Error
        </button>

        <button
          onClick={() => setShowBroken(true)}
          style={buttonStyle('#6610f2')}
        >
          💥 Broken Component
        </button>

        <button
          onClick={handlePromiseRejection}
          style={buttonStyle('#e83e8c')}
        >
          ⏳ Promise Rejection
        </button>

        <button
          onClick={() => setAsyncError(true)}
          style={buttonStyle('#6c757d')}
        >
          ⏰ Async Error (1s delay)
        </button>

        <button
          onClick={handleNetworkError}
          style={buttonStyle('#343a40')}
        >
          🌐 Network Error
        </button>

        <button
          onClick={() => {
            // Simulate error in event handler
            throw new Error('💥 Event Handler Error: Error in click handler!');
          }}
          style={buttonStyle('#495057')}
        >
          👆 Click Handler Error
        </button>
      </div>

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        borderRadius: '4px'
      }}>
        <strong>Expected Behavior:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Clicking any button should trigger an error</li>
          <li>The Error Boundary should catch it and show a friendly error page</li>
          <li>You should see "Oops! Something went wrong" message</li>
          <li>In development, you'll see error details</li>
          <li>"Try Again" button should reset the error state</li>
          <li>"Reload Page" should refresh the entire app</li>
        </ul>
      </div>
    </div>
  );
};

// Button styling helper
const buttonStyle = (color) => ({
  padding: '8px 12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: color,
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'opacity 0.2s',
  ':hover': {
    opacity: 0.8
  }
});

export default ErrorBoundaryTest;