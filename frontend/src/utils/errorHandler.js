export function getErrorMessage(error) {

  // =====================================================
  // NO RESPONSE FROM SERVER
  // =====================================================

  if (!error.response) {

    return "Unable to connect to the server. Please try again.";

  }


  const data = error.response.data;


  // =====================================================
  // SIMPLE ERROR MESSAGE
  // =====================================================

  if (typeof data === "string") {

    return data;

  }


  // =====================================================
  // GENERAL ERROR
  // =====================================================

  if (data?.error) {

    return data.error;

  }


  if (data?.detail) {

    return data.detail;

  }


  // =====================================================
  // VALIDATION ERRORS
  // =====================================================

  if (typeof data === "object") {

    const messages = [];


    Object.entries(data).forEach(
      ([field, errors]) => {

        if (Array.isArray(errors)) {

          errors.forEach(
            (message) => {

              messages.push(
                message
              );

            }
          );

        } else if (
          typeof errors === "string"
        ) {

          messages.push(
            errors
          );

        }

      }
    );


    if (messages.length > 0) {

      return messages.join("\n");

    }

  }


  // =====================================================
  // FALLBACK
  // =====================================================

  return "Something went wrong. Please try again.";

}