import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Camera, Upload, MoreVertical, ChevronDown, ChevronUp, Download, X, Edit2, Trash2, VideoOff } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

const Studio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // --- STATE DATA & MODEL ---
  const [classes, setClasses] = useState([
    { id: 0, name: "Class 1", samples: [] }, 
    { id: 1, name: "Class 2", samples: [] }
  ]);
  
  useEffect(() => {
    if (location.state && location.state.projectData) {
        const loadedData = location.state.projectData;
        if(loadedData.classes) setClasses(loadedData.classes);
    }
  }, [location]);

  // --- STATE ADVANCED TRAINING ---
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.001);

  // --- TFJS & KAMERA ---
  const classifierRef = useRef(null);
  const mobilenetRef = useRef(null);
  const activeVideoRef = useRef(null);   
  const previewVideoRef = useRef(null);  
  const requestRef = useRef(null);
  const fileInputRef = useRef(null); 
  const currentStreamRef = useRef(null);

  const [activeWebcamId, setActiveWebcamId] = useState(null); 
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const isModelReadyRef = useRef(false); 
  const [isModelReadyState, setIsModelReadyState] = useState(false);
  const [predictionResults, setPredictionResults] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // --- STATE UI HELPER ---
  const [editingClassId, setEditingClassId] = useState(null);
  const [openMenuClassId, setOpenMenuClassId] = useState(null);

  // ... INIT MODEL ...
  useEffect(() => {
    const init = async () => {
      await tf.ready();
      mobilenetRef.current = await mobilenet.load();
      classifierRef.current = knnClassifier.create();
      console.log("Model Loaded");
    };
    init();
    return () => { 
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        stopMediaTracks();
    };
  }, []);

  const stopMediaTracks = () => {
    if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
    }
  };

  const startStream = async () => {
    stopMediaTracks();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 224, height: 224, facingMode: 'user' }, 
          audio: false 
      });
      currentStreamRef.current = newStream;
      return newStream;
    } catch (err) { 
        console.error("Error cam", err); 
        alert("Gagal mengakses kamera. Pastikan izin diberikan.");
        return null; 
    }
  };

  const handleImageUpload = (e, classId) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        files.forEach(file => {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setClasses(prev => prev.map(c => 
                        c.id === classId ? { ...c, samples: [...c.samples, event.target.result] } : c
                    ));
                };
                reader.readAsDataURL(file);
            }
        });
    }
    e.target.value = null; 
  };

  const handleOpenClassCamera = async (classId) => {
    if (isModelReadyRef.current) {
       isModelReadyRef.current = false;
       setIsModelReadyState(false);
       setPredictionResults([]);
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    setActiveWebcamId(classId);
    const s = await startStream();
    if (s) {
        setTimeout(() => {
            if (activeVideoRef.current) {
                activeVideoRef.current.srcObject = s;
                activeVideoRef.current.play();
            }
        }, 100);
    }
  };

  const handleCloseClassCamera = () => {
      setActiveWebcamId(null);
      stopMediaTracks();
  };

  const addExample = (classId) => {
    if (mobilenetRef.current && classifierRef.current && activeVideoRef.current && activeVideoRef.current.readyState === 4) {
      const activation = tf.tidy(() => {
          return mobilenetRef.current.infer(activeVideoRef.current, true);
      });
      classifierRef.current.addExample(activation, classId);
      
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.translate(64, 0); ctx.scale(-1, 1);
      ctx.drawImage(activeVideoRef.current, 0, 0, 64, 64);
      const thumbUrl = canvas.toDataURL();

      setClasses(prev => prev.map(c => c.id === classId ? { ...c, samples: [...c.samples, thumbUrl] } : c));
    }
  };

  const trainModel = () => {
    handleCloseClassCamera();
    setIsTraining(true);
    setTrainingProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        setTrainingProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            setIsTraining(false);
            isModelReadyRef.current = true;
            setIsModelReadyState(true);
            startPreviewLoop();
        }
    }, 50);
  };

  const startPreviewLoop = async () => {
     const s = await startStream();
     if (s && previewVideoRef.current) {
        previewVideoRef.current.srcObject = s;
        previewVideoRef.current.onloadeddata = () => {
            previewVideoRef.current.play();
            detectFrame();
        };
     }
  };

  const detectFrame = async () => {
    if (!isModelReadyRef.current) return;
    if (classifierRef.current && mobilenetRef.current && previewVideoRef.current && previewVideoRef.current.readyState === 4) {
      if (classifierRef.current.getNumClasses() > 0) {
        try {
            const result = await tf.tidy(() => {
                const activation = mobilenetRef.current.infer(previewVideoRef.current, true);
                return classifierRef.current.predictClass(activation);
            });
            if (result.confidences) {
                const resArray = Object.keys(result.confidences).map(classId => ({
                    classId: parseInt(classId),
                    score: result.confidences[classId] * 100
                }));
                setPredictionResults(resArray);
            }
        } catch (e) { console.log(e); }
      }
    }
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  const downloadProject = () => {
    const projectData = {
        name: "Vision Machine Project",
        date: new Date().toISOString(),
        settings: { epochs, batchSize, learningRate },
        classes: classes
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vision-project.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.classes) setClasses(data.classes);
            if (data.settings) {
                setEpochs(data.settings.epochs || 50);
                setBatchSize(data.settings.batchSize || 16);
                setLearningRate(data.settings.learningRate || 0.001);
            }
            alert("Project loaded successfully!");
        } catch (err) { alert("Invalid project file"); }
      };
      reader.readAsText(file);
    }
  };

  const handleRenameClass = (id, newName) => {
    setClasses(classes.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteClass = (id) => {
    if (classes.length <= 2) {
        alert("Minimum 2 classes required.");
        return;
    }
    setClasses(classes.filter(c => c.id !== id));
    setOpenMenuClassId(null);
  };

  const getClassColor = (id) => ['bg-orange-400', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'][id % 4] || 'bg-gray-500';

  return (
    // Base font text-sm (14px) agar tetap terbaca
    <div className="flex flex-col h-screen bg-[#e8eaed] overflow-hidden font-sans text-sm">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNewProject={() => navigate('/get-started')} 
        onSaveFile={downloadProject}
        onLoadFile={() => fileInputRef.current.click()}
      />
      <input type="file" ref={fileInputRef} onChange={handleLoadFile} className="hidden" accept=".json" />

      {/* HEADER: Compact (py-1.5) */}
      <header className="bg-white border-b px-4 py-1.5 flex items-center gap-4 shrink-0 shadow-sm z-10">
        <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-full">
            <Menu className="text-blue-600" size={20} />
        </button>
        <div className="flex items-center gap-2">
            <h1 className="font-bold text-gray-700 text-base">Vision Machine</h1>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Image Project</span>
        </div>
      </header>

      {/* MAIN CONTAINER: Padding diperkecil (p-2) */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden p-2">
            <div className="flex gap-4 h-full min-w-[900px] mx-auto max-w-screen-xl">
                
                {/* COLUMN 1: CLASSES */}
                <div className="w-[40%] flex flex-col gap-3 overflow-y-auto h-full pr-1 pb-20 custom-scrollbar">
                    {classes.map((cls) => (
                        // Padding Card dikurangi (p-2.5)
                        <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 relative transition hover:shadow-md">
                            {/* Header Class */}
                            <div className="flex justify-between items-center mb-1.5 border-b pb-1.5 relative">
                                 <input 
                                    value={cls.name}
                                    ref={editingClassId === cls.id ? (input) => input && input.focus() : null}
                                    onBlur={() => setEditingClassId(null)}
                                    onChange={(e) => handleRenameClass(cls.id, e.target.value)}
                                    className={`font-medium text-gray-700 border-none focus:ring-0 w-full text-sm p-0 ${editingClassId === cls.id ? 'bg-blue-50 px-2 rounded' : ''}`}
                                />
                                <div className="flex gap-1 items-center">
                                    <button onClick={() => setEditingClassId(cls.id)} className="text-gray-400 hover:text-blue-500 p-1">
                                        <Edit2 size={15}/>
                                    </button>
                                    <button onClick={() => setOpenMenuClassId(openMenuClassId === cls.id ? null : cls.id)} className="text-gray-400 hover:text-red-500 relative p-1">
                                        <MoreVertical size={15}/>
                                    </button>
                                    {openMenuClassId === cls.id && (
                                        <div className="absolute right-0 top-6 bg-white shadow-lg border rounded w-32 z-20 py-1">
                                            <button 
                                                onClick={() => handleDeleteClass(cls.id)}
                                                disabled={classes.length <= 2}
                                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${classes.length <= 2 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                            >
                                                <Trash2 size={12}/> Delete Class
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body Kartu */}
                            <div className="flex gap-2">
                                {/* Tinggi area webcam dikurangi ke min-h-[105px] */}
                                <div className="flex-1 min-h-[105px]">
                                    {activeWebcamId === cls.id ? (
                                        <div className="flex flex-col gap-1.5 h-full">
                                            {/* Ubah aspect-square jadi aspect-[4/3] agar tidak terlalu tinggi */}
                                            <div className="relative bg-black rounded overflow-hidden aspect-[4/3]">
                                                <video ref={activeVideoRef} className="w-full h-full object-cover transform scale-x-[-1]" muted playsInline />
                                                <button onClick={handleCloseClassCamera} className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-0.5 rounded-full z-10"><X size={12}/></button>
                                            </div>
                                            <button onMouseDown={() => addExample(cls.id)} className="w-full py-1.5 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 active:scale-95 transition select-none text-xs">Hold to Record</button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded p-2 h-full flex flex-col justify-center gap-1.5 border border-dashed border-gray-200">
                                            <p className="text-[10px] text-gray-500 mb-0.5">Add Samples:</p>
                                            <div className="flex gap-2 h-full">
                                                <button onClick={() => handleOpenClassCamera(cls.id)} className="flex-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex flex-col items-center justify-center gap-1 transition py-1">
                                                    <Camera size={18}/> <span className="text-[10px] font-bold">Webcam</span>
                                                </button>
                                                
                                                <input type="file" accept="image/*" multiple className="hidden" id={`upload-input-${cls.id}`} onChange={(e) => handleImageUpload(e, cls.id)} />
                                                <button onClick={() => document.getElementById(`upload-input-${cls.id}`).click()} className="flex-1 bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-50 flex flex-col items-center justify-center gap-1 transition py-1">
                                                    <Upload size={18}/> <span className="text-[10px] font-bold">Upload</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="w-[40%] bg-white ">
                                    {cls.samples.length > 0 ? (
                                        <div className="flex flex-col h-full">
                                             <p className="text-[10px] text-gray-500 mb-1">{cls.samples.length} Samples</p>
                                             {/* Max height grid dikurangi agar match dengan webcam area */}
                                             <div className="grid grid-cols-3 gap-1 overflow-y-auto max-h-[105px] pr-1 scrollbar-thin">
                                                {cls.samples.map((imgSrc, idx) => (<img key={idx} src={imgSrc} className="w-full aspect-square object-cover rounded bg-gray-200 border border-gray-100" />))}
                                             </div>
                                        </div>
                                    ) : <div className="h-full flex items-center justify-center"></div>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setClasses([...classes, {id: Date.now(), name: `Class ${classes.length + 1}`, samples: []}])} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-400 rounded hover:bg-white hover:border-gray-400 hover:text-gray-600 font-medium transition flex items-center justify-center gap-2 mb-10 text-xs">+ Add a class</button>
                </div>

                {/* COLUMN 2: TRAINING (Padding p-2.5) */}
                <div className="w-[25%] flex flex-col gap-3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sticky top-0">
                        <h2 className="font-bold text-sm mb-3 text-gray-700">Training</h2>
                        <button disabled={classes.every(c => c.samples.length === 0) || isTraining} onClick={trainModel} className={`w-full py-2 rounded text-white font-bold mb-2 transition shadow-sm text-xs ${isModelReadyState ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} ${(classes.every(c => c.samples.length === 0) || isTraining) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isTraining ? 'Training...' : (isModelReadyState ? 'Model Trained' : 'Train Model')}
                        </button>
                        {isTraining && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden"><div className="bg-blue-600 h-1.5 rounded-full transition-all duration-75" style={{ width: `${trainingProgress}%` }}></div></div>
                        )}
                        
                        <div className="border-t pt-1.5 mt-1">
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className={`flex items-center gap-2 text-[10px] font-medium w-full justify-between p-1 rounded ${showAdvanced ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                <span>Advanced</span> {showAdvanced ? <ChevronUp size={12}/> : <ChevronDown size={12} />}
                            </button>
                            
                            {showAdvanced && (
                                <div className="mt-1 space-y-1.5 bg-white p-1 animate-in slide-in-from-top-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-gray-700">Epochs:</label>
                                        <input type="number" value={epochs} onChange={(e) => setEpochs(e.target.value)} className="w-12 border rounded px-1 py-0.5 text-[10px] text-right"/>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-gray-700">Batch Size:</label>
                                        <select value={batchSize} onChange={(e) => setBatchSize(e.target.value)} className="w-12 border rounded px-1 py-0.5 text-[10px] text-right">
                                            <option value="16">16</option>
                                            <option value="32">32</option>
                                            <option value="64">64</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-gray-700">L. Rate:</label>
                                        <input type="number" value={learningRate} step="0.0001" onChange={(e) => setLearningRate(e.target.value)} className="w-14 border rounded px-1 py-0.5 text-[10px] text-right"/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: PREVIEW (Padding p-3) */}
                <div className="w-[35%] flex flex-col gap-3">
                     <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative transition-all duration-500 ${isModelReadyState ? 'opacity-100' : 'opacity-100 grayscale'}`}>
                        <div className="p-2.5 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-sm text-gray-700">Preview</h2>
                            <button onClick={() => setShowExportModal(true)} className={`flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-[10px] text-blue-600 font-medium hover:bg-blue-50 transition shadow-sm ${!isModelReadyState && 'hidden'}`}>
                                <Download size={12}/> Export
                            </button>
                        </div>
                        <div className="p-3">
                            {/* PENTING: Aspect-[4/3] menghemat ruang vertikal dibanding aspect-square */}
                            <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden relative mb-2 ring-2 ring-gray-50">
                                {isModelReadyState ? (
                                    <video ref={previewVideoRef} className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-center p-4">
                                         <div className="w-10 h-10 mb-2 rounded-full border-2 border-gray-300 flex items-center justify-center"><VideoOff size={20} /></div>
                                        <p className="text-[10px]">Train a model on the left to preview it here.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1"><span>Output</span> <span>Confidence</span></div>
                                {classes.map((cls) => {
                                    const result = predictionResults.find(r => r.classId === cls.id);
                                    const score = result ? result.score : 0;
                                    const isWinner = score > 50;
                                    return (
                                        <div key={cls.id} className="flex items-center gap-2 group h-7">
                                            <span className={`text-xs w-20 truncate transition ${isWinner ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{cls.name}</span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative shadow-inner"><div className={`h-full transition-all duration-200 ease-out ${getClassColor(cls.id)}`} style={{ width: `${score}%` }} /></div>
                                            <span className={`text-xs w-8 text-right font-medium ${isWinner ? 'text-gray-800' : 'text-gray-400'}`}>{score.toFixed(0)}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </main>
      
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-4">
                <h2 className="text-sm font-bold mb-3">Export Model</h2>
                <button onClick={downloadProject} className="w-full py-2 bg-blue-600 text-white font-bold rounded text-xs">Download JSON</button>
                <button onClick={() => setShowExportModal(false)} className="w-full py-2 mt-2 text-gray-500 text-xs">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Studio;