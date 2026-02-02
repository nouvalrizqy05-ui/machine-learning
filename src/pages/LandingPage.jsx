import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, ChevronUp, Github, Instagram, Globe } from 'lucide-react';
import Sidebar from '../components/Sidebar';

// IMPORT GAMBAR
import heroImg from '../assets/hero.png';
import step1Img from '../assets/step1.png';
import step2Img from '../assets/step2.png';
import step3Img from '../assets/step3.png';

// Data FAQ
const faqData = [
  { 
    q: "What is Vision Machine?", 
    a: "Vision Machine is a web-based tool that makes creating machine learning models fast, easy, and accessible to everyone. It allows you to train computers to recognize images without writing any code." 
  },
  { 
    q: "How does it work?", 
    a: "It uses a technique called Transfer Learning. We take a pre-trained neural network and fine-tune it with the images you provide via webcam or upload. This happens entirely in your browser." 
  },
  { 
    q: "Is my data safe?", 
    a: "Yes! The training happens locally in your web browser. Your images are not sent to any server unless you explicitly choose to save your project to Google Drive." 
  },
  { 
    q: "Can I save my project?", 
    a: "Absolutely. You can save your project as a file (.json) to your computer or save it directly to your Google Drive to continue working later." 
  },
  { 
    q: "What can I do with the model?", 
    a: "You can export your model as a TensorFlow.js file and use it in your own websites, apps, or creative coding projects." 
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    // Base font text-sm untuk tampilan lebih compact
    <div className="font-sans text-gray-800 bg-white min-h-screen scroll-smooth text-sm">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onNewProject={() => navigate('/get-started')} />

      {/* NAVBAR: Compact (py-2) */}
      <nav className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white z-30 shadow-md transition-all">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-full">
            <Menu size={20} className="text-gray-600" />
          </button>
          {/* Font logo diperkecil ke text-lg */}
          <span className="text-lg font-bold text-blue-600 tracking-tight">Vision Machine</span>
        </div>
        <div className="hidden md:flex gap-6 items-center font-medium text-gray-600 text-sm">
          <a href="#about" className="hover:text-blue-600 cursor-pointer transition">About</a>
          <a href="#faq" className="hover:text-blue-600 cursor-pointer transition">FAQ</a>
          <button onClick={() => navigate('/get-started')} className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs md:text-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION: Padding dikurangi (py-10) */}
      <header id="about" className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center py-10 px-4 gap-8 md:gap-16 scroll-mt-16">
        <div className="md:w-1/2 space-y-5">
          {/* Headline diperkecil: text-3xl md:text-5xl */}
          <h1 className="text-3xl md:text-5xl font-bold text-blue-600 leading-tight tracking-tight">
            Vision Machine
          </h1>
          
          {/* Subhead diperkecil: text-xl md:text-2xl */}
          <h2 className="text-xl md:text-2xl font-medium text-gray-900 leading-snug">
            Train a computer to recognize your own images, sounds, & poses.
          </h2>
          
          {/* Body text diperkecil: text-base */}
          <p className="text-gray-600 text-base leading-relaxed max-w-lg">
            A fast, easy way to create machine learning models for your sites, apps, and more – no expertise or coding required.
          </p>
          
          <button onClick={() => navigate('/get-started')} className="bg-blue-600 text-white px-8 py-3 rounded-full text-base font-bold hover:shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1 mt-2">
            Get Started
          </button>
        </div>
        
        <div className="md:w-1/2 flex justify-center">
            {/* Tinggi gambar diperkecil (h-64 / 256px) */}
            <div className="w-full h-64 md:h-80 bg-white flex items-center justify-center">
                 <img 
                    src={heroImg} 
                    alt="Hero Animation" 
                    className="object-contain h-full w-full drop-shadow-xl" 
                 />
            </div>
        </div>
      </header>

      {/* HOW IT WORKS SECTION: Padding dikurangi (py-12) */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center mb-10">
           <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How do I use it?</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          
          {/* Step 1 */}
          <div className="space-y-3 group">
             {/* Tinggi card gambar diperkecil (h-40) */}
             <div className="h-40 bg-white rounded-xl flex items-center justify-center mb-4 transition transform group-hover:scale-105 duration-300">
                <img src={step1Img} alt="Gather" className="h-full object-contain drop-shadow-md"/>
             </div>
            <span className="text-gray-400 font-bold text-base">01</span>
            <h3 className="text-xl font-bold text-gray-900">Gather</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Gather and group your examples into classes, or categories, that you want the computer to learn.</p>
          </div>
          
          {/* Step 2 */}
          <div className="space-y-3 group">
             <div className="h-40 bg-white rounded-xl flex items-center justify-center mb-4 transition transform group-hover:scale-105 duration-300">
                <img src={step2Img} alt="Train" className="h-full object-contain drop-shadow-md"/>
             </div>
            <span className="text-gray-400 font-bold text-base">02</span>
            <h3 className="text-xl font-bold text-gray-900">Train</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Train your model, then instantly test it out to see whether it can correctly classify new examples.</p>
          </div>
          
          {/* Step 3 */}
          <div className="space-y-3 group">
             <div className="h-40 bg-white rounded-xl flex items-center justify-center mb-4 transition transform group-hover:scale-105 duration-300">
                <img src={step3Img} alt="Export" className="h-full object-contain drop-shadow-md"/>
             </div>
            <span className="text-gray-400 font-bold text-base">03</span>
            <h3 className="text-xl font-bold text-gray-900">Export</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Export your model for your projects: sites, apps, and more. You can download your model or host it online.</p>
          </div>

        </div>
      </section>
      
      {/* FAQ SECTION: Padding dikurangi (py-12) */}
      <section id="faq" className="bg-gray-50 py-12 px-4 scroll-mt-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none bg-white hover:bg-gray-50 transition"
                >
                  {/* Pertanyaan size text-base */}
                  <span className={`font-bold text-base ${openFaqIndex === index ? 'text-blue-600' : 'text-gray-800'}`}>
                    {item.q}
                  </span>
                  {openFaqIndex === index ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                  {/* Jawaban size text-sm */}
                  <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER: Padding dikurangi (pt-12 pb-6) */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-600">Vision Machine</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Empowering creators to build AI models directly in the browser. No coding expertise required.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-base">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li><button onClick={() => navigate('/get-started')} className="hover:text-blue-600 transition">Get Started</button></li>
                    <li><button onClick={() => navigate('/get-started')} className="hover:text-blue-600 transition">Image Project</button></li>
                    <li><span className="text-gray-400 cursor-not-allowed">Audio Project</span></li>
                    <li><span className="text-gray-400 cursor-not-allowed">Pose Project</span></li>
                </ul>
            </div>
             <div>
                <h4 className="font-bold text-gray-900 mb-4 text-base">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#about" className="hover:text-blue-600 transition">About</a></li>
                    <li><a href="#faq" className="hover:text-blue-600 transition">FAQ</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-base">Connect</h4>
                <div className="flex gap-3">
                    <a href="https://github.com/nouvalarrrgh/" className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"><Github size={20} /></a>
                    <a href="https://instagram.com/nouvalarr_rgh/" className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"><Instagram size={20} /></a>
                    <a href="https://nouval-arrizqy.netlify.app/" className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"><Globe size={20} /></a>
                </div>
            </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; 2026 Vision Machine. All rights reserved by <a href="https://muhammadnouvalarrizqy.vercel.app"> Muhammad Nouval Ar-Rizqy</a>.</p>
            <div className="flex gap-6 mt-3 md:mt-0">
                <a href="https://policies.google.com/privacy?hl=en-US" className="hover:text-gray-900 transition">Privacy Policy</a>
                <a href="https://policies.google.com/terms?hl=en-US" className="hover:text-gray-900 transition">Terms of Service</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;