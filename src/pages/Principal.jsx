import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Entreprises from './components/Entreprises/Entreprises';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'entreprises':
        return <Entreprises />;
      case 'employes':
        return <div className="p-6"><h1 className="text-2xl font-bold">Employés</h1></div>;
      case 'salaires':
        return <div className="p-6"><h1 className="text-2xl font-bold">Salaires</h1></div>;
      case 'parametres':
        return <div className="p-6"><h1 className="text-2xl font-bold">Paramètres</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;