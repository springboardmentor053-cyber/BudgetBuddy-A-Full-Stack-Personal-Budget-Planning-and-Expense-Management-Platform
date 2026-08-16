import { FaSignOutAlt } from "react-icons/fa";

function LogoutModal({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-[#101C2E]/75
        backdrop-blur-md
        px-4
      "
    >

      {/* =================================================
          MODAL
      ================================================= */}

      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full
          max-w-[420px]
          rounded-[2rem]
          p-8
          animate-fadeIn
          border
          shadow-2xl
        "
        style={{
          backgroundColor: "#F3EBDD",
          borderColor: "#D8C9B4",
          boxShadow:
            "0 25px 70px rgba(16,28,46,0.35)",
        }}
      >

        {/* =================================================
            LOGOUT ICON
        ================================================= */}

        <div className="flex justify-center mb-6">

          <div
            className="
              w-16
              h-16
              rounded-2xl
              flex
              items-center
              justify-center
              shadow-md
            "
            style={{
              backgroundColor: "#56061D",
              boxShadow:
                "0 10px 25px rgba(86,6,29,0.22)",
            }}
          >

            <FaSignOutAlt
              className="text-2xl"
              style={{
                color: "#F3EBDD",
              }}
            />

          </div>

        </div>


        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          className="
            text-2xl
            font-bold
            text-center
          "
          style={{
            color: "#101C2E",
          }}
        >
          Logout
        </h2>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p
          className="
            text-center
            mt-3
            font-medium
          "
          style={{
            color: "#4F463D",
          }}
        >
          Are you sure you want to logout?
        </p>


        <p
          className="
            text-center
            text-sm
            mt-2
            leading-relaxed
          "
          style={{
            color: "#8B8175",
          }}
        >
          You will need to login again to access
          your BudgetBuddy account.
        </p>


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="flex gap-4 mt-8">

          {/* CANCEL */}

          <button
            onClick={onClose}
            className="
              flex-1
              py-3
              rounded-xl
              font-semibold
              transition-all
              duration-300
              border
            "
            style={{
              backgroundColor: "#E7DCCB",
              borderColor: "#CDBDA8",
              color: "#101C2E",
            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.backgroundColor =
                "#DCCDB9";

              e.currentTarget.style.borderColor =
                "#B9A68F";

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.backgroundColor =
                "#E7DCCB";

              e.currentTarget.style.borderColor =
                "#CDBDA8";

            }}
          >
            Cancel
          </button>


          {/* LOGOUT */}

          <button
            onClick={onLogout}
            className="
              flex-1
              py-3
              rounded-xl
              font-semibold
              transition-all
              duration-300
              shadow-lg
            "
            style={{
              background:
                "linear-gradient(135deg, #56061D, #6F1730)",
              color: "#F3EBDD",
              boxShadow:
                "0 8px 20px rgba(86,6,29,0.25)",
            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.background =
                "linear-gradient(135deg, #6F1730, #92643E)";

              e.currentTarget.style.transform =
                "translateY(-1px)";

              e.currentTarget.style.boxShadow =
                "0 12px 25px rgba(86,6,29,0.30)";

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.background =
                "linear-gradient(135deg, #56061D, #6F1730)";

              e.currentTarget.style.transform =
                "translateY(0)";

              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(86,6,29,0.25)";

            }}
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default LogoutModal;