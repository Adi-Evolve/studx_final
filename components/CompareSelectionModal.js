'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import SimilarItemsFeed from './SimilarItemsFeed';

export default function CompareSelectionModal({ currentItem, onItemSelected, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-primary">Select an Item to Compare</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                </div>

                <div className="p-8">
                    <SimilarItemsFeed 
                        category={currentItem.category} 
                        currentItemId={currentItem.id} 
                        type='regular' 
                        onItemClick={onItemSelected} 
                        isSelectMode={true}
                    />
                </div>
            </div>
        </div>
    );
}
