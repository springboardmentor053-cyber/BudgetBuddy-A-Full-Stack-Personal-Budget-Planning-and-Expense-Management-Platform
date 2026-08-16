import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaExchangeAlt,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
} from "react-icons/fa";

import {
  useSearchParams,
} from "react-router-dom";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";


function Transactions() {

  /* =====================================================
     SEARCH PARAMETER
  ===================================================== */

  const [searchParams] =
    useSearchParams();


  /* =====================================================
     STATE
  ===================================================== */

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState(
    searchParams.get("search") || ""
  );

  const [
    filterType,
    setFilterType,
  ] = useState("All");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     UPDATE SEARCH WHEN TOPBAR CHANGES URL
  ===================================================== */

  useEffect(() => {

    setSearch(
      searchParams.get("search") || ""
    );

  }, [searchParams]);


  /* =====================================================
     FETCH REAL INCOME + EXPENSE DATA
  ===================================================== */

  useEffect(() => {

    const fetchTransactions =
      async () => {

        try {

          setLoading(true);
          setError("");

          const token =
            localStorage.getItem(
              "access"
            );


          if (!token) {

            setTransactions([]);

            return;
          }


          const config = {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          };


          /* =============================================
             FETCH BOTH EXISTING ENDPOINTS
          ============================================= */

          const [
            incomeResponse,
            expenseResponse,
          ] = await Promise.all([

            api.get(
              "income/",
              config
            ),

            api.get(
              "expenses/",
              config
            ),

          ]);


          const incomes =
            Array.isArray(
              incomeResponse.data
            )
              ? incomeResponse.data
              : incomeResponse.data?.results ||
                [];


          const expenses =
            Array.isArray(
              expenseResponse.data
            )
              ? expenseResponse.data
              : expenseResponse.data?.results ||
                [];


          /* =============================================
             CONVERT INCOME
          ============================================= */

          const incomeTransactions =
            incomes.map(
              (income) => ({

                id:
                  `income-${income.id}`,

                originalId:
                  income.id,

                title:
                  income.title ||
                  "Income",

                category:
                  income.source ||
                  "Income",

                amount:
                  Number(
                    income.amount
                  ) || 0,

                date:
                  income.income_date ||
                  income.created_at ||
                  "",

                type:
                  "Income",

              })
            );


          /* =============================================
             CONVERT EXPENSE
          ============================================= */

          const expenseTransactions =
            expenses.map(
              (expense) => ({

                id:
                  `expense-${expense.id}`,

                originalId:
                  expense.id,

                title:
                  expense.title ||
                  "Expense",

                category:
                  expense.category ||
                  "Other",

                amount:
                  Number(
                    expense.amount
                  ) || 0,

                date:
                  expense.expense_date ||
                  expense.created_at ||
                  "",

                type:
                  "Expense",

              })
            );


          /* =============================================
             COMBINE
          ============================================= */

          const combined = [
            ...incomeTransactions,
            ...expenseTransactions,
          ];


          /* =============================================
             NEWEST FIRST
          ============================================= */

          combined.sort(
            (a, b) => {

              const dateA =
                a.date
                  ? new Date(a.date).getTime()
                  : 0;

              const dateB =
                b.date
                  ? new Date(b.date).getTime()
                  : 0;

              return dateB - dateA;

            }
          );


          setTransactions(
            combined
          );


        } catch (err) {

          console.error(
            "Transaction fetch error:",
            err
          );


          setError(
            err.response?.data?.detail ||
              "Unable to load transactions."
          );


          setTransactions([]);

        } finally {

          setLoading(false);

        }

      };


    fetchTransactions();

  }, []);


  /* =====================================================
     FILTER + SEARCH
  ===================================================== */

  const filteredTransactions =
    useMemo(() => {

      return transactions.filter(
        (transaction) => {

          const title =
            String(
              transaction.title ||
                ""
            ).toLowerCase();


          const category =
            String(
              transaction.category ||
                ""
            ).toLowerCase();


          const type =
            String(
              transaction.type ||
                ""
            ).toLowerCase();


          const searchText =
            search
              .trim()
              .toLowerCase();


          const matchesSearch =
            title.includes(
              searchText
            ) ||
            category.includes(
              searchText
            ) ||
            type.includes(
              searchText
            );


          const matchesType =
            filterType === "All" ||
            type ===
              filterType.toLowerCase();


          return (
            matchesSearch &&
            matchesType
          );

        }
      );

    }, [
      transactions,
      search,
      filterType,
    ]);


  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate =
    (dateString) => {

      if (!dateString) {
        return "—";
      }


      const date =
        new Date(dateString);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "—";

      }


      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    };


  /* =====================================================
     AMOUNT FORMAT
  ===================================================== */

  const formatAmount =
    (transaction) => {

      const amount =
        Number(
          transaction.amount
        ) || 0;


      const formatted =
        amount.toLocaleString(
          "en-IN"
        );


      if (
        transaction.type ===
        "Income"
      ) {

        return `+₹${formatted}`;

      }


      return `-₹${formatted}`;

    };


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <div
      className="
        min-h-screen
        bg-[#F8F5EF]
        flex
        overflow-x-hidden
      "
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div
        className="
          w-0
          lg:w-[280px]
          flex-shrink-0
        "
      >
        <Sidebar />
      </div>


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div
        className="
          flex-1
          min-w-0
          w-full
        "
      >

        {/* =================================================
            TOPBAR
        ================================================= */}

        <Topbar />


        {/* =================================================
            CONTENT
        ================================================= */}

        <main
          className="
            p-4
            sm:p-6
            md:p-8
            w-full
            max-w-full
          "
        >

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mb-8
            "
          >

            <div>

              <h1
                className="
                  text-4xl
                  font-bold
                  tracking-tight
                  text-[#101C2E]
                "
              >
                Transactions
              </h1>


              <p
                className="
                  mt-1
                  text-sm
                  text-[#6F665B]
                "
              >
                View and manage all your financial activity.
              </p>

            </div>


            <div
              className="
                w-12
                h-12
                rounded-xl
                flex
                items-center
                justify-center
                bg-[#56061D]
                text-[#F3EBDD]
                shadow-md
              "
            >

              <FaExchangeAlt
                className="text-lg"
              />

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="
                mb-6
                rounded-xl
                border
                border-[#56061D]/20
                bg-[#56061D]/10
                px-4
                py-3
                text-sm
                text-[#56061D]
              "
            >
              {error}
            </div>

          )}


          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div
            className="
              bg-white
              border
              border-[#E5DDD2]
              rounded-[1.5rem]
              p-5
              mb-6
              shadow-[0_10px_30px_rgba(16,28,46,0.06)]
            "
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                gap-4
              "
            >

              {/* SEARCH */}

              <div
                className="
                  flex-1
                  flex
                  items-center
                  border
                  rounded-xl
                  px-4
                  py-3
                  bg-[#F8F5EF]
                  border-[#E5DDD2]
                  focus-within:border-[#92643E]
                  transition
                "
              >

                <FaSearch
                  className="
                    mr-3
                    text-[#8B8175]
                  "
                />


                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search transactions..."
                  className="
                    bg-transparent
                    outline-none
                    w-full
                    text-[#101C2E]
                    placeholder:text-[#A99F91]
                  "
                />

              </div>


              {/* FILTER */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  md:w-auto
                "
              >

                <FaFilter
                  className="
                    text-[#8B8175]
                    shrink-0
                  "
                />


                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value
                    )
                  }
                  className="
                    border
                    border-[#E5DDD2]
                    bg-[#F8F5EF]
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    text-sm
                    text-[#101C2E]
                    cursor-pointer
                    w-full
                    md:w-auto
                  "
                >

                  <option value="All">
                    All
                  </option>

                  <option value="Income">
                    Income
                  </option>

                  <option value="Expense">
                    Expense
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* =================================================
              TRANSACTIONS CARD
          ================================================= */}

          <div
            className="
              bg-white
              rounded-[1.5rem]
              border
              border-[#E5DDD2]
              overflow-hidden
              shadow-[0_10px_30px_rgba(16,28,46,0.06)]
              w-full
            "
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                px-6
                py-5
                border-b
                border-[#E5DDD2]
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                  text-[#101C2E]
                "
              >
                All Transactions
              </h2>


              <p
                className="
                  text-sm
                  mt-1
                  text-[#6F665B]
                "
              >
                {loading
                  ? "Loading transactions..."
                  : `${filteredTransactions.length} transaction${
                      filteredTransactions.length !== 1
                        ? "s"
                        : ""
                    }`}
              </p>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div
                className="
                  py-20
                  text-center
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    mx-auto
                    border-4
                    border-[#E5DDD2]
                    border-t-[#56061D]
                    rounded-full
                    animate-spin
                  "
                />


                <p
                  className="
                    mt-4
                    text-sm
                    text-[#8B8175]
                  "
                >
                  Loading transactions...
                </p>

              </div>

            ) : filteredTransactions.length === 0 ? (

              /* =================================================
                 EMPTY STATE
              ================================================= */

              <div
                className="
                  py-20
                  px-6
                  text-center
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    mx-auto
                    flex
                    items-center
                    justify-center
                    bg-[#F3EBDD]
                    border
                    border-[#E5DDD2]
                    text-[#56061D]
                  "
                >

                  <FaExchangeAlt
                    className="text-2xl"
                  />

                </div>


                <h3
                  className="
                    mt-4
                    font-semibold
                    text-[#101C2E]
                  "
                >
                  {search
                    ? "No Matching Transactions"
                    : "No Transactions Found"}
                </h3>


                <p
                  className="
                    text-sm
                    mt-1
                    text-[#8B8175]
                  "
                >
                  {search
                    ? "Try a different search term."
                    : "Your income and expenses will appear here."}
                </p>

              </div>

            ) : (

              /* =================================================
                 TABLE
              ================================================= */

              <div
                className="
                  overflow-x-auto
                  w-full
                "
              >

                <table
                  className="
                    w-full
                    min-w-[700px]
                  "
                >

                  <thead>

                    <tr
                      className="
                        border-b
                        border-[#E5DDD2]
                        bg-[#F8F5EF]
                      "
                    >

                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Transaction
                      </th>


                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Category
                      </th>


                      <th
                        className="
                          text-left
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Date
                      </th>


                      <th
                        className="
                          text-right
                          px-6
                          py-4
                          text-sm
                          font-semibold
                          text-[#6F665B]
                        "
                      >
                        Amount
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredTransactions.map(
                      (transaction) => {

                        const isIncome =
                          transaction.type ===
                          "Income";


                        return (

                          <tr
                            key={
                              transaction.id
                            }
                            className="
                              border-b
                              last:border-0
                              border-[#EEE7DD]
                              hover:bg-[#FCFAF7]
                              transition
                            "
                          >

                            {/* TRANSACTION */}

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-3
                                "
                              >

                                <div
                                  className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                  "
                                  style={{
                                    backgroundColor:
                                      isIncome
                                        ? "#F3EBDD"
                                        : "#F1E5E8",

                                    color:
                                      isIncome
                                        ? "#92643E"
                                        : "#56061D",
                                  }}
                                >

                                  {isIncome ? (

                                    <FaArrowUp />

                                  ) : (

                                    <FaArrowDown />

                                  )}

                                </div>


                                <div
                                  className="
                                    min-w-0
                                  "
                                >

                                  <p
                                    className="
                                      font-semibold
                                      text-[#101C2E]
                                      truncate
                                      max-w-[280px]
                                    "
                                  >
                                    {transaction.title}
                                  </p>


                                  <p
                                    className="
                                      text-xs
                                      mt-0.5
                                      text-[#8B8175]
                                    "
                                  >
                                    {transaction.type}
                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* CATEGORY */}

                            <td
                              className="
                                px-6
                                py-4
                              "
                            >

                              <span
                                className="
                                  inline-flex
                                  px-3
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-medium
                                  bg-[#F8F5EF]
                                  border
                                  border-[#E5DDD2]
                                  text-[#6F665B]
                                "
                              >
                                {transaction.category}
                              </span>

                            </td>


                            {/* DATE */}

                            <td
                              className="
                                px-6
                                py-4
                                text-sm
                                text-[#6F665B]
                                whitespace-nowrap
                              "
                            >
                              {formatDate(
                                transaction.date
                              )}
                            </td>


                            {/* AMOUNT */}

                            <td
                              className="
                                px-6
                                py-4
                                text-right
                                font-semibold
                                whitespace-nowrap
                              "
                              style={{
                                color:
                                  isIncome
                                    ? "#92643E"
                                    : "#56061D",
                              }}
                            >
                              {formatAmount(
                                transaction
                              )}
                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>

  );
}


export default Transactions;