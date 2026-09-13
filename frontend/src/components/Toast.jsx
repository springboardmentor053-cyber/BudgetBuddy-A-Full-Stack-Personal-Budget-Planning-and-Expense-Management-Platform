import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 20px",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "360px",
    animation: "slideIn 0.3s ease",
    background: type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#f59e0b",
    color: "#fff",
  };

  const icon = type === "success" ? "bi-check-circle-fill"
    : type === "error" ? "bi-exclamation-circle-fill"
    : "bi-exclamation-triangle-fill";

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      <div style={styles}>
        <i className={`bi ${icon}`}></i>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0 0 0 8px", fontSize: "16px" }}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </>
  );
}

export default Toast;
