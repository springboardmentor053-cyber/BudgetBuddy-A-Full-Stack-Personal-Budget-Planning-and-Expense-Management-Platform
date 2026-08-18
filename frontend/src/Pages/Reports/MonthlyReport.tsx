type Props = {
  monthly: any;
};

function MonthlyReport({ monthly }: Props) {

  if (!monthly)
    return <p>No Monthly Report Available</p>;

  return (
    <div className="space-y-2">

      <p>
        <b>Month :</b> {monthly.month}
      </p>

      <p>
        <b>Year :</b> {monthly.year}
      </p>

      <p>
        <b>Income :</b> ₹{monthly.total_income}
      </p>

      <p>
        <b>Expense :</b> ₹{monthly.total_expense}
      </p>

      <p>
        <b>Balance :</b> ₹{monthly.current_balance}
      </p>

    </div>
  );
}

export default MonthlyReport;