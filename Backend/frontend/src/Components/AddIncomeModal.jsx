import { useEffect, useState } from "react";
import { FaTimes, FaRupeeSign } from "react-icons/fa";

function AddIncomeModal({
  isOpen,
  onClose,
  onSave,
  editingIncome = null,
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "Salary",
    income_date: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  /* =========================================
     SET FORM DATA
  ========================================= */

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        title: editingIncome.title || "",
        amount: editingIncome.amount || "",
        source: editingIncome.source || "Salary",
        income_date: editingIncome.income_date || "",
        description: editingIncome.description || "",
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        source: "Salary",
        income_date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [editingIncome, isOpen]);


  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter an income title.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!formData.income_date) {
      alert("Please select an income date.");
      return;
    }

    try {
      setSaving(true);

      await onSave({
        ...formData,
        amount: Number(formData.amount),
      });

    } catch (error) {
      console.error("Error saving income:", error);
    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     CLOSE
  ========================================= */

  if (!isOpen) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* =====================================
          BACKDROP
      ===================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[#101C2E]/80
          backdrop-blur-sm
        "
        onClick={onClose}
      />


      {/* =====================================
          MODAL
      ===================================== */}

      <div
        className="
          relative
          w-full
          max-w-2xl
          max-h-[90vh]
          overflow-hidden
          rounded-[1.75rem]
          bg-[#101C2E]
          border
          border-[#34465B]
          shadow-[0_25px_80px_rgba(16,28,46,0.55)]
          animate-fadeIn
        "
      >

        {/* ===================================
            HEADER
        =================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            md:px-7
            py-5
            border-b
            border-[#34465B]
            bg-[#101C2E]
          "
        >

          <div>

            <h2 className="text-2xl font-bold text-[#F3EBDD]">
              {editingIncome ? "Edit Income" : "Add Income"}
            </h2>

            <p className="text-sm text-[#B8A895] mt-1">
              {editingIncome
                ? "Update your income transaction."
                : "Add a new income transaction."}
            </p>

          </div>


          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={onClose}
            className="
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
              bg-[#18263A]
              border
              border-[#34465B]
              text-[#B8A895]
              hover:bg-[#26364A]
              hover:text-[#F3EBDD]
              transition-all
              duration-200
              cursor-pointer
            "
          >
            <FaTimes />
          </button>

        </div>


        {/* ===================================
            SCROLLABLE FORM AREA
        =================================== */}

        <div
          className="
            max-h-[calc(90vh-90px)]
            overflow-y-auto
            px-6
            md:px-7
            py-6
          "
        >

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* =================================
                  TITLE
              ================================= */}

              <div className="md:col-span-2">

                <label className="block text-sm font-semibold text-[#D8C9B6] mb-2">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Monthly Salary"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-[#18263A]
                    border
                    border-[#34465B]
                    text-[#F3EBDD]
                    placeholder-[#718096]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/20
                  "
                />

              </div>


              {/* =================================
                  AMOUNT
              ================================= */}

              <div>

                <label className="block text-sm font-semibold text-[#D8C9B6] mb-2">
                  Amount
                </label>

                <div className="relative">

                  <FaRupeeSign
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#92643E]
                      text-sm
                    "
                  />

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="
                      w-full
                      pl-10
                      pr-4
                      py-3
                      rounded-xl
                      bg-[#18263A]
                      border
                      border-[#34465B]
                      text-[#F3EBDD]
                      placeholder-[#718096]
                      outline-none
                      transition
                      focus:border-[#92643E]
                      focus:ring-2
                      focus:ring-[#92643E]/20
                    "
                  />

                </div>

              </div>


              {/* =================================
                  SOURCE
              ================================= */}

              <div>

                <label className="block text-sm font-semibold text-[#D8C9B6] mb-2">
                  Source
                </label>

                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-[#18263A]
                    border
                    border-[#34465B]
                    text-[#F3EBDD]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/20
                  "
                >

                  <option value="Salary">
                    Salary
                  </option>

                  <option value="Scholarship">
                    Scholarship
                  </option>

                  <option value="Freelance">
                    Freelance
                  </option>

                  <option value="Business">
                    Business
                  </option>

                  <option value="Investment">
                    Investment
                  </option>

                  <option value="Gift">
                    Gift
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* =================================
                  INCOME DATE
              ================================= */}

              <div className="md:col-span-2">

                <label className="block text-sm font-semibold text-[#D8C9B6] mb-2">
                  Income Date
                </label>

                <input
                  type="date"
                  name="income_date"
                  value={formData.income_date}
                  onChange={handleChange}
                  className="
                    w-full
                    md:w-1/2
                    px-4
                    py-3
                    rounded-xl
                    bg-[#18263A]
                    border
                    border-[#34465B]
                    text-[#F3EBDD]
                    outline-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/20
                  "
                />

              </div>


              {/* =================================
                  DESCRIPTION
              ================================= */}

              <div className="md:col-span-2">

                <label className="block text-sm font-semibold text-[#D8C9B6] mb-2">

                  Description

                  <span className="text-[#718096] font-normal">
                    {" "} (Optional)
                  </span>

                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add some details about this income..."
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-[#18263A]
                    border
                    border-[#34465B]
                    text-[#F3EBDD]
                    placeholder-[#718096]
                    outline-none
                    resize-none
                    transition
                    focus:border-[#92643E]
                    focus:ring-2
                    focus:ring-[#92643E]/20
                  "
                />

              </div>

            </div>


            {/* =================================
                BUTTON AREA
            ================================= */}

            <div
              className="
                flex
                justify-end
                gap-3
                mt-7
                pt-5
                border-t
                border-[#34465B]
              "
            >

              {/* CANCEL */}

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="
                  px-6
                  py-3
                  rounded-xl
                  bg-[#18263A]
                  border
                  border-[#34465B]
                  text-[#D8C9B6]
                  font-semibold
                  hover:bg-[#26364A]
                  hover:text-[#F3EBDD]
                  transition
                  cursor-pointer
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              {/* SAVE */}

              <button
                type="submit"
                disabled={saving}
                className="
                  px-7
                  py-3
                  rounded-xl
                  bg-[#56061D]
                  hover:bg-[#6D0A27]
                  text-[#F3EBDD]
                  font-semibold
                  shadow-[0_8px_20px_rgba(86,6,29,0.30)]
                  transition-all
                  duration-200
                  cursor-pointer
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                {saving
                  ? "Saving..."
                  : editingIncome
                    ? "Update Income"
                    : "Save Income"}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddIncomeModal;