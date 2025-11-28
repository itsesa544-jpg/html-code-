import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateHtmlForProjectStream } from '../services/geminiService';
import { UploadIcon, ClipboardCopyIcon, CheckIcon, SparklesIcon, XCircleIcon, ImageIcon, CodeIcon } from './icons/Icons';
import type { ProcessedFile } from '../App';
import type { ProjectFile } from '../services/geminiService';


interface EditorViewProps {
    onGenerationStart: (fileData: { name: string; path: string; sourceFiles: ProjectFile[] }) => void;
    onStreamUpdate: (path: string, htmlChunk: string) => void;
    activeFile: ProcessedFile | null;
    onAddFilesToProject: (projectPath: string, newFiles: ProjectFile[]) => void;
}


const EditorView: React.FC<EditorViewProps> = ({ onGenerationStart, onStreamUpdate, activeFile, onAddFilesToProject }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    
    // State for inputs
    const [pastedCode, setPastedCode] = useState<string>('');
    const [inputFileName, setInputFileName] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    // FIX: Add state for image mime type to correctly handle image uploads.
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!activeFile) return;

        if (activeFile.sourceFiles.length > 0 && activeFile.generatedHtml === '') {
            const generate = async () => {
                setIsLoading(true);
                setError(null);
                setActiveTab('preview');
                try {
                    // FIX: Pass image data and mime type to the generation service.
                    await generateHtmlForProjectStream(activeFile.sourceFiles, { data: imageBase64, mimeType: imageMimeType }, (chunk) => {
                        onStreamUpdate(activeFile.path, chunk);
                    });
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                    setError(errorMessage);
                    console.error("Generation error:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            generate();
        }
    }, [activeFile, imageBase64, imageMimeType, onStreamUpdate]);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // FIX: Explicitly type 'file' as 'File' to resolve type inference issues.
        const fileReadPromises = Array.from(files).map((file: File) => {
            return new Promise<ProjectFile>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve({ name: file.name, code: e.target?.result as string });
                reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
                reader.readAsText(file);
            });
        });

        try {
            const projectFiles = await Promise.all(fileReadPromises);
            
            if (activeFile) {
                onAddFilesToProject(activeFile.path, projectFiles);
            } else {
                const projectName = projectFiles.length > 1 ? `Project (${projectFiles.length} files)` : projectFiles[0].name;
                onGenerationStart({ name: projectName, path: projectName, sourceFiles: projectFiles });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred while processing files.";
            setError(`File Read Error: ${errorMessage}`);
            console.error("File reading error:", err);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

     const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
                const base64Data = result.split(',')[1];
                setImageBase64(base64Data);
                // FIX: Store the mime type of the uploaded image.
                setImageMimeType(file.type);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        // FIX: Clear the image mime type when the image is removed.
        setImageMimeType(null);
        if(imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    }

    const processPastedCode = (code: string, name: string) => {
        const projectFiles: ProjectFile[] = [{ name, code }];
        onGenerationStart({ name: name, path: name, sourceFiles: projectFiles });
    };
    
    const handleUploadClick = () => fileInputRef.current?.click();
    const handleImageUploadClick = () => imageInputRef.current?.click();

    const handleCopy = useCallback(() => {
        if (activeFile?.generatedHtml) {
            navigator.clipboard.writeText(activeFile.generatedHtml).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    }, [activeFile]);
    
    const handleGenerateFromText = () => {
        setValidationError(null);
        if (!pastedCode.trim()) {
            setValidationError("Please paste some code to convert.");
            return;
        }
        if (!inputFileName.trim() || !inputFileName.includes('.')) {
            setValidationError("Please provide a valid file name with an extension (e.g., script.js).");
            return;
        }
        processPastedCode(pastedCode, inputFileName);
    };

    const renderContent = () => {
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-red-400">
                    <p className="text-lg font-semibold">An Error Occurred</p>
                    <p className="mt-2 text-sm max-w-md text-center">{error}</p>
                    <button onClick={() => { setError(null); setIsLoading(false); }} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Try Again
                    </button>
                </div>
            );
        }
        
        if (activeFile) {
             return (
                <div className="relative h-full flex flex-col bg-[#0d1117] rounded-lg">
                   <div className="flex justify-between items-center p-2 border-b border-gray-800 shrink-0">
                        <div className='flex items-center gap-2'>
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                                Preview
                            </button>
                            <button 
                                onClick={() => setActiveTab('code')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'code' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                                HTML
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={handleUploadClick}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-[#21262d] border border-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <UploadIcon className="h-4 w-4" />
                                Add File(s)
                            </button>
                            <button 
                                onClick={handleCopy}
                                disabled={isLoading || !activeFile.generatedHtml}
                                className="flex items-center gap-2 bg-[#21262d] border border-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCopied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardCopyIcon className="h-4 w-4" />}
                                {isCopied ? 'Copied!' : 'Copy HTML'}
                            </button>
                        </div>
                    </div>
                   <div className="flex-1 overflow-auto">
                        {activeTab === 'preview' ? (
                            <iframe
                                key={activeFile.path}
                                srcDoc={activeFile.generatedHtml}
                                title="HTML Preview"
                                sandbox="allow-scripts allow-same-origin"
                                className="w-full h-full border-0 bg-white"
                            />
                        ) : (
                             <pre className="h-full overflow-auto p-4 text-sm whitespace-pre-wrap"><code className="language-html">{activeFile.generatedHtml}</code></pre>
                        )}
                   </div>
                </div>
            );
        }

        return (
           <div className="flex flex-col h-full items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-3xl">

                    <div className="flex-1 flex flex-col min-h-0 text-left">
                         <div className="text-center">
                            <div className="inline-block p-4 bg-[#21262d] rounded-full">
                                <CodeIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mt-4 text-2xl font-semibold text-white">Paste a single file's code</h3>
                            <p className="text-gray-400 mt-1 mb-6">Let AI create a runnable application from your code.</p>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="filename" className="block text-sm font-medium text-gray-300 mb-2">File Name</label>
                            <input type="text" id="filename" value={inputFileName} onChange={(e) => setInputFileName(e.target.value)} placeholder="e.g., `components/Card.tsx` (required for language detection)" className="bg-[#21262d] border border-gray-700 rounded-md w-full px-3 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"/>
                        </div>
                        <div className="flex-1 flex flex-col min-h-0 mb-4">
                            <label htmlFor="code-input" className="block text-sm font-medium text-gray-300 mb-2">Code</label>
                            <textarea id="code-input" value={pastedCode} onChange={(e) => setPastedCode(e.target.value)} placeholder="// Your code goes here..." className="flex-1 w-full bg-[#21262d] border border-gray-700 rounded-md p-3 text-gray-300 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none" style={{minHeight: '200px'}}></textarea>
                        </div>

                        <div className="mb-4">
                            {!imagePreview ? (
                                <button onClick={handleImageUploadClick} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:border-purple-500 text-gray-400 hover:text-white font-bold py-3 px-4 rounded-md transition-colors">
                                    <ImageIcon className="h-5 w-5"/>
                                    Add Image Reference (Optional)
                                </button>
                            ) : (
                                <div className="relative border border-gray-600 rounded-lg p-2 bg-[#21262d]">
                                    <p className="text-xs text-gray-400 mb-2">Image Reference:</p>
                                    <img src={imagePreview} alt="Preview" className="max-h-24 rounded-md" />
                                    <button onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-800 rounded-full text-white hover:bg-red-500">
                                        <XCircleIcon className="h-6 w-6"/>
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {validationError && (<p className="text-red-400 text-sm text-center mb-3">{validationError}</p>)}
                        <button onClick={handleGenerateFromText} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-[#30363d] hover:bg-[#484f58] text-white font-bold py-2.5 px-4 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                            <SparklesIcon className="h-5 w-5"/>
                            Generate HTML
                        </button>
                    </div>

                    <div className="flex items-center my-8">
                        <div className="flex-grow border-t border-gray-700/50"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs font-semibold">OR</span>
                        <div className="flex-grow border-t border-gray-700/50"></div>
                    </div>
                    
                     <div className="text-center">
                        <h3 className="text-xl font-semibold text-white">Upload a project or files</h3>
                        <p className="text-gray-400 mt-1 mb-6">Select multiple files to combine them into a single application.</p>
                        <button onClick={handleUploadClick} disabled={isLoading} className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2.5 px-6 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            Select File(s)
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#161b22] overflow-hidden">
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="*/*" multiple />
            <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <div className="flex items-center p-2.5 border-b border-gray-800">
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-[#21262d] text-gray-400">
                    {activeFile?.path || "No file selected"}
                </span>
            </div>
            <div className="flex-1 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default EditorView;