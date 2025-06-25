'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import RegularProductForm from '../../../components/forms/RegularProductForm';
import NotesForm from '../../../components/forms/NotesForm';
import RoomsForm from '../../../components/forms/RoomsForm';

function SellForm() {
    const searchParams = useSearchParams();
    const formType = searchParams.get('type');
    const category = searchParams.get('category');

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

// Wrap with Suspense because useSearchParams requires it.
export default function NewSellPage() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <SellForm />
        </Suspense>
    );
}
