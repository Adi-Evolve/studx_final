'use client';

import { useRouter } from 'next/navigation';
import RegularProductForm from '../../../components/forms/RegularProductForm';
import NotesForm from '../../../components/forms/NotesForm';
import RoomsForm from '../../../components/forms/RoomsForm';

export default function EditForm({ item, type }) {
    const router = useRouter();

    const handleSubmit = async (formData) => {
        // The form components create a FormData object, but for updates (without file changes yet)
        // we need a plain JSON object. We'll extract the fields.
        const data = {};
        for (let [key, value] of formData.entries()) {
            // We don't want to update file inputs for now
            if (!(value instanceof File)) {
                data[key] = value;
            }
        }
        // Remove fields that should not be updated directly
        delete data.images;
        delete data.pdf;
        delete data.type;

        const response = await fetch('/api/item/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, type, data }),
        });

        if (response.ok) {
            alert('Item updated successfully!');
            router.push('/profile');
            router.refresh(); // To see the changes on the profile page
        } else {
            alert('Failed to update item.');
        }
    };

    const renderForm = () => {
        switch (type) {
            case 'product':
                return <RegularProductForm initialData={item} onSubmit={handleSubmit} />;
            case 'note':
                return <NotesForm initialData={item} onSubmit={handleSubmit} />;
            case 'room':
                return <RoomsForm initialData={item} onSubmit={handleSubmit} />;
            default:
                return <p>Invalid item type.</p>;
        }
    };

    return <div>{renderForm()}</div>;
}
