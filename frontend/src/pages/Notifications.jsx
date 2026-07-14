import React from 'react';
import MainLayout from '../layouts/MainLayout'; // 🌟 Import your layout wrapper

const Notifications = () => {
  return (
    <MainLayout pageTitle="Notifications">
      <p className="text-gray-600">View automated alerts and budget status updates.</p>
      
      <div className="mt-4 space-y-2">
        <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
          System alerts will be there in milestone 2
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;