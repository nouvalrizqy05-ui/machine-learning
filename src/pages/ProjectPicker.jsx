import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen } from 'lucide-react'; // Hapus HardDrive jika tidak dipakai agar bersih

// --- PERUBAHAN 1: IMPORT GAMBAR DI SINI ---
// Sesuaikan path '../assets/' jika file ini ada di dalam folder 'pages'
import imageProjectCard from '../assets/image_project_card.png'; 
// ------------------------------------------

const ProjectPicker = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
            const projectData = JSON.parse(event.target.result);
            navigate('/image-project', { state: { projectData } });
        } catch (error) {
            alert("File project tidak valid");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* HEADER / NAVBAR */}
      <header className="bg-white px-8 py-5 shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div 
                onClick={() => navigate('/')} 
                className="text-2xl font-bold text-blue-600 tracking-tight cursor-pointer hover:opacity-80 transition"
            >
                Vision Machine
            </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto p-12">
        <h1 className="text-5xl font-bold mb-12 text-gray-900">New Project</h1>

        <div className="flex flex-wrap gap-6 mb-16">
            <button onClick={() => fileInputRef.current.click()} className="bg-white px-6 py-3.5 rounded-lg shadow-sm text-base font-semibold flex items-center gap-3 hover:bg-gray-50 border border-gray-200 transition text-gray-700">
                <FolderOpen size={20} className="text-gray-500"/> Open an existing project from a file
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* IMAGE PROJECT CARD */}
          <div 
            onClick={() => navigate('/image-project')} 
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl cursor-pointer transition transform hover:-translate-y-1 border border-transparent hover:border-blue-100 group"
          >
            <div className="h-48 bg-gray-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:bg-blue-50 transition">
                 {/* --- PERUBAHAN 2: GUNAKAN VARIABEL DI SINI --- */}
                 {/* Hapus "./assets/..." ganti dengan {imageProjectCard} */}
                <img 
                    src={imageProjectCard} 
                    alt="Image Project" 
                    className="h-full w-full object-contain p-4" 
                    onError={(e) => {e.target.style.display='none'}} 
                />
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition">Image Project</h3>
            
            <p className="text-gray-600 text-lg leading-relaxed">
                Teach based on images, from files or your webcam.
            </p>
          </div>

          {/* Placeholder: Audio Project */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 opacity-60 grayscale cursor-not-allowed">
             <div className="h-48 bg-gray-50 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-gray-400 font-bold">Audio Project</span>
             </div>
             <h3 className="text-2xl font-bold mb-3 text-gray-400">Audio Project</h3>
             <p className="text-gray-400 text-lg leading-relaxed">Coming soon.</p>
          </div>
          
          {/* Placeholder: Pose Project */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 opacity-60 grayscale cursor-not-allowed">
             <div className="h-48 bg-gray-50 rounded-xl mb-6 flex items-center justify-center">
                <span className="text-gray-400 font-bold">Pose Project</span>
             </div>
             <h3 className="text-2xl font-bold mb-3 text-gray-400">Pose Project</h3>
             <p className="text-gray-400 text-lg leading-relaxed">Coming soon.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectPicker;