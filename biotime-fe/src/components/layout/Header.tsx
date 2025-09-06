import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            className="text-gray-500 focus:outline-none lg:hidden"
            onClick={onMenuClick}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          
          <div className="flex items-center ml-4">
            <i className="fas fa-clock text-primary text-2xl mr-3"></i>
            <h1 className="text-xl font-bold text-gray-800">AttendancePro</h1>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search..."
              className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
            <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-bell text-lg"></i>
            </button>
            
            <div className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;