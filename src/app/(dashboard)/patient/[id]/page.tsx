'use client';

import { useState, useEffect, useMemo, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import html2pdf from 'html2pdf.js';
import 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { Download, FileText, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from '@tanstack/react-query';
 

interface Patient {
  nhsNumber: ReactNode;
  id: string;
  name: string;
  dateOfBirth: string;
  gpName: string;
  address?: string;
  letters?: Letter[];
  reports?: Report[];
}

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
  content: any;
  id: string;
  letter: string;
  createdAt: string;
  patientId: string;
  testResults?: TestResult[];
}

// ✅ Fetcher function
const fetchPatient = async (id: string): Promise<Patient> => {
  const res = await fetch(`/api/patient/${id}`);
  if (!res.ok) throw new Error('Failed to fetch patient data');
  return res.json();
};

export default function PatientDetailsPage() {
  const params = useParams();
  // const [patient, setPatient] = useState<Patient | null>(null);
  // const [reports, setReports] = useState<Report[]>([]);
  // const [letters, setLetters] = useState<Letter[]>([]); 
  // const [error, setError] = useState<string | null>(null);

    const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: () => fetchPatient(params.id as string),
    enabled: !!params.id, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // 5 min
  });
 
//@ts-ignore
  const testResults = useMemo(() => patient?.testResults ?? [], [patient]);
  //@ts-ignore
  const letter = useMemo(() => patient?.letter ?? [], [patient]);


  // const downloadPDF = (letter: Letter) => {
  //   if (!patient) return;
    
  //   const doc = new jsPDF();
    
  //   // Set font styles
  //   doc.setFont("helvetica", "normal");
    
  //   // Add letterhead
  //   doc.setFontSize(16);
  //   doc.text("Sunnydale Medical Center", 14, 20);
  //   doc.setFontSize(12);
  //   doc.text("123 Health Street, Sunnydale,", 14, 30);
  //   doc.text("Sunnydale, AB1 2CD, United Kingdom", 14, 35);
  //   doc.text("Phone: (01234) 567890", 14, 40);
  //   doc.text("Email: contact@sunnydalemedical.com", 14, 45);
    
  //   // Add date
  //   doc.text(new Date(letter.createdAt).toLocaleDateString(), 14, 60);
    
  //   // Add patient details
  //   doc.setFontSize(12);
  //   doc.text(`Re: ${patient.name}`, 14, 70);
  //   doc.text(`NHS Number: ${patient.id}`, 14, 75);
  //   doc.text(`Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}`, 14, 80);
  //   doc.text(`GP: ${patient.gpName}`, 14, 85);
    
  //   // Add letter content
  //   doc.setFontSize(11);
  //   const splitText = doc.splitTextToSize(letter.letter, 180);
  //   doc.text(splitText, 14, 95);
    
  //   // Add signature
  //   const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 95 + (splitText.length * 7);
  //   doc.text("Yours sincerely,", 14, lastY + 20);
  //   doc.text(`Dr. ${patient.gpName}`, 14, lastY + 30);
  //   doc.text("General Practitioner", 14, lastY + 35);
    
  //   // Save the PDF
  //   doc.save(`medical-letter-${patient.id}.pdf`);
  // };

  
  const downloadPDF = (letter: Letter) => {
  if (!letter) return;

  const container = document.createElement('div');
  container.innerHTML = letter.content;
  container.className = 'p-4 text-sm max-w-[800px] text-xs'; // Optional styling for page

  // Append off-screen for accurate rendering
  document.body.appendChild(container);

  html2pdf()
    .set({
      margin: 0.5,
      filename: `medical-letter-${letter.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    })
    .from(container)
    .save()
    .finally(() => document.body.removeChild(container)); // Cleanup
};


  // const downloadWord = (letter: Letter) => {
  //   if (!patient) return;
    
  //   // Create HTML content
  //   const content = `
  //     <html>
  //       <head>
  //         <meta charset="UTF-8">
  //         <title>Medical Letter</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; line-height: 1.6; }
  //           .header { margin-bottom: 20px; }
  //           .date { color: #666; }
  //           .content { white-space: pre-wrap; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="header">
  //           <h1>Medical Letter</h1>
  //           <p class="date">Date: ${new Date(letter.createdAt).toLocaleDateString()}</p>
  //         </div>
  //         <div class="content">${letter.letter}</div>
  //       </body>
  //     </html>
  //   `;

  //   // Create blob and download
  //   const blob = new Blob([content], { type: 'application/msword' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `medical-letter-${letter.id}.doc`;
  //   document.body.appendChild(a);
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  //   document.body.removeChild(a);
  // };

  const downloadWord = (letter: Letter) => {
  if (!patient) return;

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <title>Medical Letter</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: 14px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: left;
          }
          thead {
            background-color: #f2f2f2;
          }
          ul {
            margin-left: 20px;
          }
        </style>
      </head>
      <body>
        ${letter.content}
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical-letter-${letter.id}.doc`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};


  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error instanceof Error ? error.message : String(error)}</div>;
  if (!patient) return <div className="p-4">Patient not found</div>;
 
  return (
    <div className="p-4">
      <div className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">NHS Number</h3>
                <p className="mt-1 text-lg">{patient.nhsNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p className="mt-1 text-lg">{patient.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                <p className="mt-1 text-lg">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">GP</h3>
                <p className="mt-1 text-lg">{patient.gpName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results and Letters */}
        <Tabs defaultValue="test-results">
          <TabsList>
            <TabsTrigger value="test-results">Test</TabsTrigger>
            <TabsTrigger value="letters">Letters</TabsTrigger>
          </TabsList>

          <TabsContent value="test-results" className="space-y-4">
  {testResults?.length === 0 ? (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">No test results available for this patient.</p>
      </CardContent>
    </Card>
  ) : (
    testResults?.map((test: { id: Key | null | undefined; testName: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; analyzedAt: string | number | Date; status: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> | null | undefined; value: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; unit: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; referenceRange: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; meaning: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }) => (
      <Card key={test.id}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {test.testName} – {new Date(test.analyzedAt).toLocaleDateString()}
            </CardTitle>
            <div
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                test.status === "NORMAL"
                  ? "bg-green-100 text-green-700"
                  : test.status === "HIGH"
                  ? "bg-yellow-100 text-yellow-700"
                  : test.status === "LOW"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {test.status}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Result</th>
                <th className="text-left py-3 px-4">Reference Range</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">
                  {test.value} {test.unit}
                </td>
                <td className="py-3 px-4">{test.referenceRange}</td>
              </tr>
            </tbody>
          </table>

          {test.meaning && (
            <div className="text-sm text-muted-foreground">
              <strong>Interpretation:</strong> {test.meaning}
            </div>
          )}
        </CardContent>
      </Card>
    ))
  )}
</TabsContent>


          <TabsContent value="letters" className="space-y-4">
            {!letter  ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No letters available for this patient.</p>
                </CardContent>
              </Card>
            ) : (
              
                <Card key={letter.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        Letter from {new Date(letter.createdAt).toLocaleDateString()}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => downloadPDF(letter)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Download as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadWord(letter)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download as Word
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap"   dangerouslySetInnerHTML={{ __html: letter.content }}>
                         
                      </div>
                    </div>
                  </CardContent>
                </Card>
            
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}