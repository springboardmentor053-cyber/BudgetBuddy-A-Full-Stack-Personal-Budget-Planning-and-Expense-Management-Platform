type Props = {
  downloadReport: () => void;
};

function ExportReport({ downloadReport }: Props) {

  return (

    <button
      onClick={downloadReport}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl"
    >
      Download CSV Report
    </button>

  );
}

export default ExportReport;