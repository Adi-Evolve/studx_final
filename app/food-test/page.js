import FoodRecognitionDemo from '../../components/FoodRecognitionDemo'

export default function FoodTestPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    StudX AI Food Recognition Test
                </h1>
                <FoodRecognitionDemo />
            </div>
        </div>
    )
}