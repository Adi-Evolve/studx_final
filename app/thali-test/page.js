'use client';
import ThaliRecognitionComponent from '../../components/ThaliRecognitionComponent'

export default function ThaliTestPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    StudX AI Thali Recognition System
                </h1>
                <ThaliRecognitionComponent 
                    messId={1} // Replace with actual mess ID
                    userId="test-user" // Replace with actual user ID
                    onSaveComplete={(result) => {
                        console.log('Thali saved:', result);
                    }}
                />
            </div>
        </div>
    )
}