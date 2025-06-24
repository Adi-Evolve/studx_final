'use client';

import { useState } from 'react';
import { getSellerInfo } from '@/app/actions';
import SellerInfoModal from './modals/SellerInfoModal';
import CompareModal from './modals/CompareModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faInfoCircle, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

export default function ProductActions({ product }) {
    const [isSellerModalOpen, setSellerModalOpen] = useState(false);
    const [isCompareModalOpen, setCompareModalOpen] = useState(false);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [soldProducts, setSoldProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSellerInfoClick = async () => {
        setIsLoading(true);
        setSellerModalOpen(true);
        try {
            const { seller, soldProducts } = await getSellerInfo(product.seller_id);
            setSellerInfo(seller);
            setSoldProducts(soldProducts);
        } catch (error) {
            console.error('Failed to fetch seller info:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompareClick = () => {
        setCompareModalOpen(true);
    };

    if (!product) {
        return null; 
    }
    
    const contactLink = product.phone ? `https://wa.me/${product.phone}` : '#';

    return (
        <>
            <div className="flex space-x-4 mb-8">
                <a
                    href={contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 ${product.phone ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                    onClick={(e) => !product.phone && e.preventDefault()}
                >
                    <FontAwesomeIcon icon={faPhone} />
                    <span>Contact Seller</span>
                </a>
                <button
                    onClick={handleSellerInfoClick}
                    disabled={isLoading}
                    className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition duration-300 flex items-center justify-center space-x-2"
                >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>{isLoading ? 'Loading...' : 'Seller Info'}</span>
                </button>
                <button
                    onClick={handleCompareClick}
                    className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300 flex items-center justify-center space-x-2"
                >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    <span>Compare</span>
                </button>
            </div>

            {isSellerModalOpen && (
                <SellerInfoModal
                    isOpen={isSellerModalOpen}
                    onClose={() => setSellerModalOpen(false)}
                    seller={sellerInfo}
                    soldProducts={soldProducts}
                    isLoading={isLoading}
                />
            )}

            {isCompareModalOpen && (
                <CompareModal
                    productA={product}
                    onClose={() => setCompareModalOpen(false)}
                />
            )}
        </>
    );
}