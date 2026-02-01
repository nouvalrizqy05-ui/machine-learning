import React from 'react';
import { X, Folder, Save, FilePlus, HelpCircle, MessageSquare, HardDrive, Database, UploadCloud } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, onNewProject, onSaveFile, onLoadFile, onSaveBrowser, onLoadBrowser }) => {
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-gray-500">System Ready</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="py-2 overflow-y-auto h-full pb-20 font-sans text-sm">
          <div onClick={() => { if(onNewProject) onNewProject(); onClose(); }} className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-4 text-gray-700 font-medium">
            <FilePlus size={20} /> New Project
          </div>
          
          <hr className="my-2 border-gray-200" />
          
          {/* BAGIAN "CLOUD" DIGANTI JADI "BROWSER STORAGE" */}
          <div className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Local Storage
          </div>

          <div onClick={() => { if(onLoadBrowser) onLoadBrowser(); onClose(); }} className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-4 text-gray-700 font-medium group">
            <Database size={20} className="text-blue-500 group-hover:scale-110 transition"/> 
            Load from Browser
          </div>

          <div onClick={() => { if(onSaveBrowser) onSaveBrowser(); onClose(); }} className="px-6 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-4 text-gray-700 font-medium group">
            <UploadCloud size={20} className="text-green-600 group-hover:scale-110 transition"/> 
            Save to Browser
          </div>

          <hr className="my-2 border-gray-200" />

          {/* FILE ACTIONS */}
          <div className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              File System
          </div>

          <div onClick={() => { if(onLoadFile) onLoadFile(); onClose(); }} className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-4 text-gray-700 font-medium">
            <Folder size={20} /> Open project from file
          </div>
          <div onClick={() => { if(onSaveFile) onSaveFile(); onClose(); }} className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-4 text-gray-700 font-medium">
            <Save size={20} className="text-gray-600"/> Download project as file
          </div>

          <hr className="my-2 border-gray-200" />

          <a href="#about" onClick={onClose} className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-4 text-gray-700 font-medium block">
             About Vision Machine
          </a>
          <a href="#faq" onClick={onClose} className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-4 text-gray-700 font-medium block">
             <HelpCircle size={20} /> FAQ
          </a>

          <hr className="my-2 border-gray-200" />
           <a href="mailto:feedback@visionmachine.com" className="px-6 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-4 text-gray-700 font-medium block">
             <MessageSquare size={20} /> Send feedback
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;