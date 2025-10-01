import React from 'react';

export default function DashboardNew() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900 text-white flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-purple-800">
          <span className="text-2xl font-bold">Catalog</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-3 py-2 rounded bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            All Campaigns
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            Ads
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Security
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/></svg>
            Platforms
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12l9-5-9-5-9 5 9 5z"/></svg>
            Notifications
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            Chat
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
            Cards
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Reports
          </a>
        </nav>
        <div className="px-4 py-6 border-t border-purple-800 space-y-2">
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            Settings
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Help Center
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded hover:bg-purple-700">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21V9a3 3 0 0 1 6 0v12"/></svg>
            Logout
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full" />
            <span className="font-semibold text-gray-700">Floyd Miles</span>
          </div>
          <div className="flex items-center space-x-4">
            <input type="text" placeholder="Search" className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600" />
            <button className="p-2 rounded hover:bg-gray-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button className="p-2 rounded hover:bg-gray-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
            </button>
            <button className="p-2 rounded hover:bg-gray-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M1.38 12h11.48"/></svg>
            </button>
          </div>
        </div>

      {/* Content grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Campaign overview */}
        <section className="col-span-12 md:col-span-4 bg-purple-700 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Campaign overview</h3>
          <div className="text-4xl font-bold mb-2">65</div>
          <div className="mb-4">Active Campaign</div>
          <div className="flex space-x-3 mb-4">
            <button className="bg-white text-purple-700 rounded-full px-3 py-1 text-sm font-semibold">Google</button>
            <button className="bg-white text-purple-700 rounded-full px-3 py-1 text-sm font-semibold">Facebook</button>
            <button className="bg-white text-purple-700 rounded-full px-3 py-1 text-sm font-semibold">YouTube</button>
          </div>
          <div className="text-sm mb-2">56 Pending</div>
          <div className="text-sm mb-2">45 Cancel</div>
          <div className="text-sm mb-2">75% Success rate</div>
          <input type="text" placeholder="Search Campaign" className="w-full rounded px-3 py-2 text-purple-700" />
        </section>

        {/* Mail Statistic */}
        <section className="col-span-12 md:col-span-4 bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Mail Statistic</h3>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24">
              <svg viewBox="0 0 36 36" className="circular-chart orange">
                <path className="circle-bg" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray="24, 100" d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage">24%</text>
              </svg>
            </div>
            <div>
              <div>Sent</div>
              <div className="text-sm text-gray-500">128 Mails</div>
              <div>Pending</div>
              <div className="text-sm text-gray-500">24 Mails</div>
              <div>Cancel</div>
              <div className="text-sm text-gray-500">30 Mails</div>
            </div>
          </div>
        </section>

        {/* Traffic Effectives */}
        <section className="col-span-12 md:col-span-4 bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Traffic Effectives</h3>
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-600 flex items-center justify-center">
                <span className="text-purple-600 font-semibold">70%</span>
              </div>
              <div className="text-sm mt-2">Paid</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex items-center justify-center">
                <span className="text-orange-400 font-semibold">24%</span>
              </div>
              <div className="text-sm mt-2">Direct</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-gray-400 flex items-center justify-center">
                <span className="text-gray-400 font-semibold">12%</span>
              </div>
              <div className="text-sm mt-2">Organic</div>
            </div>
          </div>
        </section>

        {/* Engagement Analytics */}
        <section className="col-span-12 bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Engagement Analytics</h3>
          <div className="flex space-x-4">
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold">Add</button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold">Facebook</button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold">Instagram</button>
            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold">YouTube</button>
            <select className="ml-auto border border-gray-300 rounded px-2 py-1">
              <option>Social media</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="mt-4 grid grid-cols-12 gap-4">
            <div className="col-span-2 bg-purple-600 rounded h-24"></div>
            <div className="col-span-2 bg-purple-500 rounded h-24"></div>
            <div className="col-span-2 bg-purple-400 rounded h-24"></div>
            <div className="col-span-2 bg-purple-300 rounded h-24"></div>
            <div className="col-span-2 bg-purple-200 rounded h-24"></div>
            <div className="col-span-2 bg-purple-100 rounded h-24"></div>
          </div>
        </section>

        {/* Schedule */}
        <section className="col-span-12 bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Schedule</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">No</th>
                <th className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Type</th>
                <th className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Status</th>
                <th className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Date &amp; time</th>
                <th className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">01</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">Social Ads</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">Active</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">01.12.23</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">...</td>
              </tr>
              <tr>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">02</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">Email</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">Pending</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">01.12.23</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">...</td>
              </tr>
              <tr>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">03</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">Social Ads</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">Active</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">01.12.23</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">...</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  </div>
  );
}
