// components/PowerBIEmbed.js
import React from 'react';

const PowerBIEmbed = ({ src, title, width = "100%", height = "400px" }) => {
  if (!src) {
    return <div>Error: Power BI report source URL is missing.</div>;
  }

  return (
    <div className="powerbi-container" style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
      <iframe
        title={title}
        width={width}
        height={height}
        src={src}
        frameBorder="0"
        allowFullScreen={true}
        style={{ display: 'block', width: '100%' }} // Style for responsiveness
      ></iframe>
    </div>
  );
};

export default PowerBIEmbed;