/**
 * You Can Include This In Any Modal Body That We Want To Render
 * Just Make Sure To Add These To The Parent Component Calling This 
 * And Pass The Ref 
 * EX:
    const modalSidePanelRef = useRef(null);
    const togglePanelVisibility = () => {
        modalSidePanelRef.current.toggleVisibility();
    };

    <ModalSidePanel ref={modalSidePanelRef}>
        // Side Panel Contents
    </ModalSidePanel>

   This Will Expose The Function To Be Called Anywhere and toggle The Modal
   You Can Render Contents By Placing Components Or HTML Between The Tag
   That Way It'll Be Useable Anywhere   
 */
import React, { useState, forwardRef, useImperativeHandle } from 'react';

const ModalSidePanel = forwardRef(({ children, style }, ref) => {

  const [isVisible, setIsVisible] = useState(false);
  const [canvasTitle, setcanvasTitle] = useState('');

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  const openPanel = (title = '') => {
    setIsVisible(true);
    setcanvasTitle(title);
  };

  const getIsVisible = () => { return isVisible };

  // Expose toggleVisibility function to parent component via ref
  useImperativeHandle(ref, () => ({
    toggleVisibility,
    setcanvasTitle,
    openPanel,
    getIsVisible,
  }));

  const handleClose = () => setIsVisible(false);

  return (
    <>
      {isVisible && <div className={`offcanvas-backdrop fade show`} ></div>}
      <div className={`modal-side-panel ${isVisible ? 'show' : ''}`} style={style}>
        <div className="modal-side-panel-header">
          <div>
            <h5 id="offcanvasLabel">{canvasTitle}</h5>
          </div>

          <div>
          <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>

        </div>
        <div className="modal-side-panel-content">
          {isVisible && children}
        </div>
      </div>
    </>
  );
});

export default ModalSidePanel;
