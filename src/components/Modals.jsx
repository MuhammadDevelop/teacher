import React, { useEffect } from 'react';
import './Modals.css';

const ModalOverlay = ({ children }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container stagger-1">
        {children}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, title, text, onConfirm, onCancel, confirmText = "Tasdiqlash", cancelText = "Bekor qilish", confirmColor = "var(--error)" }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <h3 className="modal-title">{title}</h3>
      <p className="modal-text">{text}</p>
      <div className="modal-actions">
        <button className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={onCancel}>{cancelText}</button>
        <button className="btn" style={{ background: confirmColor, color: '#fff' }} onClick={onConfirm}>{confirmText}</button>
      </div>
    </ModalOverlay>
  );
};

export const PromptModal = ({ isOpen, title, text, onConfirm, onCancel, confirmText = "Yuborish", cancelText = "Bekor", type = "text", placeholder = "" }) => {
  const [val, setVal] = React.useState("");

  React.useEffect(() => {
    if (isOpen) setVal("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <h3 className="modal-title">{title}</h3>
      {text && <p className="modal-text">{text}</p>}
      <input 
        type={type}
        className="form-input modal-input" 
        value={val} 
        onChange={(e) => setVal(e.target.value)} 
        placeholder={placeholder}
        autoFocus
        onKeyDown={(e) => { if(e.key === 'Enter') onConfirm(val) }}
      />
      <div className="modal-actions">
        <button className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={onCancel}>{cancelText}</button>
        <button className="gradient-btn" onClick={() => onConfirm(val)}>{confirmText}</button>
      </div>
    </ModalOverlay>
  );
};
