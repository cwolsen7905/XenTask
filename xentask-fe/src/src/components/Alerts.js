import { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';

const Alerts = ( { children, header, showAlert, confirmAction, cancelAction, hasOverlay, varient="danger", showCancelButton=true } ) => {

  const [show, setShow] = useState(showAlert);

  useEffect(() => {
    setShow(showAlert);
  }, [showAlert]);

  return(
    <>
    
      <Alert show={show} variant={varient} style={{
        position: 'fixed',
        top: 50 + '%',
        left: 50 + '%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2000,
      }}>

        <Alert.Heading>{header}<CloseButton className="float-end" onClick={cancelAction}/></Alert.Heading>
        {children}
        <hr />
        <div className="d-flex justify-content-end">

          <Button type="button" className="me-2" onClick={confirmAction} variant="outline-success">
            Confirm
          </Button>

          {showCancelButton && 
            <Button type="button" onClick={cancelAction} variant="outline-danger">
              Cancel
            </Button>
          }
          

        </div>

      </Alert>

      { 
        show && hasOverlay && 
        <div className={`offcanvas-backdrop fade show`} style={{ backdropFilter: "blur(25px)"}}></div> }

      </>
  );
}

export default Alerts;