import React from 'react';

const Debug = () => {
  return (
    <div className="debug-page">
      <h1>Debug Page</h1>
      <p>If you can see this page, React is working correctly!</p>
      <div>
        <h2>Environment Information:</h2>
        <pre>
          {JSON.stringify({
            currentUrl: window.location.href,
            reactVersion: React.version,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Debug;