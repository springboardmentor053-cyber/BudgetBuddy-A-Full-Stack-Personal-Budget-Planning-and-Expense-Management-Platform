import { useNavigate } from "react-router-dom";

import {
  FaExclamationTriangle,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";


function NotFound() {

  const navigate = useNavigate();


  return (

    <div
      className="
        min-h-screen
        bg-[#F5F2EC]
        flex
        items-center
        justify-center
        p-4
        sm:p-6
      "
    >

      <div
        className="
          w-full
          max-w-lg
          bg-white
          rounded-3xl
          border
          border-[#E5DDD2]
          shadow-[0_12px_35px_rgba(16,28,46,0.10)]
          p-6
          sm:p-10
          text-center
        "
      >

        {/* ICON */}

        <div
          className="
            w-20
            h-20
            sm:w-24
            sm:h-24
            mx-auto
            rounded-3xl
            bg-[#56061D]/10
            border
            border-[#56061D]/15
            flex
            items-center
            justify-center
            mb-6
          "
        >

          <FaExclamationTriangle
            className="
              text-[#56061D]
              text-3xl
              sm:text-4xl
            "
          />

        </div>


        {/* 404 */}

        <h1
          className="
            text-6xl
            sm:text-7xl
            font-extrabold
            text-[#56061D]
            leading-none
          "
        >
          404
        </h1>


        {/* TITLE */}

        <h2
          className="
            text-2xl
            sm:text-3xl
            font-bold
            text-[#101C2E]
            mt-4
          "
        >
          Page Not Found
        </h2>


        {/* DESCRIPTION */}

        <p
          className="
            text-[#6F665B]
            mt-3
            leading-relaxed
            text-sm
            sm:text-base
          "
        >
          Sorry, the page you are looking for
          doesn't exist or may have been moved.
        </p>


        {/* BUTTONS */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            items-center
            justify-center
            gap-3
            mt-8
          "
        >

          {/* BACK */}

          <button
            onClick={() =>
              navigate(-1)
            }
            className="
              cursor-pointer
              w-full
              sm:w-auto
              inline-flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              rounded-xl
              border
              border-[#D8C8B4]
              text-[#6F665B]
              hover:bg-[#F3EBDD]
              font-semibold
              transition
            "
          >

            <FaArrowLeft />

            Go Back

          </button>


          {/* HOME */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              cursor-pointer
              w-full
              sm:w-auto
              inline-flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              rounded-xl
              bg-[#56061D]
              hover:bg-[#6F0A27]
              text-white
              font-semibold
              shadow-md
              transition
            "
          >

            <FaHome />

            Go to Dashboard

          </button>

        </div>


        {/* BRAND */}

        <div
          className="
            mt-8
            pt-5
            border-t
            border-[#E5DDD2]
          "
        >

          <p
            className="
              text-sm
              font-semibold
              text-[#92643E]
            "
          >
            BudgetBuddy
          </p>

        </div>

      </div>

    </div>

  );

}


export default NotFound;