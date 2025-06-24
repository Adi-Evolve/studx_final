'use client';

export default function BuyNowButton({ pdfUrl }) {
    const handleBuyNow = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        } else {
            alert('No PDF available for download.');
        }
    };

    return (
        <button onClick={handleBuyNow} className="bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-primary transition duration-300">
            Buy Now & Download PDF
        </button>
    );
}
