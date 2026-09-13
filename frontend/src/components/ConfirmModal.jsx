function ConfirmModal({ message, onConfirm, onCancel }) {
  if (!message) return null;

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        <div style={iconStyle}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#ef4444", fontSize: "28px" }}></i>
        </div>

        <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 600, color: "#0f172a" }}>
          Are you sure?
        </h3>

        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b", textAlign: "center" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button style={cancelBtnStyle} onClick={onCancel}>
            Cancel
          </button>
          <button style={confirmBtnStyle} onClick={onConfirm}>
            <i className="bi bi-trash3"></i> Delete
          </button>
        </div>

      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  zIndex: 9998,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle = {
  background: "#fff",
  borderRadius: "14px",
  padding: "32px 28px",
  width: "100%",
  maxWidth: "360px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const iconStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "#fef2f2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
};

const cancelBtnStyle = {
  padding: "9px 20px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#475569",
  fontWeight: 500,
  fontSize: "14px",
  cursor: "pointer",
};

const confirmBtnStyle = {
  padding: "9px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontWeight: 500,
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

export default ConfirmModal;
