import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface TestResult {
  id: string;
  testName: string;
  resultValue: string;
  referenceRange: string;
}

interface Report {
  id: string;
  sampleId: string;
  sampleCollected: string;
  reportGenerated: string;
  testResults: TestResult[];
  comments: string;
}

interface Letter {
  id: string;
  letter: string;
  createdAt: string;
  fileUrl: string;
}

interface PathologyResultsProps {
  patientId: string;
}

export default function PathologyResults({ patientId }: PathologyResultsProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/patient/${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setReports(data.reports);
        setLetters(data.letters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const downloadPDF = (report: Report, letter?: Letter) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Pathology Report', 14, 20);
    
    // Add report details
    doc.setFontSize(12);
    doc.text(`Sample ID: ${report.sampleId}`, 14, 30);
    doc.text(`Date: ${new Date(report.reportGenerated).toLocaleDateString()}`, 14, 40);
    
    // Add test results table
    const tableData = report.testResults.map(test => [
      test.testName,
      test.resultValue,
      test.referenceRange
    ]);
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Test Name', 'Result', 'Reference Range']],
      body: tableData,
    });
    
    // Add letter if available
    if (letter) {
      const letterY = (doc as any).lastAutoTable.finalY + 20;
      doc.text('Doctor\'s Letter:', 14, letterY);
      doc.setFontSize(10);
      const splitLetter = doc.splitTextToSize(letter.letter, 180);
      doc.text(splitLetter, 14, letterY + 10);
    }
    
    // Save the PDF
    doc.save(`pathology-report-${report.sampleId}.pdf`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <div key={report.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Report from {new Date(report.reportGenerated).toLocaleDateString()}
            </h3>
            <button
              onClick={() => downloadPDF(report, letters.find(l => l.createdAt === report.reportGenerated))}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Download PDF
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Range
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.testResults.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.testName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.resultValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {test.referenceRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {report.comments && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Comments:</strong> {report.comments}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 