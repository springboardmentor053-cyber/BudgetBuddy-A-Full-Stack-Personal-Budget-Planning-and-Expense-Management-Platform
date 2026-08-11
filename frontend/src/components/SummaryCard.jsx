function SummaryCard({ title, amount, icon, type }) {
  return (
    <div className={`summary-card ${type}`}>
      <div className="summary-card-top">
        <div>
          <p className="summary-title">{title}</p>
          <h3>{amount}</h3>
        </div>

        <div className="summary-icon">{icon}</div>
      </div>
    </div>
  );
}

export default SummaryCard;