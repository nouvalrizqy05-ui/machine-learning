import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Camera, Upload, MoreVertical, ChevronDown, ChevronUp, Download, FileJson, X, Edit2, Trash2, HelpCircle, History, BarChart2 } from 'lucide-react';
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
  
  // Load Project jika ada dari 'Open File'
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
  const fileInputRef = useRef(null); // Untuk load file dari sidebar

  const [activeWebcamId, setActiveWebcamId] = useState(null); 
  const [stream, setStream] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const isModelReadyRef = useRef(false); 
  const [isModelReadyState, setIsModelReadyState] = useState(false);
  const [predictionResults, setPredictionResults] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // --- STATE UI HELPER ---
  const [editingClassId, setEditingClassId] = useState(null);
  const [openMenuClassId, setOpenMenuClassId] = useState(null);

  // ... INIT MODEL & KAMERA ...
  useEffect(() => {
    const init = async () => {
      await tf.ready();
      mobilenetRef.current = await mobilenet.load();
      classifierRef.current = knnClassifier.create();
    };
    init();
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  const startStream = async () => {
    if (stream && stream.active) return stream;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(newStream);
      return newStream;
    } catch (err) { console.error("Error cam", err); return null; }
  };

  // --- HANDLER UPLOAD IMAGE ---
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

  // ... FUNGSI RECORDING & TRAINING ...
  const handleOpenClassCamera = async (classId) => {
    if (isModelReadyRef.current) {
       isModelReadyRef.current = false;
       setIsModelReadyState(false);
       setPredictionResults([]);
       if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    setActiveWebcamId(classId);
    const s = await startStream();
    setTimeout(() => {
      if (activeVideoRef.current && s) {
        activeVideoRef.current.srcObject = s;
        activeVideoRef.current.play();
      }
    }, 100);
  };

  const addExample = (classId) => {
    if (mobilenetRef.current && classifierRef.current && activeVideoRef.current && activeVideoRef.current.readyState === 4) {
      const activation = mobilenetRef.current.infer(activeVideoRef.current, true);
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
    setActiveWebcamId(null);
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
     if (previewVideoRef.current) {
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
            const activation = mobilenetRef.current.infer(previewVideoRef.current, true);
            const result = await classifierRef.current.predictClass(activation);
            if (result.confidences) {
                const resArray = Object.keys(result.confidences).map(classId => ({
                    classId: parseInt(classId),
                    score: result.confidences[classId] * 100
                }));
                setPredictionResults(resArray);
            }
        } catch (e) {}
      }
    }
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  // --- ACTIONS: EXPORT & IMPORT JSON ---
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

  // --- ACTIONS: CLASS MANAGEMENT ---
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

  const getClassColor = (id) => ['bg-orange-400', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'][id % 4];

  return (
    <div className="flex flex-col h-screen bg-[#e8eaed] overflow-hidden font-sans text-gray-800">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNewProject={() => navigate('/get-started')} 
        onSaveFile={downloadProject}
        onLoadFile={() => fileInputRef.current.click()}
      />
      <input type="file" ref={fileInputRef} onChange={handleLoadFile} className="hidden" accept=".json" />

      {/* HEADER: Font diperbesar (text-2xl) */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm z-10">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full">
            <Menu className="text-blue-600" size={28} />
        </button>
        <div className="flex items-center gap-3">
            <h1 className="font-bold text-2xl text-blue-600 tracking-tight">Vision Machine</h1>
            <span className="text-gray-300 text-2xl">|</span>
            <span className="text-lg font-medium text-gray-500 mt-1">Image Project</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex gap-8 h-full min-w-[1200px] mx-auto max-w-screen-2xl">
            
            {/* COLUMN 1: CLASSES */}
            <div className="w-[40%] flex flex-col gap-6 overflow-y-auto h-full pr-2 pb-20">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative transition hover:shadow-md">
                        {/* Header Class */}
                        <div className="flex justify-between items-center mb-4 border-b pb-3 relative">
                             {/* Input Name: text-xl */}
                             <input 
                                value={cls.name}
                                ref={editingClassId === cls.id ? (input) => input && input.focus() : null}
                                onBlur={() => setEditingClassId(null)}
                                onChange={(e) => handleRenameClass(cls.id, e.target.value)}
                                className={`font-medium text-gray-700 border-none focus:ring-0 w-full text-xl p-1 rounded ${editingClassId === cls.id ? 'bg-blue-50' : ''}`}
                            />
                            <div className="flex gap-2 items-center">
                                <button onClick={() => setEditingClassId(cls.id)} className="text-gray-400 hover:text-blue-500">
                                    <Edit2 size={20}/>
                                </button>
                                <button onClick={() => setOpenMenuClassId(openMenuClassId === cls.id ? null : cls.id)} className="text-gray-400 hover:text-red-500 relative">
                                    <MoreVertical size={20}/>
                                </button>
                                {openMenuClassId === cls.id && (
                                    <div className="absolute right-0 top-8 bg-white shadow-lg border rounded w-40 z-20 py-1">
                                        <button 
                                            onClick={() => handleDeleteClass(cls.id)}
                                            disabled={classes.length <= 2}
                                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 ${classes.length <= 2 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                        >
                                            <Trash2 size={16}/> Delete Class
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Body Kartu */}
                        <div className="flex gap-4">
                            <div className="flex-1 min-h-[160px]">
                                {activeWebcamId === cls.id ? (
                                    <div className="flex flex-col gap-2 h-full">
                                        <div className="relative bg-black rounded-lg overflow-hidden aspect-square md:aspect-[4/3]">
                                            <video ref={activeVideoRef} className="w-full h-full object-cover transform scale-x-[-1]" muted playsInline />
                                            <button onClick={() => setActiveWebcamId(null)} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full z-10"><X size={18}/></button>
                                        </div>
                                        <button onMouseDown={() => addExample(cls.id)} className="w-full py-3 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 active:scale-95 transition select-none">Hold to Record</button>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col justify-center gap-3 border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2 font-medium">Add Image Samples:</p>
                                        <div className="flex gap-3">
                                            {/* TOMBOL WEBCAM: text-sm font-semibold */}
                                            <button onClick={() => handleOpenClassCamera(cls.id)} className="flex-1 py-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex flex-col items-center justify-center gap-2 transition">
                                                <Camera size={28}/> <span className="text-sm font-semibold">Webcam</span>
                                            </button>
                                            
                                            {/* TOMBOL UPLOAD */}
                                            <input type="file" accept="image/*" multiple className="hidden" id={`upload-input-${cls.id}`} onChange={(e) => handleImageUpload(e, cls.id)} />
                                            <button onClick={() => document.getElementById(`upload-input-${cls.id}`).click()} className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-2 transition">
                                                <Upload size={28}/> <span className="text-sm font-semibold">Upload</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Samples Grid */}
                            <div className="w-[40%] bg-white ">
                                {cls.samples.length > 0 ? (
                                    <div className="flex flex-col h-full">
                                         <p className="text-sm text-gray-500 mb-2 font-medium text-right">{cls.samples.length} Samples</p>
                                         <div className="grid grid-cols-3 gap-1 overflow-y-auto max-h-[250px] pr-1">
                                            {cls.samples.map((imgSrc, idx) => (<img key={idx} src={imgSrc} className="w-full aspect-square object-cover rounded bg-gray-200 border border-gray-100" />))}
                                         </div>
                                    </div>
                                ) : <div className="h-full flex items-center justify-center"></div>}
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={() => setClasses([...classes, {id: Date.now(), name: `Class ${classes.length + 1}`, samples: []}])} className="w-full py-5 border-2 border-dashed border-gray-300 text-gray-400 rounded-xl hover:bg-white hover:border-gray-400 hover:text-gray-600 font-bold text-lg transition flex items-center justify-center gap-2">+ Add a class</button>
            </div>

            {/* COLUMN 2: TRAINING */}
            <div className="w-[20%] flex flex-col gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-0">
                    {/* Header: text-2xl */}
                    <h2 className="font-bold text-2xl mb-6 text-gray-700">Training</h2>
                    
                    {/* Button: text-lg */}
                    <button disabled={classes.every(c => c.samples.length === 0) || isTraining} onClick={trainModel} className={`w-full py-3.5 rounded text-white text-lg font-bold mb-4 transition shadow-sm ${isModelReadyState ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} ${(classes.every(c => c.samples.length === 0) || isTraining) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isTraining ? 'Training...' : (isModelReadyState ? 'Model Trained' : 'Train Model')}
                    </button>
                    {isTraining && (
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden"><div className="bg-blue-600 h-3 rounded-full transition-all duration-75" style={{ width: `${trainingProgress}%` }}></div></div>
                    )}
                    
                    {/* ADVANCED */}
                    <div className="border-t pt-3 mt-3">
                        <button onClick={() => setShowAdvanced(!showAdvanced)} className={`flex items-center gap-2 text-base font-medium w-full justify-between p-2 rounded ${showAdvanced ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <span>Advanced</span> {showAdvanced ? <ChevronUp size={20}/> : <ChevronDown size={20} />}
                        </button>
                        
                        {showAdvanced && (
                            <div className="mt-3 space-y-4 bg-white p-1 animate-in slide-in-from-top-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-700">Epochs:</label>
                                    <input type="number" value={epochs} onChange={(e) => setEpochs(e.target.value)} className="w-16 border rounded px-2 py-1 text-sm text-right"/>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-700">Batch Size:</label>
                                    <select value={batchSize} onChange={(e) => setBatchSize(e.target.value)} className="w-16 border rounded px-1 py-1 text-sm text-right">
                                        <option value="16">16</option>
                                        <option value="32">32</option>
                                        <option value="64">64</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold text-gray-700">Learning Rate:</label>
                                    <input type="number" value={learningRate} step="0.0001" onChange={(e) => setLearningRate(e.target.value)} className="w-20 border rounded px-2 py-1 text-sm text-right"/>
                                </div>
                                <div className="pt-3 border-t flex justify-between text-sm text-gray-400 font-medium">
                                    <button>Reset Defaults</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUMN 3: PREVIEW */}
            <div className="w-[30%] flex flex-col gap-4">
                 <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden relative transition-all duration-500 ${isModelReadyState ? 'opacity-100' : 'opacity-70 grayscale'}`}>
                    <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                        {/* Header: text-2xl */}
                        <h2 className="font-bold text-2xl text-gray-700">Preview</h2>
                        <button onClick={() => setShowExportModal(true)} className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-sm text-blue-600 font-bold hover:bg-blue-50 transition shadow-sm ${!isModelReadyState && 'hidden'}`}>
                            <Download size={16}/> Export Model
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative mb-6 ring-4 ring-gray-50">
                            <video ref={previewVideoRef} className={`w-full h-full object-cover transform scale-x-[-1] ${!isModelReadyState ? 'hidden' : 'block'}`} playsInline muted />
                            {!isModelReadyState && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-center p-4">
                                     <div className="w-20 h-20 mb-4 rounded-full border-4 border-gray-300 flex items-center justify-center"><Camera size={40} /></div>
                                    <p className="text-base font-medium">Train a model on the left to preview it here.</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-400 font-bold uppercase tracking-wider mb-2"><span>Output</span> <span>Confidence</span></div>
                            {classes.map((cls) => {
                                const result = predictionResults.find(r => r.classId === cls.id);
                                const score = result ? result.score : 0;
                                const isWinner = score > 50;
                                return (
                                    <div key={cls.id} className="flex items-center gap-3 group h-9">
                                        {/* Class Name: text-base */}
                                        <span className={`text-base w-28 truncate transition ${isWinner ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{cls.name}</span>
                                        <div className="flex-1 h-full bg-gray-100 rounded overflow-hidden relative shadow-inner"><div className={`h-full transition-all duration-200 ease-out ${getClassColor(cls.id)}`} style={{ width: `${score}%` }} /></div>
                                        <span className={`text-base w-12 text-right font-medium ${isWinner ? 'text-gray-800' : 'text-gray-400'}`}>{score.toFixed(0)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </main>
      
      {/* Modal Export */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Export Model</h2>
                <button onClick={downloadProject} className="w-full py-3 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 mb-3">Download JSON</button>
                <button onClick={() => setShowExportModal(false)} className="w-full py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Studio;