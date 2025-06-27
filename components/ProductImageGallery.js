'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductImageGallery({ images, title }) {
    if (!images || images.length === 0) {
        // Fallback for when there are no images
        return (
            <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-[500px] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                         <Image src="/placeholder.png" alt="No image available" fill style={{ objectFit: 'cover' }} />
                    </div>
                </div>
            </div>
        );
    }

    const [currentImage, setCurrentImage] = useState(images[0]);

    return (
        <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 mb-4">
                <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-[500px] rounded-lg overflow-hidden">
                    <Image
                        src={currentImage}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-opacity duration-300"
                        key={currentImage} // Add key to force re-render on change
                    />
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`relative h-16 sm:h-20 md:h-24 rounded-md overflow-hidden cursor-pointer border-2 ${currentImage === img ? 'border-accent' : 'border-transparent'}`}
                            onClick={() => setCurrentImage(img)}
                        >
                            <Image
                                src={img}
                                alt={`${title} thumbnail ${index + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
