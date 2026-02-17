import React from 'react';
import Image from 'next/image';

const ComparisonRow = ({ label, valueA, valueB }) => (
    <tr className="border-b last:border-b-0">
        <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">{label}</td>
        <td className="py-3 px-4 text-gray-600">{valueA}</td>
        <td className="py-3 px-4 text-gray-600">{valueB}</td>
    </tr>
);

export default function ComparisonTable({ productA, productB }) {
    const getImageUrl = (product) => {
        return (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
            || (Array.isArray(product.image_urls) && product.image_urls.length > 0 && product.image_urls[0])
            || `https://i.pravatar.cc/300?u=${product.id}`;
    };

    return (
        <div className="w-full mt-6">
            <div className="min-w-full bg-white rounded-lg shadow-md overflow-hidden border">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-primary text-white">
                            <th className="py-4 px-4 text-left font-bold">Feature</th>
                            <th className="py-4 px-4 text-left font-bold">{productA.title || productA.name || 'Product 1'}</th>
                            <th className="py-4 px-4 text-left font-bold">{productB.title || productB.name || 'Product 2'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-semibold text-gray-700 bg-gray-50">Image</td>
                            <td className="p-2">
                                <Image src={getImageUrl(productA)} alt={productA.title || productA.name} width={100} height={100} className="rounded-md object-cover mx-auto" />
                            </td>
                            <td className="p-2">
                                <Image src={getImageUrl(productB)} alt={productB.title || productB.name} width={100} height={100} className="rounded-md object-cover mx-auto" />
                            </td>
                        </tr>
                        <ComparisonRow label="Price" valueA={`₹${productA.price || productA.fees}`} valueB={`₹${productB.price || productB.fees}`} />
                        <ComparisonRow label="Category" valueA={productA.category} valueB={productB.category} />
                        <ComparisonRow label="Description" valueA={productA.description} valueB={productB.description} />
                    </tbody>
                </table>
            </div>
        </div>
    );
}
