import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen } from 'lucide-react'; 

// --- IMPORT GAMBAR ---
import imageProjectCard from '../assets/image_project_card.png'; 
// ---------------------

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
    // Base font text-sm agar konsisten dengan halaman lain
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 text-sm">
      
      {/* HEADER: Compact (py-2) */}
      <header className="bg-white px-4 py-2 shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
            <div 
                onClick={() => navigate('/')} 
                className="text-lg font-bold text-blue-600 tracking-tight cursor-pointer hover:opacity-80 transition"
            >
                Vision Machine
            </div>
        </div>
      </header>

      {/* MAIN CONTENT: Container max-w-5xl agar lebih rapi */}
      <div className="max-w-5xl mx-auto p-8">
        {/* Title diperkecil: text-5xl -> text-3xl */}
        <h1 className="text-3xl font-bold mb-8 text-gray-900">New Project</h1>

        <div className="flex flex-wrap gap-4 mb-10">
            {/* Tombol File: Padding dan font diperkecil */}
            <button onClick={() => fileInputRef.current.click()} className="bg-white px-5 py-2.5 rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 border border-gray-200 transition text-gray-700">
                <FolderOpen size={18} className="text-gray-500"/> Open an existing project from a file
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IMAGE PROJECT CARD */}
          <div 
            onClick={() => navigate('/image-project')} 
            // Padding card diperkecil: p-8 -> p-5
            className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1 border border-transparent hover:border-blue-100 group"
          >
            {/* Tinggi gambar diperkecil: h-48 -> h-36 */}
            <div className="h-36 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:bg-blue-50 transition">
                 <img 
                    src={imageProjectCard} 
                    alt="Image Project" 
                    className="h-full w-full object-contain p-3" 
                    onError={(e) => {e.target.style.display='none'}} 
                />
            </div>
            
            {/* Card Title: text-2xl -> text-lg */}
            <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition">Image Project</h3>
            
            {/* Card Desc: text-lg -> text-sm */}
            <p className="text-gray-600 text-sm leading-relaxed">
                Teach based on images, from files or your webcam.
            </p>
          </div>

          {/* Placeholder: Audio Project */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 opacity-60 grayscale cursor-not-allowed">
             <div className="h-36 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wide">Audio</span>
             </div>
             <h3 className="text-lg font-bold mb-2 text-gray-400">Audio Project</h3>
             <p className="text-gray-400 text-sm leading-relaxed">Coming soon.</p>
          </div>
          
          {/* Placeholder: Pose Project */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 opacity-60 grayscale cursor-not-allowed">
             <div className="h-36 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-wide">Pose</span>
             </div>
             <h3 className="text-lg font-bold mb-2 text-gray-400">Pose Project</h3>
             <p className="text-gray-400 text-sm leading-relaxed">Coming soon.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectPicker;