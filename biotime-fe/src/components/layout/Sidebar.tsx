import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPath }) => {
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-chart-pie' },
    { name: 'Attendance', path: '/attendance', icon: 'fas fa-list' },
    // { name: 'Analytics', path: '/analytics', icon: 'fas fa-chart-line' },
    { name: 'Reports', path: '/reports', icon: 'fas fa-file-alt' },
    { name: 'Employees', path: '/employees', icon: 'fas fa-users' },
    { name: 'Departments', path: '/departments', icon: 'fas fa-building' },
    // { name: 'Settings', path: '/settings', icon: 'fas fa-cog' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition duration-300 ease-in-out lg:static lg:inset-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-6 bg-primary text-white">
          <i className="fas fa-clock text-2xl mr-2"></i>
          <span className="text-xl font-bold">AttendancePro</span>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    currentPath === item.path
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-6 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;