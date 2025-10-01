import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-96px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
