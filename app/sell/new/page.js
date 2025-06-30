'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import RegularProductForm from '../../../components/forms/RegularProductForm';
import NotesForm from '../../../components/forms/NotesForm';
import RoomsForm from '../../../components/forms/RoomsForm';

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic';

function SellForm() {
    // Safely get search params with build-time error handling
    let searchParams;
    let formType = '';
    let category = '';
    
    try {
        searchParams = useSearchParams();
        formType = searchParams?.get('type') || '';
        category = searchParams?.get('category') || '';
    } catch (error) {
        // This handles the case when useSearchParams is called during build
        // console.log('useSearchParams not available during build');
        searchParams = null;
    }

    const renderForm = () => {
        switch (formType) {
            case 'regular':
                return <RegularProductForm category={category} />;
            case 'notes':
                return <NotesForm category={category} />;
            case 'rooms':
                return <RoomsForm category={category} />;
            default:
                return <p>Invalid category type. Please go back and select a category.</p>;
        }
    };

    return (
        <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    {renderForm()}
                </div>
            </main>
    );
}

// Loading fallback component
function SellFormLoading() {
    return (
        <main className="flex-grow container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        </main>
    );
}

// Wrap with Suspense because useSearchParams requires it.
export default function NewSellPage() {
    return (
        <Suspense fallback={<SellFormLoading />}>
            <SellForm />
        </Suspense>
    );
}
