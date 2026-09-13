import { useState, useCallback } from "react";

function useToast() {
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ message: "", type: "success" });
  }, []);

  return { toast, showToast, hideToast };
}

export default useToast;
