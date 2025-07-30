import React from 'react';
import '../styles/PDFPreview.css';

const PDFPreview = ({ pdfPath }) => {
  if (!pdfPath) {
    return (
      <div className="pdf-preview-container">
        <div className="no-pdf">No PDF selected</div>
      </div>
    );
  }

  const fullPath = `${window.location.origin}${pdfPath}`;

  return (
    <div className="pdf-preview-container">
      <h3>PDF Preview</h3>
      <div className="pdf-viewer">
        <iframe
          src={fullPath}
          title="PDF Preview"
          width="100%"
          height="600px"
          style={{ border: 'none' }}
        >
          <p>
            Your browser does not support PDFs. 
            <a href={fullPath} target="_blank" rel="noopener noreferrer">
              Download the PDF
            </a>
          </p>
        </iframe>
      </div>
      <div className="pdf-actions">
        <a 
          href={fullPath} 
          target="_blank" 
          rel="noopener noreferrer"
          className="pdf-link"
        >
          Open in New Tab
        </a>
      </div>
    </div>
  );
};

export default PDFPreview;