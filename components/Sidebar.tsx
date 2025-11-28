
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, FileIcon, SearchIcon, MenuIcon } from './icons/Icons';

interface FileNode {
  type: 'file';
  name: string;
}

interface FolderNode {
  type: 'folder';
  name: string;
  children: FileSystemTree;
}

export type FileSystemTree = Record<string, FileNode | FolderNode>;

interface FileTreeProps {
    tree: FileSystemTree;
    onFileSelect: (path: string) => void;
    activeFile: string | null;
    level?: number;
    pathPrefix?: string;
}

const FileTree: React.FC<FileTreeProps> = ({ tree, onFileSelect, activeFile, level = 0, pathPrefix = '' }) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Auto-expand folders on initial load
        const initialOpenState: Record<string, boolean> = {};
        Object.keys(tree).forEach(key => {
            if (tree[key].type === 'folder') {
                initialOpenState[key] = true;
            }
        });
        setOpenFolders(initialOpenState);
    }, []);


  const toggleFolder = (name: string) => {
    setOpenFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const sortedKeys = Object.keys(tree).sort((a, b) => {
    const nodeA = tree[a];
    const nodeB = tree[b];
    if (nodeA.type === 'folder' && nodeB.type === 'file') return -1;
    if (nodeA.type === 'file' && nodeB.type === 'folder') return 1;
    return a.localeCompare(b);
  });

  return (
    <div>
      {sortedKeys.map((key) => {
        const item = tree[key];
        const isFolder = item.type === 'folder';
        const currentPath = pathPrefix ? `${pathPrefix}/${item.name}` : item.name;

        return (
          <div key={currentPath}>
            <div
              className={`flex items-center py-1 cursor-pointer hover:bg-gray-800/60 rounded text-sm
                ${activeFile === currentPath ? 'bg-blue-600/50 text-white' : ''}`}
              style={{ paddingLeft: `${level * 1.25}rem` }}
              onClick={() => (isFolder ? toggleFolder(item.name) : onFileSelect(currentPath))}
            >
              <div className="w-5 mr-1 flex-shrink-0">
                {isFolder ? (openFolders[item.name] ? <ChevronDownIcon /> : <ChevronRightIcon />) : <div className="w-5"></div>}
              </div>
              <div className="mr-2 text-purple-400 flex-shrink-0">
                {isFolder ? <FolderIcon /> : <FileIcon />}
              </div>
              <span className="truncate">{item.name}</span>
            </div>
            {isFolder && openFolders[item.name] && (
              <FileTree 
                tree={(item as FolderNode).children} 
                level={level + 1}
                onFileSelect={onFileSelect}
                activeFile={activeFile}
                pathPrefix={currentPath}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};


const Sidebar: React.FC<{ fileSystem: FileSystemTree; onFileSelect: (path: string) => void; activeFile: string | null; }> = ({ fileSystem, onFileSelect, activeFile }) => {
  return (
    <aside className="bg-[#0d1117] w-72 p-2 flex flex-col shrink-0 border-r border-gray-800">
      <div className="flex items-center justify-between p-2">
        <h2 className="font-bold text-lg">Codesigns</h2>
        <button><MenuIcon/></button>
      </div>
      <div className="relative my-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input type="text" placeholder="Search" className="w-full bg-[#21262d] border border-gray-700 rounded-md py-1 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <div className="flex-1 overflow-y-auto text-sm pr-1">
        {Object.keys(fileSystem).length > 0 ? (
            <FileTree tree={fileSystem} onFileSelect={onFileSelect} activeFile={activeFile} />
        ) : (
            <div className="text-center text-gray-500 text-xs mt-8 px-4">
                <p>No files yet.</p>
                <p className='mt-1'>Upload a file or paste code to get started.</p>
            </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
