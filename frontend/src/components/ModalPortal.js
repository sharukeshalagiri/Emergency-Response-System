import React from 'react';
import ReactDOM from 'react-dom';
import './ModalPortal.css';

const ModalPortal = ({ children, onClose }) => {
  // Create portal element
  const portalRoot = document.getElementById('portal-root');
  
  // Create a div for this modal
  const modalElement = document.createElement('div');
  modalElement.className = 'modal-portal-container';

  React.useEffect(() => {
    // Append to portal root
    portalRoot.appendChild(modalElement);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Cleanup
      portalRoot.removeChild(modalElement);
      document.body.style.overflow = 'auto';
    };
  }, [modalElement, portalRoot]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      {children}
    </div>,
    modalElement
  );
};

export default ModalPortal;