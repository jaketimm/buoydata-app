import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console 
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          minHeight: '100vh',
          margin: '40px auto',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#fee',
            border: '2px solid #c33',
            borderRadius: '8px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <h1 style={{ color: '#c33', marginTop: 0 }}>
              ⚠️ Oops! Something went wrong
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              We encountered an unexpected error. Please try refreshing the page or going back to the home page.
            </p>
            
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#1a293d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Go to Home
              </button>
            </div>
          </div>

          {/* Show error details in development mode */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              textAlign: 'left',
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '12px',
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
                {'\n\n'}
                <strong>Component Stack:</strong>
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;