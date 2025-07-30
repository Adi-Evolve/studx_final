'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faBook, faChalkboardTeacher, faCalendarAlt, faUser, faInfoCircle, faHeart, faFilePdf, faTag } from '@fortawesome/free-solid-svg-icons';

import SellerInfoModal from '@/components/SellerInfoModal';
import SimilarItemsFeed from '@/components/SimilarItemsFeed';
import ProductImageGallery from '@/components/ProductImageGallery';
import { fetchSellerListings } from '@/app/actions';

export default function NotePageClient({ note, seller }) {
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [otherListings, setOtherListings] = useState([]);

    const getWhatsAppNumber = (phone) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `91${cleaned}`;
        }
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            return cleaned;
        }
        return phone; // fallback
    };

    const handleDownload = async (pdfUrl, fileName) => {
        if (!pdfUrl) {
            alert('No PDF file available for download');
            return;
        }
        try {
            let downloadUrl = pdfUrl;
            if (typeof pdfUrl === 'string' && pdfUrl.startsWith('https://drive.google.com/')) {
                downloadUrl = pdfUrl;
            } else if (typeof pdfUrl === 'string' && !pdfUrl.startsWith('http')) {
                const { createSupabaseBrowserClient } = await import('@/lib/supabase/client');
                const supabase = createSupabaseBrowserClient();
                const { data, error } = await supabase.storage
                    .from('product_pdfs')
                    .createSignedUrl(pdfUrl, 60 * 60);
                if (error) {
                    alert('Failed to generate download link');
                    return;
                }
                downloadUrl = data.signedUrl;
            }
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${fileName || 'StudXchange_Notes'}.pdf`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        }
    };

    const handleShowSellerInfo = async () => {
        if (!seller) {
            return;
        }
        try {
            const listings = await fetchSellerListings({
                sellerId: seller.id,
                excludeId: note.id,
                excludeType: 'note'
            });
            setOtherListings(listings);
            setIsSellerModalOpen(true);
        } catch (error) {
            alert('Could not load seller information.');
        }
    };

    const formattedDate = new Date(note.createdat).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const whatsAppNumber = getWhatsAppNumber(seller?.phone);

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Link href="/" className="text-accent hover:text-primary mb-6 inline-flex items-center transition-colors">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
                        <ProductImageGallery images={note.images} title={note.title} />
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h1 className="text-3xl font-bold text-primary mb-2 leading-tight">{note.title}</h1>
                            <p className="text-3xl font-bold text-accent mb-4">₹{note.price ? note.price.toLocaleString() : 'Free'}</p>
                            
                            <div className="space-y-3 text-sm text-gray-600 border-t pt-4 mb-4">
                                <div className="flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-3 text-gray-400" /> Posted on {formattedDate}</div>
                                {seller && <div className="flex items-center"><FontAwesomeIcon icon={faUser} className="w-4 mr-3 text-gray-400" /> Sold by <span className="font-semibold text-primary ml-1">{seller.name}</span></div>}
                                <div className="flex items-center"><FontAwesomeIcon icon={faTag} className="w-4 mr-3 text-gray-400" /> Category: <span className="font-semibold text-primary ml-1">{note.category?.name || 'N/A'}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faBook} className="w-4 mr-3 text-gray-400" /> Subject: <span className="font-semibold text-primary ml-1">{note.subject || 'N/A'}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faChalkboardTeacher} className="w-4 mr-3 text-gray-400" /> Course: <span className="font-semibold text-primary ml-1">{note.course || 'N/A'}</span></div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mt-6">
                                {note.pdf_urls && Array.isArray(note.pdf_urls) && note.pdf_urls.length > 0 ? (
                                    note.pdf_urls.map((pdfUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleDownload(pdfUrl, `${note.title}_${index + 1}`)}
                                            className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon icon={faFilePdf} className="mr-3" size="lg" />
                                            Download PDF {note.pdf_urls.length > 1 ? `(${index + 1}/${note.pdf_urls.length})` : ''}
                                        </button>
                                    ))
                                ) : note.pdfurl ? (
                                    <button
                                        onClick={() => handleDownload(note.pdfurl, note.title)}
                                        className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                    >
                                        <FontAwesomeIcon icon={faFilePdf} className="mr-3" size="lg" />
                                        Download PDF
                                    </button>
                                ) : (
                                    <div className="w-full bg-gray-300 text-gray-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center cursor-not-allowed">
                                        <FontAwesomeIcon icon={faFilePdf} className="mr-3" size="lg" />
                                        No PDF Available
                                    </div>
                                )}
                                {whatsAppNumber && (
                                    <a href={`https://wa.me/${whatsAppNumber}?text=Hello!%20I%20found%20your%20study%20notes%20for%20'${encodeURIComponent(note.title)}'%20on%20StudXchange%20and%20I'm%20really%20interested%20in%20purchasing%20them.%20%0A%0ACould%20you%20please%20let%20me%20know:%20%0A-%20Quality%20and%20completeness%20of%20the%20notes%20%0A-%20Which%20topics/chapters%20are%20covered%20%0A-%20Format%20of%20the%20notes%20(handwritten/typed)%20%0A-%20Any%20additional%20study%20materials%20included%20%0A-%20Best%20time%20for%20pickup/delivery%20%0A%0AProduct%20Link:%20${encodeURIComponent(window.location.href)}%20%0A%0AThese%20notes%20would%20be%20really%20helpful%20for%20my%20studies.%20Thank%20you!`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                        Contact Seller
                                    </a>
                                )}
                                <button onClick={handleShowSellerInfo} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-3" />
                                    Seller Info
                                </button>
                                <button className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faHeart} className="mr-3" />
                                    Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                    <h2 className="text-2xl font-bold text-primary mb-4">Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.description}</p>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-primary mb-6 text-center">Similar Notes</h2>
                    <SimilarItemsFeed categoryId={note.category_id} currentItemId={note.id} type="note" />
                </div>
            </div>
            {isSellerModalOpen && <SellerInfoModal seller={seller} soldProducts={otherListings} onClose={() => setIsSellerModalOpen(false)} />}
        </div>
    );
}
