        // console.error('API Error:', result);
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ImageUploadWithOptimization from '../ImageUploadWithOptimization';
import FileUpload from '../FileUpload';
import { colleges } from '../../lib/colleges';
import toast from 'react-hot-toast';
// Placeholder data
const academicYears = ['8th', '9th', '10th', '11th', '12th', 'Undergraduate', 'Postgraduate', 'PhD'];
const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Data Structures'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Others'];
export default function NotesForm({ initialData = {}, onSubmit, category = 'Notes' }) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        college: initialData.college || '',
        academic_year: initialData.academic_year || '',
        subject: initialData.subject || '',
        price: initialData.price || '',
        description: initialData.description || '',
        images: initialData.images || [],
        pdfs: [], // Restore pdfs field for original PDF upload
        category: category || initialData.category || 'Notes',
    });
    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    setIsAuthenticated(false);
                    setAuthLoading(false);
                    return;
                }
                // Only check for email presence in auth
                if (session?.user?.email) {
                    setIsAuthenticated(true);
                    // Pre-fill user data if available
                    try {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('name, college')
                            .eq('email', session.user.email)
                            .single();
                        if (userData) {
                            setFormData(prev => ({
                                ...prev,
                                college: prev.college || userData.college || ''
                            }));
                        }
                    } catch (profileError) {
                    }
                } else {
                    setIsAuthenticated(false);
                }
                setAuthLoading(false);
            } catch (authError) {
                setIsAuthenticated(false);
                setAuthLoading(false);
            }
        };
        checkAuth();
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user?.email) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase.auth]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleImagesChange = (files) => {
        setFormData(prev => ({ ...prev, images: files }));
    };
    const handlePdfsChange = (files) => {
        setFormData(prev => ({ ...prev, pdfs: files }));
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        // ============================================================================
        // 1. ENHANCED EMAIL-BASED AUTHENTICATION CHECK
        // ============================================================================
        if (!isAuthenticated) {
            toast.error('Please log in to submit your notes');
            router.push('/login');
            return;
        }
        // Get current session and verify email
        let currentUser = null;
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                toast.error('Authentication error. Please try logging in again.');
                return;
            }
            if (!session?.user?.email) {
                toast.error('Invalid authentication. Please log in with a valid email.');
                router.push('/login');
                return;
            }
            // Fetch current user data to include phone number
            let userProfile = null;
            try {
                const { data: profile } = await supabase
                    .from('users')
                    .select('phone')
                    .eq('id', session.user.id)
                    .single();
                userProfile = profile;
            } catch (err) {
            }
            currentUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url,
                college: formData.college,
                phone: userProfile?.phone || null // Include phone to preserve it in API upsert
            };
        } catch (sessionError) {
            toast.error('Failed to verify authentication. Please try again.');
            return;
        }
        // ============================================================================
        // 2. FORM VALIDATION
        // ============================================================================
        if (!formData.title || !formData.price || !formData.college || !formData.subject) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            toast.error('Please enter a valid price');
            return;
        }
        setIsSubmitting(true);
        const toastId = toast.loading('Uploading your notes...');
        try {
            // ============================================================================
            // 3. PREPARE SUBMISSION DATA
            // ============================================================================
            // ============================================================================
            // 4. SUBMIT TO API
            // ============================================================================
            // Create FormData to handle File uploads
            const formDataToSend = new FormData();
            // Add basic data
            formDataToSend.append('type', 'notes');
            formDataToSend.append('user', JSON.stringify(currentUser));
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', parseFloat(formData.price));
            formDataToSend.append('college', formData.college);
            formDataToSend.append('course', formData.course || 'General');
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('academicYear', formData.academic_year);
            // Add images as File objects
            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((image, index) => {
                    formDataToSend.append(`images`, image);
                });
            }
            // Add PDF files
            if (formData.pdfs && formData.pdfs.length > 0) {
                formData.pdfs.forEach((pdf, index) => {
                    formDataToSend.append(`pdfs`, pdf);
                });
            }
            const response = await fetch('/api/sell', {
                method: 'POST',
                body: formDataToSend, // Send FormData instead of JSON
            });
            const result = await response.json();
            if (!response.ok) {
                let errorMsg = 'Failed to submit notes.';
                if (result.error) errorMsg += `\nError: ${result.error}`;
                if (result.code) errorMsg += `\nCode: ${result.code}`;
                if (result.details) errorMsg += `\nDetails: ${result.details}`;
                if (result.stack) errorMsg += `\nStack: ${result.stack}`;
                toast.error(errorMsg, { duration: 8000 });
                // Optionally log to console for debugging
                console.error('API Error:', result);
                return;
            }
            // ============================================================================
            // 5. SUCCESS HANDLING
            // ============================================================================
            // Show success message
            toast.success(
                `📚 ${result.message || 'Notes submitted successfully!'}\nYour ${result.data?.title || 'notes'} are now live!`,
                {
                    duration: 4000,
                    style: {
                        background: '#10b981',
                        color: '#ffffff',
                        fontWeight: '500',
                    },
                }
            );
            // Reset form
            setFormData({
                title: '',
                college: formData.college, // Keep college for next submission
                academic_year: '',
                subject: '',
                price: '',
                description: '',
                images: [],
                pdfs: [],
                category: category || 'Notes',
            });
            // Redirect to homepage after showing success message
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (fetchError) {
            toast.error('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
            toast.dismiss(toastId);
        }
    };
    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="space-y-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-600 dark:text-gray-400">Checking authentication...</div>
                </div>
            </div>
        );
    }
    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please log in to list your notes.</p>
                </div>
                <div className="text-center py-8">
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Log In to Continue
                    </button>
                </div>
            </div>
        );
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">List Notes</h2>
                <p className="text-gray-600 dark:text-gray-400">Share your knowledge with fellow students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title of Notes</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        required 
                        value={formData.title} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Enter descriptive title"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
                    <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        required 
                        value={formData.price} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="0"
                    />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300">College</label>
                    <select 
                        name="college" 
                        id="college" 
                        required 
                        value={formData.college} 
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>Select College</option>
                        {colleges.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.short} value={c.short}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                    <select 
                        name="academic_year" 
                        id="academic_year" 
                        required 
                        value={formData.academic_year} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Year</option>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course / Subject</label>
                    <select 
                        name="subject" 
                        id="subject" 
                        required 
                        value={formData.subject} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Preview Images (up to 5)</label>
                <ImageUploadWithOptimization 
                    onImagesOptimized={handleImagesChange} 
                    maxImages={5}
                    maxSizeInMB={10}
                    showPreview={true}
                    allowMultiple={true}
                    optimizationOptions={{
                        maxWidth: 1200,
                        maxHeight: 800,
                        quality: 0.8
                    }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload PDF Files (up to 10)</label>
                <FileUpload onFilesChange={handlePdfsChange} maxFiles={10} accept=".pdf" fileType="PDF" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                    id="description" 
                    name="description" 
                    rows={4} 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Describe your notes in detail..."
                />
            </div>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Uploading...' : 'Upload Notes'}
            </button>
        </form>
    );
}

