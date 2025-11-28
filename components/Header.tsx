import React from 'react';
import { MenuIcon, SearchIcon, BellIcon, UserGroupIcon } from './icons/Icons';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-[#0d1117] border-b border-gray-700/50 flex items-center justify-between px-4 py-2 text-sm shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-200">
          <button onClick={onToggleSidebar} className="md:hidden">
            <MenuIcon className="h-6 w-6 text-gray-400" />
          </button>
          <span className="font-semibold text-base hidden sm:inline">Code Design Template</span>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="bg-[#21262d] border border-gray-700 rounded-md w-full pl-9 pr-4 py-1.5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white">
          <UserGroupIcon className="h-5 w-5" />
        </button>
        <button className="relative text-gray-400 hover:text-white">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#0d1117]"></span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <img src="https://picsum.photos/id/1/24/24" alt="User 1" className="rounded-full" />
          <img src="https://picsum.photos/id/2/24/24" alt="User 2" className="rounded-full" />
        </div>
         <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ericksonde</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
