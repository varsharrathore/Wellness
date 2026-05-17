'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface SettingsForm {
  announcementMessage: string;
  siteName: string;
  contactEmail: string;
  contactPhone: string;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, setValue } = useForm<SettingsForm>();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      const settings = response.data;
      
      setValue('announcementMessage', settings.announcementMessage || '🔥 Sale is Live - Get Up to 50% Off!');
      setValue('siteName', settings.siteName || 'Wellness Store');
      setValue('contactEmail', settings.contactEmail || 'support@wellnessstore.com');
      setValue('contactPhone', settings.contactPhone || '+1 (555) 123-4567');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      await adminAPI.updateSettings(data);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Announcement Bar Message
            </label>
            <input
              {...register('announcementMessage')}
              type="text"
              className="input-field"
              placeholder="Enter announcement message"
            />
            <p className="text-sm text-gray-500 mt-1">
              This message will appear at the top of the website
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              {...register('siteName')}
              type="text"
              className="input-field"
              placeholder="Enter site name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              {...register('contactEmail')}
              type="email"
              className="input-field"
              placeholder="Enter contact email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              {...register('contactPhone')}
              type="tel"
              className="input-field"
              placeholder="Enter contact phone"
            />
          </div>

          <button type="submit" className="btn-primary">
            Save Settings
          </button>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">Announcement Examples</h4>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => setValue('announcementMessage', '🔥 Sale is Live - Get Up to 50% Off!')}
                className="block w-full text-left p-2 hover:bg-gray-50 rounded"
              >
                🔥 Sale is Live - Get Up to 50% Off!
              </button>
              <button
                onClick={() => setValue('announcementMessage', '💥 Today\'s Best Deals - Limited Time Only!')}
                className="block w-full text-left p-2 hover:bg-gray-50 rounded"
              >
                💥 Today's Best Deals - Limited Time Only!
              </button>
              <button
                onClick={() => setValue('announcementMessage', '🚚 Free Shipping on Orders Over $50!')}
                className="block w-full text-left p-2 hover:bg-gray-50 rounded"
              >
                🚚 Free Shipping on Orders Over $50!
              </button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-2">Site Statistics</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              <p>Settings version: 1.0</p>
              <p>Cache status: Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}