import {
  FaBell,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

export default function Topbar() {
  const today = new Date();

  const date = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hour = today.getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <header className="bg-slate-900 rounded-2xl p-5 shadow-lg flex justify-between items-center mb-8">

      {/* Left */}

      <div>
        <h1 className="text-3xl font-bold text-white">
          {greeting} 👋
        </h1>

        <p className="text-gray-400 mt-1">
          {date}
        </p>
      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="hidden md:flex items-center bg-slate-800 px-4 py-2 rounded-xl">

          <FaSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-3 text-white"
          />

        </div>

        {/* Notification */}

        <button className="bg-slate-800 p-3 rounded-xl hover:bg-slate-700 transition">
          <FaBell className="text-cyan-400 text-xl" />
        </button>

        {/* Profile */}

        <div className="flex items-center gap-3">

          <FaUserCircle className="text-4xl text-cyan-400" />

          <div>

            <h2 className="text-white font-semibold">
              Welcome
            </h2>

            <p className="text-gray-400 text-sm">
              BudgetBuddy User
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}