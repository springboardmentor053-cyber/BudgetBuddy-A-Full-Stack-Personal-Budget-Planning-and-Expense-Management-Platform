import { useEffect, useState } from "react";


function DashboardCard({
  title,
  value,
  icon,
  color = "bg-[#101C2E]",
}) {

  /* =========================================================
     DETECT CURRENT THEME
  ========================================================= */

  const [darkMode, setDarkMode] = useState(() => {

    return document.documentElement.classList.contains(
      "dark"
    );

  });


  /* =========================================================
     WATCH FOR THEME CHANGES FROM TOPBAR
  ========================================================= */

  useEffect(() => {

    const root =
      document.documentElement;


    const updateTheme = () => {

      setDarkMode(
        root.classList.contains("dark")
      );

    };


    // Check immediately
    updateTheme();


    // Watch <html> for dark class changes
    const observer =
      new MutationObserver(
        updateTheme
      );


    observer.observe(
      root,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );


    return () => {

      observer.disconnect();

    };

  }, []);


  /* =========================================================
     CARD COLOR THEME
  ========================================================= */

  const titleLower =
    title.toLowerCase();


  let theme = {

    lightBackground: "#101C2E",

    lightAccent: "#101C2E",

    darkBackground: "#25344A",

    darkAccent: "#7C8EA6",

  };


  /* =========================================================
     INCOME
  ========================================================= */

  if (
    titleLower.includes("income")
  ) {

    theme = {

      lightBackground: "#92643E",

      lightAccent: "#92643E",

      darkBackground: "#6F5138",

      darkAccent: "#C0956D",

    };

  }


  /* =========================================================
     EXPENSE
  ========================================================= */

  if (
    titleLower.includes("expense")
  ) {

    theme = {

      lightBackground: "#56061D",

      lightAccent: "#56061D",

      darkBackground: "#701C38",

      darkAccent: "#B53A5D",

    };

  }


  /* =========================================================
     BALANCE
  ========================================================= */

  if (
    titleLower.includes("balance")
  ) {

    theme = {

      lightBackground: "#101C2E",

      lightAccent: "#101C2E",

      darkBackground: "#25344A",

      darkAccent: "#8FA4BF",

    };

  }


  /* =========================================================
     BUDGET
  ========================================================= */

  if (
    titleLower.includes("budget")
  ) {

    theme = {

      lightBackground: "#92643E",

      lightAccent: "#92643E",

      darkBackground: "#6F5138",

      darkAccent: "#C0956D",

    };

  }


  /* =========================================================
     COLORS BASED ON CURRENT MODE
  ========================================================= */

  const cardBackground =
    darkMode
      ? "#172337"
      : "#FFFFFF";


  const cardBorder =
    darkMode
      ? "#2A3A52"
      : "#E5DDD2";


  const titleColor =
    darkMode
      ? "#B7C0CC"
      : "#6F665B";


  const valueColor =
    darkMode
      ? "#F8FAFC"
      : "#101C2E";


  const iconBackground =
    darkMode
      ? theme.darkBackground
      : theme.lightBackground;


  const accentColor =
    darkMode
      ? theme.darkAccent
      : theme.lightAccent;


  const iconColor =
    "#F3EBDD";


  /* =========================================================
     CARD
  ========================================================= */

  return (

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[1.5rem]
        p-6
        border
        transition-all
        duration-300
        hover:-translate-y-1
      "
      style={{

        backgroundColor:
          cardBackground,

        borderColor:
          cardBorder,

        boxShadow: darkMode
          ? "0 12px 30px rgba(0,0,0,0.28)"
          : "0 8px 25px rgba(16,28,46,0.07)",

      }}
    >

      {/* =================================================
          SOFT DECORATIVE GLOW
      ================================================= */}

      <div
        className="
          absolute
          -right-12
          -top-12
          w-36
          h-36
          rounded-full
          blur-3xl
          transition-opacity
          duration-300
        "
        style={{

          backgroundColor:
            accentColor,

          opacity:
            darkMode
              ? 0.10
              : 0.08,

        }}
      />


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className="
          relative
          flex
          justify-between
          items-start
          gap-4
        "
      >

        {/* =================================================
            TEXT
        ================================================= */}

        <div className="min-w-0">

          <p
            className="
              text-sm
              font-medium
              tracking-wide
            "
            style={{
              color:
                titleColor,
            }}
          >
            {title}
          </p>


          <h2
            className="
              text-3xl
              md:text-4xl
              font-semibold
              mt-3
              tracking-tight
              truncate
            "
            style={{
              color:
                valueColor,
            }}
          >
            {value}
          </h2>

        </div>


        {/* =================================================
            ICON
        ================================================= */}

        <div
          className="
            w-14
            h-14
            shrink-0
            rounded-2xl
            flex
            items-center
            justify-center
            text-2xl
            shadow-md
          "
          style={{

            backgroundColor:
              iconBackground,

            color:
              iconColor,

            boxShadow: darkMode
              ? "0 6px 18px rgba(0,0,0,0.22)"
              : "0 6px 18px rgba(16,28,46,0.10)",

          }}
        >
          {icon}
        </div>

      </div>


      {/* =================================================
          BOTTOM ACCENT
      ================================================= */}

      <div
        className="
          absolute
          bottom-0
          left-6
          right-6
          h-[3px]
          rounded-full
          transition-opacity
          duration-300
        "
        style={{

          backgroundColor:
            accentColor,

          opacity:
            darkMode
              ? 0.65
              : 0.40,

        }}
      />

    </div>

  );

}


export default DashboardCard;