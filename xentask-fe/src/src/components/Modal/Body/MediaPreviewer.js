import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const MediaPreviewer = ({ show, mediaInfo, handleClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null);

  const { name, mediaUrl, type } = mediaInfo;

  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setTextContent('');  // Reset text content when media changes

    if (type === 'pdf') {
      setLoading(true);
      axios.get(mediaUrl, {
        responseType: 'blob',
        withCredentials: true,
      })
        .then((response) => {
          const url = URL.createObjectURL(response.data);
          setPdfUrl(url);
        })
        .catch((error) => {
          console.error('Error fetching PDF:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    if (type === 'text') {
      setLoading(true);
      axios.get(mediaUrl, {
        responseType: 'text',
        withCredentials: true,
      })
        .then((response) => {
          setTextContent(response.data);
        })
        .catch((error) => {
          console.error('Error fetching text file:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mediaUrl, type]);

  const handleZoomIn = () => setZoomLevel((prevZoom) => prevZoom + 0.1);
  const handleZoomOut = () => setZoomLevel((prevZoom) => (prevZoom > 1 ? prevZoom - 0.1 : 1));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      setDragging(true);
      setOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  const handleSliderChange = (e) => {
    const newZoomLevel = parseFloat(e.target.value);
    setZoomLevel(newZoomLevel);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" fullscreen centered>
      <Modal.Header closeButton>
        <Modal.Title>{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex justify-content-center align-items-center"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()} // prevent context menu on right-click
        onWheel={handleWheel} // handle zoom with mouse wheel
        style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}
      >
        {loading ? (
          <Spinner animation="border" />
        ) : type === 'image' ? (
          <div
            ref={imgRef}
            style={{
              cursor: dragging ? 'grabbing' : 'grab',
              transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
              transition: dragging ? 'none' : 'transform 0.3s',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()} // prevent dragstart event
          >
            <img src={mediaUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', userSelect: 'none' }} />
          </div>
        ) : type === 'video' ? (
          <video src={mediaUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
        ) : type === 'pdf' && pdfUrl ? (
          <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
        ) : type === 'text' ? (
          <pre style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'auto' }}>{textContent}</pre>
        ) : null}
      </Modal.Body>
      {(type === 'image' ) && (
        <Modal.Footer className="w-100 d-flex justify-content-center align-items-center">
          <Button variant="danger" onClick={handleZoomOut}>Zoom Out</Button>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={handleSliderChange}
            style={{ width: '200px', margin: '0 10px' }}
          />
          <Button variant="primary" onClick={handleZoomIn}>Zoom In</Button>
          <Button variant="info" onClick={handleResetZoom}>Reset</Button>
        </Modal.Footer>
      )}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MediaPreviewer;
