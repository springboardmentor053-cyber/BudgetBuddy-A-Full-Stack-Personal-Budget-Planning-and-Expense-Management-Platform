function RecentTransactions({ transactions = [] }) {
  return (
    <div
      className="
        rounded-[1.5rem]
        p-6
        h-full
        shadow-[0_10px_30px_rgba(16,28,46,0.08)]
        border
      "
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E5DDD2",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2
            className="
              text-2xl
              font-semibold
              tracking-tight
            "
            style={{
              color: "#101C2E",
            }}
          >
            Recent Transactions
          </h2>

          <p
            className="text-sm mt-1"
            style={{
              color: "#6F665B",
            }}
          >
            Your latest financial activity
          </p>

        </div>


        <button
          className="
            font-medium
            text-sm
            transition-all
            duration-200
            hover:opacity-70
          "
          style={{
            color: "#92643E",
          }}
        >
          View All
        </button>

      </div>


      {/* =================================================
          NO TRANSACTIONS
      ================================================= */}

      {transactions.length === 0 ? (

        <div
          className="
            min-h-[260px]
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <div
            className="
              w-16
              h-16
              rounded-2xl
              flex
              items-center
              justify-center
              mb-4
              border
            "
            style={{
              backgroundColor: "#F3EBDD",
              borderColor: "#E5DDD2",
            }}
          >

            <span className="text-2xl">
              💳
            </span>

          </div>


          <h3
            className="font-semibold"
            style={{
              color: "#101C2E",
            }}
          >
            No Transactions Yet
          </h3>


          <p
            className="
              text-sm
              mt-1
              max-w-xs
            "
            style={{
              color: "#8B8175",
            }}
          >
            Your latest income and expense transactions
            will appear here.
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead>

              <tr
                className="border-b"
                style={{
                  borderColor: "#E5DDD2",
                }}
              >

                <th
                  className="
                    text-left
                    pb-3
                    text-sm
                    font-medium
                  "
                  style={{
                    color: "#6F665B",
                  }}
                >
                  Transaction
                </th>


                <th
                  className="
                    text-left
                    pb-3
                    text-sm
                    font-medium
                  "
                  style={{
                    color: "#6F665B",
                  }}
                >
                  Category
                </th>


                <th
                  className="
                    text-right
                    pb-3
                    text-sm
                    font-medium
                  "
                  style={{
                    color: "#6F665B",
                  }}
                >
                  Amount
                </th>

              </tr>

            </thead>


            {/* =================================================
                TRANSACTIONS
            ================================================= */}

            <tbody>

              {transactions.map(
                (transaction, index) => (

                  <tr
                    key={
                      transaction.id ||
                      index
                    }
                    className="
                      border-b
                      last:border-0
                      transition-all
                      duration-200
                      hover:bg-[#F8F5EF]
                    "
                    style={{
                      borderColor: "#EEE7DC",
                    }}
                  >

                    {/* =================================================
                        TRANSACTION
                    ================================================= */}

                    <td className="py-4">

                      <div className="flex items-center gap-3">

                        {/* Icon */}

                        <div
                          className="
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            shrink-0
                            border
                          "
                          style={{
                            backgroundColor:
                              "rgba(86,6,29,0.06)",
                            borderColor:
                              "rgba(86,6,29,0.15)",
                          }}
                        >

                          <span className="text-lg">
                            💸
                          </span>

                        </div>


                        {/* Title */}

                        <div className="min-w-0">

                          <p
                            className="
                              font-medium
                              truncate
                              max-w-[180px]
                            "
                            style={{
                              color: "#101C2E",
                            }}
                          >
                            {transaction.title}
                          </p>


                          <p
                            className="
                              text-xs
                              mt-0.5
                            "
                            style={{
                              color: "#8B8175",
                            }}
                          >
                            Expense
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* =================================================
                        CATEGORY
                    ================================================= */}

                    <td className="py-4">

                      <span
                        className="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          border
                        "
                        style={{
                          backgroundColor:
                            "rgba(146,100,62,0.08)",
                          color: "#7A4D2C",
                          borderColor:
                            "rgba(146,100,62,0.20)",
                        }}
                      >
                        {transaction.category || "Other"}
                      </span>

                    </td>


                    {/* =================================================
                        AMOUNT
                    ================================================= */}

                    <td className="py-4 text-right">

                      <span
                        className="
                          font-semibold
                          whitespace-nowrap
                        "
                        style={{
                          color: "#56061D",
                        }}
                      >
                        -₹
                        {Number(
                          transaction.amount
                        ).toLocaleString("en-IN")}
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default RecentTransactions;