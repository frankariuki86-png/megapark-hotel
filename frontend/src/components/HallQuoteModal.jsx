import React, { useState } from 'react';

const HallQuoteModal = ({ isOpen, onClose, onSubmit, initial }) => {
  const [name, setName] = useState(initial?.contactName || '');
  const [phone, setPhone] = useState(initial?.contactPhone || '');
  const [email, setEmail] = useState(initial?.contactEmail || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  if (!isOpen) return null;

  return (
    <div className="hq-modal-backdrop">
      <div className="hq-modal">
        <h3>Request a Quote</h3>
        <p>Please provide contact details so we can send a quotation.</p>
        <div className="hq-form">
          <label>Full name*</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} />
          <label>Phone*</label>
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <label>Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} />
          <label>Notes / Requirements</label>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={4} />
        </div>
        <div className="hq-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => {
            if (!name || !phone) return alert('Name and phone are required');
            onSubmit({ contactName: name, contactPhone: phone, contactEmail: email, notes });
          }}>Send Request</button>
        </div>
      </div>
    </div>
  );
};

export default HallQuoteModal;
