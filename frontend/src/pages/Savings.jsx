import React from 'react';
import MainLayout from '../layouts/MainLayout'; // 🌟 Import your layout wrapper

const Savings = () => {
  return (
    <MainLayout pageTitle="Savings Goals">
      <p className="text-gray-600">Track and manage your financial savings targets here.</p>
      
      <div className="mt-6 p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl block mb-2">💲</span>
          Savings analytics and goals modules will be fully integrated in Milestone 2.
        </div>
      </div>
    </MainLayout>
  );
};

export default Savings;