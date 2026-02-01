import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, ChevronUp, Github, Instagram, Globe } from 'lucide-react';
import Sidebar from '../components/Sidebar';

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
    <div className="font-sans text-gray-800 bg-white min-h-screen scroll-smooth">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onNewProject={() => navigate('/get-started')} />

      {/* NAVBAR: Ukuran Font Diperbesar (text-lg & text-2xl) */}
      <nav className="flex items-center justify-between px-8 py-5 sticky top-0 bg-white z-30 shadow-md transition-all">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full">
            <Menu size={28} className="text-gray-600" />
          </button>
          {/* Logo Brand: text-2xl */}
          <span className="text-2xl font-bold text-blue-600 tracking-tight">Vision Machine</span>
        </div>
        
        {/* Menu Links: text-lg */}
        <div className="hidden md:flex gap-10 items-center font-medium text-gray-600 text-lg">
          <a href="#about" className="hover:text-blue-600 cursor-pointer transition">About</a>
          <a href="#faq" className="hover:text-blue-600 cursor-pointer transition">FAQ</a>
          <button onClick={() => navigate('/get-started')} className="bg-blue-600 text-white px-7 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-lg">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="about" className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center py-20 px-6 gap-16 scroll-mt-28">
        <div className="md:w-1/2 space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-blue-600 leading-tight tracking-tight">
            Vision Machine
          </h1>
          <h2 className="text-3xl md:text-4xl font-medium text-gray-900 leading-tight">
            Train a computer to recognize your own images, sounds, & poses.
          </h2>
          <p className="text-gray-600 text-xl leading-relaxed max-w-lg">
            A fast, easy way to create machine learning models for your sites, apps, and more – no expertise or coding required.
          </p>
          <button onClick={() => navigate('/get-started')} className="bg-blue-600 text-white px-9 py-4 rounded-full text-xl font-bold hover:shadow-xl hover:bg-blue-700 transition transform hover:-translate-y-1 mt-4">
            Get Started
          </button>
        </div>
        
        <div className="md:w-1/2 flex justify-center">
            <div className="w-full h-96 bg-white flex items-center justify-center">
                 <img src="/assets/hero.png" alt="Hero Animation" className="object-contain h-full w-full drop-shadow-2xl" onError={(e) => e.target.style.display='none'} />
            </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
           <h2 className="text-4xl md:text-5xl font-bold text-gray-900">How do I use it?</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
          {/* Step 1 */}
          <div className="space-y-5 group">
             <div className="h-56 bg-white rounded-2xl flex items-center justify-center mb-6 transition transform group-hover:scale-105 duration-300">
                <img src="/assets/step1.png" alt="Gather" className="h-full object-contain drop-shadow-lg"/>
             </div>
            <span className="text-gray-400 font-bold text-lg">01</span>
            <h3 className="text-2xl font-bold text-gray-900">Gather</h3>
            <p className="text-gray-600 text-lg leading-relaxed">Gather and group your examples into classes, or categories, that you want the computer to learn.</p>
          </div>
          {/* Step 2 */}
          <div className="space-y-5 group">
             <div className="h-56 bg-white rounded-2xl flex items-center justify-center mb-6 transition transform group-hover:scale-105 duration-300">
                <img src="/assets/step2.png" alt="Train" className="h-full object-contain drop-shadow-lg"/>
             </div>
            <span className="text-gray-400 font-bold text-lg">02</span>
            <h3 className="text-2xl font-bold text-gray-900">Train</h3>
            <p className="text-gray-600 text-lg leading-relaxed">Train your model, then instantly test it out to see whether it can correctly classify new examples.</p>
          </div>
          {/* Step 3 */}
          <div className="space-y-5 group">
             <div className="h-56 bg-white rounded-2xl flex items-center justify-center mb-6 transition transform group-hover:scale-105 duration-300">
                <img src="/assets/step3.png" alt="Export" className="h-full object-contain drop-shadow-lg"/>
             </div>
            <span className="text-gray-400 font-bold text-lg">03</span>
            <h3 className="text-2xl font-bold text-gray-900">Export</h3>
            <p className="text-gray-600 text-lg leading-relaxed">Export your model for your projects: sites, apps, and more. You can download your model or host it online.</p>
          </div>
        </div>
      </section>
      
      {/* FAQ SECTION */}
      <section id="faq" className="bg-gray-50 py-24 px-6 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none bg-white hover:bg-gray-50 transition"
                >
                  <span className={`font-bold text-xl ${openFaqIndex === index ? 'text-blue-600' : 'text-gray-800'}`}>
                    {item.q}
                  </span>
                  {openFaqIndex === index ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-gray-400" />}
                </button>
                <div className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-64 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                  <p className="text-gray-600 text-lg leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-600">Vision Machine</h3>
                <p className="text-gray-500 text-base leading-relaxed">
                    Empowering creators to build AI models directly in the browser. No coding expertise required.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-6 text-lg">Product</h4>
                <ul className="space-y-4 text-base text-gray-600">
                    <li><button onClick={() => navigate('/get-started')} className="hover:text-blue-600 transition">Get Started</button></li>
                    <li><button onClick={() => navigate('/get-started')} className="hover:text-blue-600 transition">Image Project</button></li>
                    <li><span className="text-gray-400 cursor-not-allowed">Audio Project (Coming Soon)</span></li>
                    <li><span className="text-gray-400 cursor-not-allowed">Pose Project (Coming Soon)</span></li>
                </ul>
            </div>
             <div>
                <h4 className="font-bold text-gray-900 mb-6 text-lg">Resources</h4>
                <ul className="space-y-4 text-base text-gray-600">
                    <li><a href="#about" className="hover:text-blue-600 transition">About</a></li>
                    <li><a href="#faq" className="hover:text-blue-600 transition">FAQ</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-6 text-lg">Connect</h4>
                <div className="flex gap-4">
                    <a href="https://github.com/nouvalarrrgh/" className="p-3 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"><Github size={24} /></a>
                    <a href="https://instagram.com/nouvalarr_rgh/" className="p-3 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"><Instagram size={24} /></a>
                    <a href="https://nouval-arrizqy.netlify.app/" className="p-3 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition"><Globe size={24} /></a>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2026 Vision Machine. All rights reserved by <a href="https://muhammadnouvalarrizqy.vercel.app"> Muhammad Nouval Ar-Rizqy</a>.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
                <a href="https://policies.google.com/privacy?hl=en-US" className="hover:text-gray-900 transition">Privacy Policy</a>
                <a href="https://policies.google.com/terms?hl=en-US" className="hover:text-gray-900 transition">Terms of Service</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;