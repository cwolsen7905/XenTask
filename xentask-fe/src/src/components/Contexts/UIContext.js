import React, { createContext, useContext, useState } from 'react';
import { Modal } from 'react-bootstrap';
import GenericModal from '../Modal/GenericModal.js';
import TaskCreate from '../Modal/Body/TaskCreate.js';
import TaskModal from '../Modal/Body/TaskModal/TaskView.js';
import ToastNotification from '../ToastNotification.js';
import MediaPreviewer from '../Modal/Body/MediaPreviewer.js';
import Checkout from '../Modal/Body/Checkout.js';
import Alerts from '../Alerts.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { DataContext } from './DataContext.js';

const UIContext = createContext('');

export const UIProvider = ({ children }) => {

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //  MODAL UI RELATED   
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSize, setModalSize] = useState('modal-lg');
  const [modalScrollable, setModalScrollable] = useState('');
  const [onOpenCallBack, setOpenCallBack] = useState(null);
  const [onCloseCallBack, setCloseCallBack] = useState(null);


  // Function to get the appropriate modal component based on type
  const getModal = (type, props) => {

    //console.log(props);

    //  Show A Modal 
    //  CompProps Are Passed Throguh To The Child Component
    switch (type) {

      case ('createTask'):
        return <TaskCreate
                  listId={props.listId}
                  endAction={
                    (data) => {
                      if( props.callBack ) props.callBack(data);
                      closeModal();
                    }
                  } 
                />

      case ('taskView'):

        console.log("Modal",props.list_hash);

        return <TaskModal
          taskId={props.taskId} 
          listId={props.listId} 
          taskName={props.taskName} 
          closeModal={props.closeModal} 
        />;

      case ('checkout'):
        return <Checkout />;


      default:
        return <GenericModal {...props} />;

    }

  };

  /**
   * Sometimes You Want To Open Another Modal During A View
   * This Will Close The Modal And Open The Other
   * 
   * @param {*} options 
   * @param {*} title 
   * @param {*} modalOptions 
   */
  function closeThenOpen( options, title, modalOptions, callBack ) {

    //  Reset Everything First
    closeModal();

    //  Then Display The Proper Modal
    openModal(options, title, modalOptions);

  }

  /**
   * 
   * @param {*} title - The Title For Our Modal
   * @param {*} options - type: The Type Of Modal You Want To Display Can Leave Blank 
   *                      compProps: The Properties The Child Components Should Be Passed
   * @param {*} modalOptions - Can Set Size, Scrollable, etc here
   * @param {object} callBack - { open: func, close: func} - An Object Passing CallBack Functions For When Opening And Closing A Modal
   */
  function openModal(
    title = "",
    options = {
      type: '', 
      compProps: {} 
    }, 
    modalOptions = {}, 
    callBack = {}

  ) {

    // Destructure type and props from options
    let {
      type,               //  The Type Of Modal To Display Default Is GeneralModal
      compProps,          //  The Component Props To Pass To The Child
    } = options;

    let {
      modalSize,
      modalBodyHeight,
      scrollable
    } = modalOptions;

    // If type or props are not provided in options, use default values
    type = type || '';
    compProps = compProps || {};

    //  Activates A Close CallBack When The Modal Closes 
    if ('close' in callBack) {

      console.log('THERE IS A CALLBACK FUNCTION ONCE MODAL HAS CLOSED');
      setCloseCallBack( () => callBack.close );

    }

    // Allows Us To Close Or Open A New Modal Anywhere
    // Set New Props Here Like Body Height Etc That A Child Component May Need
    compProps['closeModal'] = closeModal;
    compProps['openModal'] = closeThenOpen;
    compProps['modalBodyHeight'] = modalBodyHeight || '';

    //console.log("compProps",compProps);
    setModalTitle(title);
    setModalSize(modalSize);
    setModalScrollable(scrollable || '');

    try {
      const content = getModal(type, compProps);
      if (content) setModalContent(content);
    } catch (error) {
      console.error('Error opening modal:', error);
    }

  };

  const closeModal = ( resp ) => {

    if( onCloseCallBack ) {
      
      console.log("CALLEBACK CALLED:", resp );
      onCloseCallBack(resp);

    } else {
     
    }

    setModalSize(null);
    setModalContent(null);
    setCloseCallBack(null);

  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //  MEDIA MODAL   
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  //  Toggle The State Of The Modal
  const [showMediaModal, setMediaPreview ] = useState(false);   
  const [mediaInfo, setMediaInfo] = useState({}); 

  const openMediaModal = ( mediaInfo ) => {
    setMediaInfo(mediaInfo)
    setMediaPreview(true);
  }

  const closeMediaModal = () => {
    setMediaInfo({})
    setMediaPreview(false);
  }

  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //  Billing Modal  
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  //  Toggle The State Of The Modal
  const [billingModalState, showBillingModal ] = useState(false);   
  const [billingItems, setBillingItems] = useState({}); 

  const openBillingModal = ( items, type ) => {

    setBillingItems(items)
    showBillingModal(true);

  }

  const closeBillingModal = () => {
    setBillingItems({})
    showBillingModal(false);
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //  Toast UI RELATED   
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [toasts, setToasts] = useState([]);

  // Function to show toast notification
  const showToastNotification = ({ 
    message, 
    header = 'SYSTEM', 
    type = 'primary',
    timeout = 4000,
    bodyContent = '', 
  }) => {

    const newToast = {
      id: uuidv4(),
      header,
      message,
      type,
      bodyContent
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Automatically remove toast after x amount of seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, timeout);

  };

  // Function to remove a toast from the list
  const removeToast = (toastId) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //  Relogin Alert Box
  //
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const { globalData } = useContext(DataContext);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [failedRequests, setFailedRequests] = useState([]); // Queue to store failed requests
  const [isRefreshing, setIsRefreshing] = useState(false); // Flag to track session refresh status

  // Add a response interceptor
  axios.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      const originalRequest = error.config;

      // Handle errors If Users Session Expired
      if (error.response && error.response.status === 401) {
        if (!isRefreshing) {
          setSessionExpired(true);
          setIsRefreshing(true);
        }

        // Return a promise to handle request retry after session refresh
        return new Promise((resolve, reject) => {
          // Add the failed request to the queue
          setFailedRequests(prev => [...prev, { originalRequest, resolve, reject }]);
        });
      }

      return Promise.reject(error);
    }
  );

  // Logs The User Back In
  const refreshSession = async () => {
    try {
      const formData = new FormData();
      formData.append('m', 'login');
      formData.append('email', globalData.USER.email);
      formData.append('password', password);

      const response = await axios.post(`https://${globalData.login_api_url}/`, formData, { withCredentials: true });

      if (response.status === 200) {
        setSessionExpired(false);
        setPassword('');
        setPasswordError(false);
        setIsRefreshing(false);

        // Retry all failed requests
        failedRequests.forEach(({ originalRequest, resolve, reject }) => {
          axios(originalRequest)
            .then(response => resolve(response))
            .catch(error => reject(error));
        });

        // Clear the failed requests queue
        setFailedRequests([]);

      }

    } catch (error) {
      setPasswordError(true);
      setIsRefreshing(false);
    }
  };

  // Redirect The User To Login If They Cancel
  const redirectToLogin = () => {
    localStorage.removeItem('auth');
    window.location.href = "/";
  }

  return (

    <UIContext.Provider value={{
      // General Modal
      openModal,
      closeModal,
      closeThenOpen,
      // Toasts Notifications
      showToastNotification,
      // Media Modal
      openMediaModal,
      // Billing Modal UI
      openBillingModal,
      setBillingItems,
    }}>

      {children}

      {/* Show Modal UI */}
      <Modal 
        show={
          !!modalContent && !sessionExpired && !showMediaModal
        } 
        onHide={closeModal} 
        className={`${modalSize}`} 
        autoFocus={false}
        focusTrap={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        {modalContent}
      </Modal>
      
      {/* Media Previewer */}
      <MediaPreviewer show={showMediaModal} mediaInfo={mediaInfo} handleClose={closeMediaModal}/>


      {/* Show Toast Notifications */}
      <div className="toast-container p-3 bottom-0 end-0 position-fixed">
        {toasts.map((toast) => (
          <ToastNotification 
            key={toast.id} 
            header={toast.header} 
            message={toast.message} 
            type={toast.type}
            bodyContent={toast.bodyContent} 
            />
        ))}
      </div>

      {/* Alerts Modal Overlay */}
      <Alerts
        showAlert={sessionExpired}
        hasOverlay={true}
        varient={"primary"}
        confirmAction={refreshSession}
        cancelAction={redirectToLogin}
      >
        <p>Your Session Has Expired. Please Type In Your Password To Resume Your Session</p>
        <input
          type="password"
          className={`form-control ${passwordError ? "is-invalid" : ''}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Alerts>




    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
