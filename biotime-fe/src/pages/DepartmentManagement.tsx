import React, { useState, useEffect } from 'react';
import { useDepartmentStore } from '../stores/department.store';
import DepartmentList from '../components/department/DepartmentList';
import DepartmentDetail from '../components/department/DepartmentDetail';
import DepartmentAnalytics from '../components/department/DepartmentAnalytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const DepartmentManagement: React.FC = () => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const {
    departments,
    currentDepartment,
    departmentStats,
    departmentEmployees,
    departmentTrend,
    departmentPerformance,
    dashboardReporting,
    loading,
    error,
    getAllDepartments,
    getDepartmentById,
    getDepartmentStats,
    getEmployeesByDepartment,
    getDepartmentTrend,
    getDashboardReporting,
    clearError
  } = useDepartmentStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        getAllDepartments(),
        getDashboardReporting()
      ]);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const handleDepartmentSelect = async (departmentId: number) => {
    try {
      setSelectedDepartmentId(departmentId);
      await Promise.all([
        getDepartmentById(departmentId),
        getDepartmentStats(departmentId, dateRange.startDate, dateRange.endDate),
        getEmployeesByDepartment(departmentId),
        getDepartmentTrend(departmentId)
      ]);
      setView('detail');
    } catch (err) {
      console.error('Error loading department details:', err);
    }
  };

  const handleViewAnalytics = () => {
    setView('analytics');
  };

  const handleBackToList = () => {
    setSelectedDepartmentId(null);
    setView('list');
    // clearCurrentDepartment();
  };


  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    if (selectedDepartmentId) {
      getDepartmentStats(selectedDepartmentId, startDate, endDate);
    }
  };

  const filteredDepartments = () => {
    if (!searchQuery) return departments;
    
    return departments.filter(dept => 
      dept.dept_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.dept_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.manager_first_name && dept.manager_first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dept.manager_last_name && dept.manager_last_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
      </div>

      {/* Dashboard Overview (only show in list view) */}
      {view === 'list' && dashboardReporting && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Departments</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {dashboardReporting.summary.totalDepartments}
                </h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-building text-primary text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Active Departments</p>
                <h2 className="text-3xl font-bold text-success">
                  {dashboardReporting.summary.activeDepartments}
                </h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-success text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Employees</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {dashboardReporting.summary.totalEmployees}
                </h2>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Active Employees</p>
                <h2 className="text-3xl font-bold text-success">
                  {dashboardReporting.summary.activeEmployees}
                </h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-user-check text-success text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search (only show in list view) */}
      {view === 'list' && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Departments</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, code, or manager..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {view !== 'list' && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={handleBackToList}
            className="hover:text-primary transition-colors"
          >
            Departments
          </button>
          <span>/</span>
          <span className="text-gray-800 capitalize">
            {view === 'detail' && 'Department Details'}
            {view === 'analytics' && 'Analytics'}
           
          </span>
        </nav>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow">
        {view === 'list' && (
          <DepartmentList
            departments={filteredDepartments()}
            onSelectDepartment={handleDepartmentSelect}
          />
        )}
        
        {view === 'detail' && currentDepartment && (
          <DepartmentDetail
            department={currentDepartment}
            stats={departmentStats}
            employees={departmentEmployees}
            onViewAnalytics={handleViewAnalytics}
            onBack={handleBackToList}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        )}
        
        {view === 'analytics' && currentDepartment && (
          <DepartmentAnalytics
            department={currentDepartment}
            trend={departmentTrend}
            performance={departmentPerformance}
            onBack={() => setView('detail')}
          />
        )}
      
      </div>
    </div>
  );
};

export default DepartmentManagement;