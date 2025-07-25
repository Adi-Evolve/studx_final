// Test each component import individually

// Test 1: Only FeaturedSlider
import FeaturedSlider from '@/components/FeaturedSlider';

export default function TestFeaturedSlider() {
    const testData = [
        {
            id: 1,
            title: "Test Item",
            price: 100,
            type: "regular",
            images: ["https://picsum.photos/200/300"],
            college: "Test College",
            created_at: "2023-01-01T00:00:00Z"
        }
    ];
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Testing FeaturedSlider</h1>
            <FeaturedSlider listings={testData} />
        </div>
    );
}
