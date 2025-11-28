import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar, { FileSystemTree } from './components/Sidebar';
import EditorView from './components/EditorView';
import Footer from './components/Footer';
import type { ProjectFile } from './services/geminiService';

export interface ProcessedFile {
  name: string;
  path: string;
  sourceFiles: ProjectFile[];
  generatedHtml: string;
}

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemTree>({});
  const [processedFiles, setProcessedFiles] = useState<Record<string, ProcessedFile>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const addFileToSystem = (path: string, tree: FileSystemTree): FileSystemTree => {
    const parts = path.split('/');
    const fileName = parts.pop();
    if (!fileName) return tree;

    let currentLevel = tree;
    for (const part of parts) {
      if (!currentLevel[part]) {
        currentLevel[part] = { type: 'folder', name: part, children: {} };
      }
      const node = currentLevel[part];
      if (node.type === 'folder') {
        currentLevel = node.children;
      }
    }

    if (!currentLevel[fileName]) {
        currentLevel[fileName] = { type: 'file', name: fileName };
    }

    return { ...tree };
  };

  const handleGenerationStart = (fileData: { name: string; path: string; sourceFiles: ProjectFile[] }) => {
    const newFile: ProcessedFile = { ...fileData, generatedHtml: '' };
    setFileSystem(prevSystem => addFileToSystem(newFile.path, prevSystem));
    setProcessedFiles(prevFiles => ({
        ...prevFiles,
        [newFile.path]: newFile
    }));
    setActiveFile(newFile.path);
  };

  const handleAddFilesToProject = (projectPath: string, newFiles: ProjectFile[]) => {
      setProcessedFiles(prev => {
          const project = prev[projectPath];
          if (!project) return prev;

          const existingFileNames = new Set(project.sourceFiles.map(f => f.name));
          const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));

          if (uniqueNewFiles.length === 0) return prev;

          return {
              ...prev,
              [projectPath]: {
                  ...project,
                  sourceFiles: [...project.sourceFiles, ...uniqueNewFiles],
                  generatedHtml: '' // Reset for regeneration
              }
          }
      });
  };

  const handleStreamUpdate = (path: string, htmlChunk: string) => {
    setProcessedFiles(prevFiles => {
      const existingFile = prevFiles[path];
      if (existingFile) {
        return {
          ...prevFiles,
          [path]: {
            ...existingFile,
            generatedHtml: existingFile.generatedHtml + htmlChunk,
          }
        };
      }
      return prevFiles;
    });
  };

  const handleFileSelect = (path: string) => {
    setActiveFile(path);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }

  const activeFileData = activeFile ? processedFiles[activeFile] : null;

  return (
    <div className="flex flex-col h-screen font-sans text-gray-300 bg-[#0d1117] overflow-hidden">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            fileSystem={fileSystem} 
            onFileSelect={handleFileSelect}
            activeFile={activeFile}
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
        />
        <main className="flex-1 flex flex-col">
          <EditorView 
            onGenerationStart={handleGenerationStart}
            onStreamUpdate={handleStreamUpdate}
            activeFile={activeFileData}
            onAddFilesToProject={handleAddFilesToProject}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
