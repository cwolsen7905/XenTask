// ResizableColumns.js
import React, { useState } from 'react';
import './ResizableColumns.css'; // Custom CSS for resizing
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles

function ResizableColumns({ children }) {
  const [columnWidths, setColumnWidths] = useState({}); // Store column widths

  const handleResize = (columnKey, newWidth) => {
    setColumnWidths((prevWidths) => ({
      ...prevWidths,
      [columnKey]: newWidth,
    }));
  };

  return (
    <div className="resizable-columns">
      {React.Children.map(children, (child, index) => (
        <div
          className="resizable-column"
          style={{ width: columnWidths[`column${index + 1}`] || 'auto' }}
        >
          {child}
          <div className="resize-handle" />
        </div>
      ))}
    </div>
  );
}

export default ResizableColumns;