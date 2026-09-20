import React, { useState } from 'react';

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('newLeads');

  const renderContent = () => {
    switch (activeTab) {
      case 'newLeads':
        return <div>Content for New Leads</div>;
      case 'myJobs':
        return <div>Content for My Jobs</div>;
      case 'history':
        return <div>Content for History</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Your Jobs</h1>

        <div className="mb-4 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('newLeads')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                  activeTab === 'newLeads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                New Leads
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab('myJobs')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                  activeTab === 'myJobs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                My Jobs
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('history')}
                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                History
              </button>
            </li>
          </ul>
        </div>

        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
