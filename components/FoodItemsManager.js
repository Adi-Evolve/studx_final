'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import AIMenuCreator from './AIMenuCreator';

export default function FoodItemsManager({ mess, onUpdate }) {
  const [foods, setFoods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    category: 'breakfast',
    price: '',
    description: '',
    is_available: true,
    image_url: ''
  });
  const [activeCategory, setActiveCategory] = useState('all');
  
  const supabase = createSupabaseBrowserClient();

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '☀️' },
    { id: 'dinner', name: 'Dinner', icon: '🌙' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'beverages', name: 'Beverages', icon: '☕' }
  ];

  useEffect(() => {
    if (mess?.available_foods) {
      setFoods(mess.available_foods);
    }
  }, [mess]);

  const filteredFoods = activeCategory === 'all' 
    ? foods 
    : foods.filter(food => food.category === activeCategory);

  const resetForm = () => {
    setFoodFormData({
      name: '',
      category: 'breakfast',
      price: '',
      description: '',
      is_available: true,
      image_url: ''
    });
    setEditingFood(null);
    setShowAddForm(false);
  };

  const handleEditFood = (food) => {
    setFoodFormData({
      name: food.name || '',
      category: food.category || 'breakfast',
      price: food.price || '',
      description: food.description || '',
      is_available: food.is_available ?? true,
      image_url: food.image_url || ''
    });
    setEditingFood(food);
    setShowAddForm(true);
  };

  const handleSubmitFood = async (e) => {
    e.preventDefault();
    
    try {
      let updatedFoods;
      
      if (editingFood) {
        // Update existing food
        updatedFoods = foods.map(food => 
          food.id === editingFood.id 
            ? { ...food, ...foodFormData }
            : food
        );
      } else {
        // Add new food
        const newFood = {
          id: Date.now().toString(),
          ...foodFormData,
          created_at: new Date().toISOString()
        };
        updatedFoods = [...foods, newFood];
      }

      // Update in database
      const { data, error } = await supabase
        .from('mess')
        .update({ available_foods: updatedFoods })
        .eq('id', mess.id)
        .select()
        .single();

      if (error) {
        alert('Error saving food item: ' + error.message);
        return;
      }

      setFoods(updatedFoods);
      onUpdate(data);
      resetForm();
      alert(editingFood ? 'Food item updated!' : 'Food item added!');
      
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Error saving food item');
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      const updatedFoods = foods.filter(food => food.id !== foodId);

      const { data, error } = await supabase
        .from('mess')
        .update({ available_foods: updatedFoods })
        .eq('id', mess.id)
        .select()
        .single();

      if (error) {
        alert('Error deleting food item: ' + error.message);
        return;
      }

      setFoods(updatedFoods);
      onUpdate(data);
      alert('Food item deleted!');
      
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Error deleting food item');
    }
  };

  const handleDeleteAllFoods = async () => {
    if (!confirm('Are you sure you want to delete ALL menu items? This action cannot be undone.')) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mess')
        .update({ available_foods: [] })
        .eq('id', mess.id)
        .select()
        .single();

      if (error) {
        alert('Error deleting all menu items: ' + error.message);
        return;
      }

      setFoods([]);
      onUpdate(data);
      alert('All menu items deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting all foods:', error);
      alert('Failed to delete all menu items');
    }
  };

  const toggleFoodAvailability = async (foodId) => {
    try {
      const updatedFoods = foods.map(food => 
        food.id === foodId 
          ? { ...food, is_available: !food.is_available }
          : food
      );

      const { data, error } = await supabase
        .from('mess')
        .update({ available_foods: updatedFoods })
        .eq('id', mess.id)
        .select()
        .single();

      if (error) {
        alert('Error updating availability: ' + error.message);
        return;
      }

      setFoods(updatedFoods);
      onUpdate(data);
      
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Error updating availability');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* AI Menu Creator */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <AIMenuCreator 
          mess={mess} 
          onMenuGenerated={(updatedFoods) => {
            setFoods(updatedFoods);
            onUpdate({ ...mess, available_foods: updatedFoods });
          }} 
        />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-700 dark:to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            📤 Upload your menu
          </h2>
          <div className="flex gap-3">
            {foods.length > 0 && (
              <button
                onClick={handleDeleteAllFoods}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                title="Delete all menu items"
              >
                <span>🗑️</span>
                Delete All
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
            >
              <span>+</span>
              Add Food Item Manually
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Upload your menu using AI or add items manually. Keep your menu updated for better student experience.
        </p>
      </div>

      {/* Category Filter */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="p-6">
        {filteredFoods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Food Items
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeCategory === 'all' 
                ? 'Start by adding your first food item to the menu'
                : `No items found in the ${categories.find(c => c.id === activeCategory)?.name} category`
              }
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add Food Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map(food => (
              <div
                key={food.id}
                className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 transition-all ${
                  food.is_available 
                    ? 'border-green-200 dark:border-green-700' 
                    : 'border-red-200 dark:border-red-700 opacity-75'
                }`}
              >
                {food.image_url && (
                  <img
                    src={food.image_url}
                    alt={food.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {food.name}
                  </h3>
                  <span className="text-sm px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    {categories.find(c => c.id === food.category)?.icon} {food.category}
                  </span>
                </div>

                {food.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {food.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ₹{food.price}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      food.is_available 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {food.is_available ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditFood(food)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleFoodAvailability(food.id)}
                    className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      food.is_available
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {food.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Food Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitFood} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={foodFormData.name}
                    onChange={(e) => setFoodFormData({...foodFormData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter food name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={foodFormData.category}
                    onChange={(e) => setFoodFormData({...foodFormData, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={foodFormData.price}
                    onChange={(e) => setFoodFormData({...foodFormData, price: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={foodFormData.description}
                    onChange={(e) => setFoodFormData({...foodFormData, description: e.target.value})}
                    rows="3"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the food item..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={foodFormData.image_url}
                    onChange={(e) => setFoodFormData({...foodFormData, image_url: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter image URL (optional)"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={foodFormData.is_available}
                    onChange={(e) => setFoodFormData({...foodFormData, is_available: e.target.checked})}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_available" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Available for ordering
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {editingFood ? 'Update' : 'Add'} Food Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}