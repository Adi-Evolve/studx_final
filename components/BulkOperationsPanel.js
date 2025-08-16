'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faTrash, 
    faEdit, 
    faEye, 
    faEyeSlash, 
    faClone, 
    faDownload, 
    faSpinner,
    faCheckSquare,
    faSquare,
    faFilter
} from '@fortawesome/free-solid-svg-icons';

export default function BulkOperationsPanel({ 
    userListings = [], 
    onListingsUpdate,
    listingType = 'all' // 'products', 'notes', 'rooms', 'all'
}) {
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isOperating, setIsOperating] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'sold', 'hidden'
    const [filteredListings, setFilteredListings] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingOperation, setPendingOperation] = useState(null);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        filterListings();
    }, [userListings, filterStatus, listingType]);

    const filterListings = () => {
        let filtered = userListings;

        // Filter by listing type
        if (listingType !== 'all') {
            filtered = filtered.filter(item => {
                if (listingType === 'products') return item.type === 'product' || !item.type;
                if (listingType === 'notes') return item.type === 'note';
                if (listingType === 'rooms') return item.type === 'room';
                return true;
            });
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(item => {
                if (filterStatus === 'active') return item.status === 'active' || !item.status;
                if (filterStatus === 'sold') return item.status === 'sold';
                if (filterStatus === 'hidden') return item.status === 'hidden';
                return true;
            });
        }

        setFilteredListings(filtered);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredListings.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredListings.map(item => item.id)));
        }
    };

    const handleSelectItem = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const confirmOperation = (operation) => {
        setPendingOperation(operation);
        setShowConfirmModal(true);
    };

    const executeOperation = async () => {
        if (!pendingOperation || selectedItems.size === 0) return;

        setIsOperating(true);
        try {
            const itemIds = Array.from(selectedItems);
            
            switch (pendingOperation.type) {
                case 'delete':
                    await bulkDelete(itemIds);
                    break;
                case 'hide':
                    await bulkUpdateStatus(itemIds, 'hidden');
                    break;
                case 'activate':
                    await bulkUpdateStatus(itemIds, 'active');
                    break;
                case 'markSold':
                    await bulkUpdateStatus(itemIds, 'sold');
                    break;
                case 'duplicate':
                    await bulkDuplicate(itemIds);
                    break;
                case 'export':
                    await exportListings(itemIds);
                    break;
                default:
                    throw new Error('Unknown operation');
            }

            setSelectedItems(new Set());
            if (onListingsUpdate) {
                onListingsUpdate();
            }
        } catch (error) {
            // console.error('Bulk operation failed:', error);
            alert(`Operation failed: ${error.message}`);
        } finally {
            setIsOperating(false);
            setShowConfirmModal(false);
            setPendingOperation(null);
        }
    };

    const bulkDelete = async (itemIds) => {
        // Delete from all possible tables
        const tables = ['products', 'notes', 'rooms'];
        
        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .in('id', itemIds);
            
            if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
                throw error;
            }
        }
    };

    const bulkUpdateStatus = async (itemIds, status) => {
        const tables = ['products', 'notes', 'rooms'];
        
        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .update({ status, updated_at: new Date().toISOString() })
                .in('id', itemIds);
            
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
        }
    };

    const bulkDuplicate = async (itemIds) => {
        for (const itemId of itemIds) {
            const originalItem = filteredListings.find(item => item.id === itemId);
            if (!originalItem) continue;

            const table = originalItem.type === 'note' ? 'notes' : 
                         originalItem.type === 'room' ? 'rooms' : 'products';

            // Create copy without id and with modified title
            const itemCopy = { ...originalItem };
            delete itemCopy.id;
            delete itemCopy.created_at;
            delete itemCopy.updated_at;
            
            itemCopy.title = `${originalItem.title} (Copy)`;
            itemCopy.status = 'active';

            const { error } = await supabase
                .from(table)
                .insert(itemCopy);

            if (error) throw error;
        }
    };

    const exportListings = async (itemIds) => {
        const selectedListings = filteredListings.filter(item => itemIds.includes(item.id));
        
        const csvContent = generateCSV(selectedListings);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `listings_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateCSV = (listings) => {
        const headers = ['Title', 'Type', 'Category', 'Price', 'Status', 'College', 'Created Date'];
        const rows = listings.map(item => [
            item.title || '',
            item.type || 'product',
            item.category || '',
            item.price || '',
            item.status || 'active',
            item.college || '',
            new Date(item.created_at).toLocaleDateString()
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    };

    const getOperationLabel = (type) => {
        const labels = {
            delete: 'Delete Selected',
            hide: 'Hide Selected',
            activate: 'Activate Selected',
            markSold: 'Mark as Sold',
            duplicate: 'Duplicate Selected',
            export: 'Export Selected'
        };
        return labels[type] || type;
    };

    if (filteredListings.length === 0) {
        return (
            <div className="card p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    No listings found for bulk operations.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with filters and select all */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Bulk Operations
                        </h3>
                        
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFilter} className="w-4 h-4 text-gray-500" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-base text-sm py-1 px-2"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="sold">Sold</option>
                                <option value="hidden">Hidden</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedItems.size} of {filteredListings.length} selected
                        </span>
                        <button
                            onClick={handleSelectAll}
                            className="btn-secondary btn-sm"
                        >
                            <FontAwesomeIcon 
                                icon={selectedItems.size === filteredListings.length ? faSquare : faCheckSquare} 
                                className="mr-1" 
                            />
                            {selectedItems.size === filteredListings.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Operation buttons */}
            {selectedItems.size > 0 && (
                <div className="card p-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => confirmOperation({ type: 'activate', label: 'Activate Selected' })}
                            disabled={isOperating}
                            className="btn-primary btn-sm"
                        >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Activate
                        </button>
                        
                        <button
                            onClick={() => confirmOperation({ type: 'hide', label: 'Hide Selected' })}
                            disabled={isOperating}
                            className="btn-secondary btn-sm"
                        >
                            <FontAwesomeIcon icon={faEyeSlash} className="mr-1" />
                            Hide
                        </button>
                        
                        <button
                            onClick={() => confirmOperation({ type: 'markSold', label: 'Mark as Sold' })}
                            disabled={isOperating}
                            className="btn-secondary btn-sm"
                        >
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Mark Sold
                        </button>
                        
                        <button
                            onClick={() => confirmOperation({ type: 'duplicate', label: 'Duplicate Selected' })}
                            disabled={isOperating}
                            className="btn-secondary btn-sm"
                        >
                            <FontAwesomeIcon icon={faClone} className="mr-1" />
                            Duplicate
                        </button>
                        
                        <button
                            onClick={() => confirmOperation({ type: 'export', label: 'Export Selected' })}
                            disabled={isOperating}
                            className="btn-secondary btn-sm"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-1" />
                            Export
                        </button>
                        
                        <button
                            onClick={() => confirmOperation({ type: 'delete', label: 'Delete Selected' })}
                            disabled={isOperating}
                            className="btn-danger btn-sm"
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Listings table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size === filteredListings.length && filteredListings.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredListings.map((item) => (
                                <tr key={item.id} className={selectedItems.has(item.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => handleSelectItem(item.id)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            {item.images?.[0] && (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                    className="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {item.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            {item.type || 'product'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        ₹{item.price || 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            item.status === 'sold' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            item.status === 'hidden' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        }`}>
                                            {item.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && pendingOperation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Confirm Operation
                        </h3>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Are you sure you want to {getOperationLabel(pendingOperation.type).toLowerCase()} {selectedItems.size} item(s)?
                            {pendingOperation.type === 'delete' && (
                                <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                                    This action cannot be undone.
                                </span>
                            )}
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isOperating}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeOperation}
                                disabled={isOperating}
                                className={`flex-1 ${pendingOperation.type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                            >
                                {isOperating ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
