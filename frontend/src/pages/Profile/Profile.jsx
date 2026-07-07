import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaWallet,
  FaEdit,
} from "react-icons/fa";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-4xl font-bold">
            My Profile
          </h1>

          <p className="text-gray-400 mt-2">
            Manage your personal information.
          </p>
        </div>

        <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
          <FaEdit />
          Edit Profile
        </button>

      </div>

      {/* Profile Card */}

      <div className="bg-slate-800 rounded-3xl p-8 shadow-lg">

        <div className="flex flex-col md:flex-row items-center gap-8">

          <FaUserCircle className="text-9xl text-cyan-400" />

          <div>

            <h2 className="text-3xl font-bold">
              John Doe
            </h2>

            <p className="text-gray-400 mt-2">
              Premium BudgetBuddy User
            </p>

          </div>

        </div>

      </div>

      {/* Information */}

      <div className="grid lg:grid-cols-2 gap-8 mt-10">

        <div className="bg-slate-800 rounded-2xl p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Personal Details
          </h2>

          <div className="space-y-5">

            <div className="flex items-center gap-4">
              <FaEnvelope className="text-cyan-400" />
              <span>johndoe@gmail.com</span>
            </div>

            <div className="flex items-center gap-4">
              <FaPhone className="text-cyan-400" />
              <span>+91 9876543210</span>
            </div>

            <div className="flex items-center gap-4">
              <FaMapMarkerAlt className="text-cyan-400" />
              <span>Hyderabad, India</span>
            </div>

            <div className="flex items-center gap-4">
              <FaBriefcase className="text-cyan-400" />
              <span>Software Engineer</span>
            </div>

          </div>

        </div>

        {/* Financial Details */}

        <div className="bg-slate-800 rounded-2xl p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Financial Details
          </h2>

          <div className="space-y-6">

            <div className="flex justify-between items-center">

              <span>Monthly Income</span>

              <span className="text-green-400 font-bold">
                ₹70,000
              </span>

            </div>

            <div className="flex justify-between items-center">

              <span>Monthly Expenses</span>

              <span className="text-red-400 font-bold">
                ₹45,000
              </span>

            </div>

            <div className="flex justify-between items-center">

              <span>Total Savings</span>

              <span className="text-yellow-400 font-bold">
                ₹25,000
              </span>

            </div>

            <div className="flex justify-between items-center">

              <span>Current Balance</span>

              <span className="text-cyan-400 font-bold">
                ₹1,20,000
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="bg-slate-800 rounded-2xl p-6 text-center">

          <FaWallet className="text-cyan-400 text-5xl mx-auto mb-4" />

          <h3 className="text-gray-400">
            Total Transactions
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            120
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-center">

          <h3 className="text-gray-400">
            Budgets Created
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            8
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-center">

          <h3 className="text-gray-400">
            Savings Goals
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            3
          </h2>

        </div>

      </div>

    </div>
  );
}