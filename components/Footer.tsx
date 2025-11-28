
import React from 'react';
import { GitBranchIcon, MenuIcon } from './icons/Icons';


const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0d1117] border-t border-gray-700/50 flex items-center justify-between px-4 py-1 text-xs text-gray-400 shrink-0">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 hover:text-white">
            <MenuIcon className="w-4 h-4" />
            <span>Current Line</span>
        </button>
        <div className="w-px h-4 bg-gray-700"></div>
        <span>0ol20</span>
        <div className="w-px h-4 bg-gray-700"></div>
        <span>39,00 FIL</span>
        <div className="w-px h-4 bg-gray-700"></div>
        <span>Soll Oomts 76</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 hover:text-white">
            <GitBranchIcon className="w-4 h-4"/>
            <span>git branch</span>
        </button>
        <div className="flex items-center gap-1">
            <span className="w-3 h-3 block bg-gray-600 rounded-sm"></span>
            <span className="w-3 h-3 block bg-gray-600 rounded-sm"></span>
            <span className="w-3 h-3 block bg-gray-600 rounded-sm"></span>
            <span className="w-3 h-3 block bg-gray-600 rounded-sm"></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
