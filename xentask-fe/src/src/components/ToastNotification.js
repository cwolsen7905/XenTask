// ToastNotification.js

import React from 'react';
/**
 * 
 * @param {string} id           - This Is Used To Keep Track Of The Individual Toast Notification
 * @param {string} header       - The Title To Show For The Toast
 * @param {string} message      - Show A Message 
 * @param {string} type         - Bootstrap Color Classes danger,info,succes,etc...
 * @param {jsx}    bodyContent  - Custom Content We Want To Add 
 *  
 * @returns 
 */
const ToastNotification = ({ id, header = 'SYSTEM', message, type, bodyContent='' }) => {
  return (
    <div key={id} className={`toast fade show text-bg-${type}`}>
      <div className="toast-header">
        <strong className="me-auto">{header}</strong>
      </div>
      <div className="toast-body">
        <h6>{message}</h6>
        {bodyContent}
      </div>
    </div>
  );
};

export default ToastNotification;
