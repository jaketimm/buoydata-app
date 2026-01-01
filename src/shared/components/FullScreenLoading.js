import React from 'react';

const FullScreenLoading = () => {
  return (
    <>
      <style>
        {`
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={overlayStyle}>
        <div style={containerStyle}>
          <div style={spinnerStyle}></div>
          <h2 style={titleStyle}>Loading Buoy Data</h2>
        </div>
      </div>
    </>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  height: '100%',
  width: '100%',
  backgroundColor: 'rgba(60, 60, 70, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
};

const containerStyle = {
  backgroundColor: 'var(--bg-primary)',
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  padding: '32px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  flexDirection: 'column',
};

const spinnerStyle = {
  width: '64px',
  height: '64px',
  border: '5px solid var(--bg-primary)',
  borderTop: '5px solid var(--spinner-color)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '16px'
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  marginBottom: '8px',
  margin: 0
};

export default FullScreenLoading;
