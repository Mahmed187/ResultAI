interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gpName: string;
}

interface PatientInfoProps {
  patient: Patient;
}

export default function PatientInfo({ patient }: PatientInfoProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Patient Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">NHS Number</h3>
          <p className="mt-1 text-lg text-gray-900">{patient.id}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
          <p className="mt-1 text-lg text-gray-900">{patient.name}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
          <p className="mt-1 text-lg text-gray-900">
            {new Date(patient.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">GP</h3>
          <p className="mt-1 text-lg text-gray-900">{patient.gpName}</p>
        </div>
      </div>
    </div>
  );
} 