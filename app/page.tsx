'use client';

// 1. Imports
import { runGeminiAction } from '@/app/actions/runGemini';
import { uploadToTransloadit } from '../app/lib/transloadit'; 
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  Search, History, Briefcase, SquarePen, Video, Box, Sparkles, Image as ImageIcon,
  HelpCircle, MessageSquare, MousePointer2, Hand, Undo2, Redo2, ChevronDown, Share2,
  Type, Download, Upload, Eye, FileDown, Layers, ArrowUpDown,
  SlidersHorizontal, Paintbrush, Crop, Scan, Droplet, Aperture, MonitorUp, Eclipse,
  Mountain, Bug, Activity, Bot, Image, Zap,
  Film, BarChart3, Infinity, Hexagon, Clapperboard, Repeat, X, Loader2,
  Settings2, Cpu, Play, Trash2
} from 'lucide-react';

// --- 2. CUSTOM NODES ---

// A. SMART TEXT NODE
const TextNode = ({ id, data }: { id: string, data: any }) => {
  const { updateNodeData } = useReactFlow();

  const handleTextChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { text: evt.target.value });
  };

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-lg p-3 min-w-[250px] shadow-xl hover:border-blue-500/30 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Type size={14} className="text-gray-400 group-hover:text-blue-400 transition" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-200 transition">
            Text / Prompt
          </span>
        </div>
      </div>
      
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500" />

      <div className="flex flex-col gap-2">
        <textarea 
          className="w-full bg-[#111111] text-gray-300 text-xs p-3 rounded-md border border-white/5 outline-none focus:border-blue-500/50 focus:bg-black transition-all resize-y min-h-[100px] leading-relaxed nodrag" 
          placeholder="Write your system prompt or content here..."
          defaultValue={data.text || ""} 
          onChange={handleTextChange}
        />
        <div className="text-[9px] text-gray-600 font-mono text-right">
           INPUT
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-purple-500" />
    </div>
  );
};

// B. IMAGE UPLOAD NODE
const ImageNode = ({ data }: { data: any }) => {
  const [preview, setPreview] = useState<string | null>(data.preview || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      data.preview = objectUrl; 

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log("✅ Image Converted to Base64!");
        data.imageUrl = base64String; 
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-lg p-3 min-w-[240px] shadow-xl hover:border-blue-500/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon size={14} className="text-blue-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Upload Image</span>
      </div>
      <div className="flex flex-col gap-2">
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload size={24} className="text-gray-500 mb-2" />
              <p className="text-[10px] text-gray-500">Click to upload</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="relative w-full h-40 bg-black rounded-lg overflow-hidden border border-white/10 group">
             <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
             <button onClick={() => { setPreview(null); data.imageUrl = null; }} className="absolute top-2 right-2 p-1 bg-black/60 rounded hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition z-20"><X size={12} /></button>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-purple-500" />
    </div>
  );
};

// C. VIDEO UPLOAD NODE
const VideoNode = ({ data }: { data: any }) => {
  const [preview, setPreview] = useState<string | null>(data.preview || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploading(true);

      try {
        //@ts-ignore
        const result = await uploadToTransloadit(file);
        console.log("Video Uploaded:", result.url);
        data.videoUrl = result.url;
        data.preview = objectUrl;
      } catch (error) {
        console.error(error);
        alert("Upload failed.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className={`bg-[#1e1e1e] rounded-lg p-3 min-w-[280px] transition-all duration-300 border ${
      uploading 
        ? "border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.5)] animate-pulse" 
        : "border-white/10 hover:border-blue-500/30 shadow-xl"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Video size={14} className="text-pink-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Upload Video</span>
      </div>
      <div className="flex flex-col gap-2">
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition">
             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Film size={24} className="text-gray-500 mb-2" />
                <p className="text-[10px] text-gray-500">Click to upload video</p>
             </div>
             <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="relative w-full bg-black rounded-lg overflow-hidden border border-white/10 group">
             <video src={preview} controls className="w-full h-32 object-contain" />
             {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
                   <div className="flex flex-col items-center gap-2">
                     <Loader2 size={20} className="text-pink-400 animate-spin" />
                     <span className="text-[9px] text-pink-200 font-mono tracking-wider">UPLOADING</span>
                   </div>
                </div>
             )}
             <button onClick={() => { setPreview(null); data.videoUrl = null; }} className="absolute top-2 right-2 p-1 bg-black/60 rounded hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition z-20"><X size={12} /></button>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-purple-500" />
    </div>
  );
};

// D. LLM NODE
const LLMNode = ({ id, data }: { id: string, data: any }) => {
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState(""); 
  const { getEdges, getNode, updateNodeData } = useReactFlow();

  const handleRun = async () => {
    setLoading(true);
    setResultText(""); 
    try {
      const edges = getEdges();
      
      const userEdge = edges.find((e) => e.target === id && e.targetHandle === 'user');
      const userNode = userEdge ? getNode(userEdge.source) : null;
      const userPrompt = userNode?.data?.text || ""; 

      const systemEdge = edges.find((e) => e.target === id && e.targetHandle === 'system');
      const systemNode = systemEdge ? getNode(systemEdge.source) : null;
      const systemPrompt = systemNode?.data?.text || "";

      const imageEdges = edges.filter((e) => e.target === id && e.targetHandle === 'images');
      const imageUrls = imageEdges.map((e) => {
          const node = getNode(e.source);
          return node?.data?.imageUrl; 
      }).filter((url) => url); 

      let finalPrompt = userPrompt;
      if (systemPrompt) finalPrompt = `System: ${systemPrompt}\nUser: ${userPrompt}`;

      if (!finalPrompt && imageUrls.length === 0) {
        alert("❌ No input! Connect a text node or image node.");
        setLoading(false);
        return;
      }

      //@ts-ignore
      const result = await runGeminiAction(finalPrompt, "gemini-2.5-flash", imageUrls);
      
      if (result.success && result.output) {
        setResultText(result.output);
        updateNodeData(id, { ...data, output: result.output });
      } else {
        alert("AI failed to respond.");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to start task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[#1e1e1e] rounded-xl p-0 min-w-[300px] max-w-[400px] transition-all duration-300 group flex flex-col border ${
       loading 
         ? "border-purple-400 shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)] animate-pulse" 
         : "border-purple-500/30 hover:border-purple-500/60 shadow-2xl shadow-purple-900/10"
    }`}>
      
      {/* HEADER */}
      <div className="bg-[#151515] p-3 rounded-t-xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-1.5 rounded-lg">
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-200 tracking-wide">GEMINI WORKER</div>
            <div className="text-[9px] text-gray-500 font-mono">ID: {id}</div>
          </div>
        </div>
        <button 
          onClick={handleRun}
          disabled={loading}
          className={`text-white p-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-95 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
        >
           {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
        </button>
      </div>

      {/* BODY */}
      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium px-1">
            <span>MODEL</span> <Cpu size={10} />
          </div>
          <select className="w-full bg-[#111111] text-gray-300 text-xs p-2 rounded border border-white/10 outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-[#1a1a1a] transition">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
        </div>

        {/* Inputs */}
        <div className="space-y-2 pt-2 border-t border-white/5">
           <div className="relative flex items-center justify-between group/handle">
              <Handle type="target" position={Position.Left} id="system" className="w-2.5 h-2.5 bg-blue-500 border-2 border-[#1e1e1e] !left-[-21px]" />
              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>system_prompt</div>
           </div>
           <div className="relative flex items-center justify-between group/handle">
              <Handle type="target" position={Position.Left} id="user" className="w-2.5 h-2.5 bg-green-500 border-2 border-[#1e1e1e] !left-[-21px]" />
              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>user_message</div>
           </div>
           <div className="relative flex items-center justify-between group/handle">
              <Handle type="target" position={Position.Left} id="images" className="w-2.5 h-2.5 bg-orange-500 border-2 border-[#1e1e1e] !left-[-21px]" />
              <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></span>images (vision)</div>
           </div>
        </div>

        {/* Result Display */}
        {resultText && (
          <div className="mt-2 p-3 bg-black/40 rounded-lg border border-purple-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="text-[9px] text-purple-400 font-bold mb-1 tracking-wider">GENERATED OUTPUT:</div>
             <div className="text-xs text-gray-200 leading-relaxed font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {resultText}
             </div>
          </div>
        )}
      </div>

      <div className="bg-[#151515] p-2 rounded-b-xl border-t border-white/5 flex justify-end relative">
         <div className="text-[10px] text-purple-400 font-mono pr-2">generated_text</div>
         <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-purple-500 border-2 border-[#1e1e1e] !right-[-6px]" />
      </div>
    </div>
  );
};

// --- 3. SIDE DRAWER ---
const SideDrawer = ({ isOpen, activePanel, workflowName }: { isOpen: boolean, activePanel: string, workflowName: string }) => {
  if (!isOpen) return null;

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const cardClass = "relative flex flex-col items-center justify-center aspect-square border border-white/5 rounded-lg bg-[#1e1e1e] hover:bg-white/5 hover:border-white/10 transition cursor-pointer group gap-3";
  const cardIconClass = "text-gray-300 group-hover:text-white transition";
  const cardTextClass = "text-xs text-gray-300 font-medium group-hover:text-white transition text-center px-2 leading-tight";

  const renderVideoModelsContent = () => (
    <>
      <h2 className="text-lg font-semibold text-white mb-2">Video Models</h2>
      <div className="grid grid-cols-2 gap-2 pb-10">
        <div className={cardClass} draggable onDragStart={(event) => onDragStart(event, 'videoNode')}>
          <Upload size={24} className="text-pink-500" />
          <span className={cardTextClass}>Upload Video</span>
        </div>
        <div className={cardClass}><Film size={24} className="text-blue-500" /><span className={cardTextClass}>Veo 3.1 Text</span></div>
        <div className={cardClass}><Film size={24} className="text-red-500" /><span className={cardTextClass}>Veo 3.1 Image</span></div>
        <div className={cardClass}><span className="absolute top-2 right-2 bg-[#E3E893] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm">New</span><BarChart3 size={24} className="text-cyan-400" /><span className={cardTextClass}>Seedance Pro</span></div>
        <div className={cardClass}><Bot size={24} className="text-white" /><span className={cardTextClass}>Sora 2</span></div>
        <div className={cardClass}><Infinity size={24} className="text-white" /><span className={cardTextClass}>LTX 2 Video</span></div>
      </div>
    </>
  );

  const renderImageModelsContent = () => (
    <>
      <h2 className="text-lg font-semibold text-white mb-2">Image Models</h2>
      <div className="grid grid-cols-2 gap-2 pb-10">
        <div className={cardClass} draggable onDragStart={(event) => onDragStart(event, 'imageNode')}>
          <Upload size={24} className="text-blue-500" />
          <span className={cardTextClass}>Upload Image</span>
        </div>
        <div className={cardClass}><Mountain size={24} className="text-white" /><span className={cardTextClass}>Flux 2 Pro</span></div>
        <div className={cardClass}><Mountain size={24} className="text-white" /><span className={cardTextClass}>Flux 2 Dev</span></div>
        <div className={cardClass}><Bug size={24} className="text-white" /><span className={cardTextClass}>Reve</span></div>
        <div className={cardClass}><Activity size={24} className="text-[#E3E893]" /><span className={cardTextClass}>Higgsfield</span></div>
        <div className={cardClass}><span className="absolute top-2 right-2 bg-[#E3E893] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm">New</span><Bot size={24} className="text-white" /><span className={cardTextClass}>GPT Image 1.5</span></div>
      </div>
    </>
  );

  const renderToolboxContent = () => (
    <>
      <h2 className="text-lg font-semibold text-white mb-2">Toolbox</h2>
      <div className="grid grid-cols-2 gap-2 pb-10">
        <div className={cardClass}><SlidersHorizontal size={20} className={cardIconClass} /><span className={cardTextClass}>Levels</span></div>
        <div className={cardClass}><ImageIcon size={20} className={cardIconClass} /><span className={cardTextClass}>Compositor</span></div>
        <div className={cardClass}><Paintbrush size={20} className={cardIconClass} /><span className={cardTextClass}>Painter</span></div>
        <div className={cardClass}><Crop size={20} className={cardIconClass} /><span className={cardTextClass}>Crop</span></div>
        <div className={cardClass}><Scan size={20} className={cardIconClass} /><span className={cardTextClass}>Resize</span></div>
        <div className={cardClass}><Droplet size={20} className={cardIconClass} /><span className={cardTextClass}>Blur</span></div>
      </div>
    </>
  );

  const renderQuickAccessContent = () => (
    <>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 px-1">
        <span>From</span><span className="bg-[#1e1e1e] border border-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">Input</span>
        <span>to</span><span className="bg-[#1e1e1e] border border-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">Output</span>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <h3 className="text-sm font-semibold text-white mb-3">Quick access</h3>
        <div className="grid grid-cols-2 gap-2 pb-10">
          
          <div className={cardClass} draggable onDragStart={(event) => onDragStart(event, 'textNode')}>
            <Type size={20} className={cardIconClass} />
            <span className={cardTextClass}>Prompt</span>
          </div>

          <div className={cardClass} draggable onDragStart={(event) => onDragStart(event, 'llmNode')}>
            <Sparkles size={20} className={cardIconClass} />
            <span className={cardTextClass}>LLM Node</span>
          </div>
          
          <div className={cardClass}><Download size={20} className={cardIconClass} /><span className={cardTextClass}>Import</span></div>
          <div className={cardClass}><Upload size={20} className={cardIconClass} /><span className={cardTextClass}>Export</span></div>
          <div className={cardClass}><Eye size={20} className={cardIconClass} /><span className={cardTextClass}>Preview</span></div>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-[260px] h-full bg-[#111111] border-r border-white/10 flex flex-col p-4 animate-in slide-in-from-left duration-200 z-10 shadow-2xl">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      <div className="mb-5"><h2 className="text-lg font-semibold text-white truncate">{workflowName || 'untitled'}</h2></div>
      <div className="relative mb-5 group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-gray-400 transition" size={14} />
        <input type="text" placeholder="Search" className="w-full bg-[#1e1e1e] text-gray-200 pl-9 pr-8 py-2 rounded-md border border-white/5 outline-none focus:border-white/20 text-xs placeholder-gray-600 transition" />
         <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white transition" size={12} />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {(activePanel === 'search' || activePanel === 'history') && renderQuickAccessContent()}
        {activePanel === 'video' && renderVideoModelsContent()}
        {activePanel === 'projects' && renderToolboxContent()}
        {activePanel === 'gallery' && renderImageModelsContent()}
      </div>
    </div>
  );
};

// --- 4. SIDEBAR ---
const Sidebar = ({ activePanel, setActivePanel }: { activePanel: string | null, setActivePanel: (p: string | null) => void }) => {
  const handlePanelClick = (panelName: string) => setActivePanel(activePanel === panelName ? null : panelName);
  const getButtonClass = (name: string) => {
    const base = "p-3 rounded-md transition-all duration-200 cursor-pointer flex justify-center items-center mb-1";
    if (activePanel === name) return `${base} bg-[#E3E893] text-black shadow-lg`;
    return `${base} text-gray-400 hover:text-white hover:bg-white/10`;
  };
  return (
    <aside className="h-full w-[60px] bg-[#171717] border-r border-white/10 flex flex-col items-center py-6 z-30 relative flex-shrink-0">
      <div className="mb-6 flex justify-center items-center w-full">
        <UserButton appearance={{ baseTheme: dark, elements: { avatarBox: "w-9 h-9 border-2 border-white/10 hover:border-white/30 transition", userButtonPopoverCard: "bg-[#171717] border border-white/10 shadow-2xl", userButtonPopoverFooter: "hidden" } }} />
      </div>
      <div className="flex flex-col w-full px-2 items-center">
        <button className={getButtonClass('search')} onClick={() => handlePanelClick('search')} title="Search"><Search size={20} strokeWidth={activePanel === 'search' ? 2.5 : 2} /></button>
        <button className={getButtonClass('history')} onClick={() => handlePanelClick('history')} title="History"><History size={20} strokeWidth={activePanel === 'history' ? 2.5 : 2} /></button>
        <button className={getButtonClass('projects')} onClick={() => handlePanelClick('projects')} title="Toolbox"><Briefcase size={20} strokeWidth={activePanel === 'projects' ? 2.5 : 2} /></button>
        <button className={getButtonClass('edit')} title="Edit"><SquarePen size={20} /></button>
        <button className={getButtonClass('video')} onClick={() => handlePanelClick('video')} title="Video Models"><Video size={20} strokeWidth={activePanel === 'video' ? 2.5 : 2} /></button>
        <button className={getButtonClass('assets')} title="Assets"><Box size={20} /></button>
        <button className={getButtonClass('ai')} title="AI"><Sparkles size={20} /></button>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col w-full px-2 items-center mb-2">
         <button className={getButtonClass('gallery')} onClick={() => handlePanelClick('gallery')} title="Image Models"><ImageIcon size={20} strokeWidth={activePanel === 'gallery' ? 2.5 : 2} /></button>
        <button className={getButtonClass('help')} title="Help"><HelpCircle size={20} /></button>
        <button className={getButtonClass('discord')} title="Discord"><MessageSquare size={20} /></button>
      </div>
    </aside>
  );
};

// --- 5. HEADER & TOOLBAR ---
const Header = ({ workflowName, setWorkflowName }: { workflowName: string, setWorkflowName: (name: string) => void }) => (
    <header className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
      <div className="pointer-events-auto">
        <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="untitled" className="bg-[#2C2C2C] text-gray-200 px-4 py-2 rounded-lg border border-white/5 outline-none focus:border-white/20 focus:bg-[#383838] w-64 text-sm transition-all shadow-lg" />
      </div>
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="bg-[#2C2C2C] text-gray-300 px-3 py-2 rounded-lg border border-white/5 text-xs flex items-center gap-2 hover:bg-[#383838] transition cursor-default">
          <Sparkles size={14} className="text-white" />
          <span>150 credits</span>
        </div>
        <button className="bg-[#EBEBEB] text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white transition cursor-pointer"><Share2 size={16} /> Share</button>
      </div>
    </header>
);

const BottomToolbar = ({ isSelectionMode, setIsSelectionMode }: { isSelectionMode: boolean, setIsSelectionMode: (mode: boolean) => void }) => {
    const { zoomIn, zoomOut, setViewport, fitView, getZoom, deleteElements, getNodes, getEdges } = useReactFlow();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(100);
    
    useEffect(() => { setCurrentZoom(Math.round(getZoom() * 100)); const interval = setInterval(() => { const z = getZoom(); if (z) setCurrentZoom(Math.round(z * 100)); }, 100); return () => clearInterval(interval); }, [getZoom]);
    
    const getToolClass = (isActive: boolean) => 
        isActive 
          ? "p-2 text-black bg-[#E3E893] rounded transition cursor-pointer shadow-lg" 
          : "p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition cursor-pointer";
    const menuItemClass = "flex items-center justify-between px-3 py-2 hover:bg-white/10 cursor-pointer text-sm text-gray-200 transition-colors";

    const handleDelete = useCallback(() => {
        const nodesToDelete = getNodes().filter((n) => n.selected);
        const edgesToDelete = getEdges().filter((e) => e.selected);
        deleteElements({ nodes: nodesToDelete, edges: edgesToDelete });
    }, [getNodes, getEdges, deleteElements]);
    
    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2C2C2C] border border-white/10 rounded-lg p-1 flex items-center gap-1 z-10 shadow-xl">
            {/* POINTER (Selection Mode) */}
            <button className={getToolClass(isSelectionMode)} onClick={() => setIsSelectionMode(true)} title="Selection Mode"><MousePointer2 size={18} /></button>
            {/* HAND (Pan Mode) */}
            <button className={getToolClass(!isSelectionMode)} onClick={() => setIsSelectionMode(false)} title="Pan Mode"><Hand size={18} /></button>
            
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            <button className={getToolClass(false)}><Undo2 size={18} /></button>
            <button className={getToolClass(false)}><Redo2 size={18} /></button>
            
            {/* DELETE BUTTON */}
            <button className={getToolClass(false)} onClick={handleDelete} title="Delete Selected">
               <Trash2 size={18} />
            </button>

            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            <div className="relative">
                <button className="px-3 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded transition cursor-pointer flex items-center gap-1 min-w-[60px] justify-between" onClick={() => setIsMenuOpen(!isMenuOpen)}>{currentZoom}% <ChevronDown size={12} /></button>
                {isMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1">
                        <div className={menuItemClass} onClick={() => { zoomIn(); setIsMenuOpen(false); }}><span>Zoom in</span> <span className="text-xs text-gray-500">Ctrl +</span></div>
                        <div className={menuItemClass} onClick={() => { zoomOut(); setIsMenuOpen(false); }}><span>Zoom out</span> <span className="text-xs text-gray-500">Ctrl -</span></div>
                        <div className={menuItemClass} onClick={() => { setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 }); setIsMenuOpen(false); }}><span>Zoom to 100%</span> <span className="text-xs text-gray-500">Ctrl 0</span></div>
                        <div className={menuItemClass} onClick={() => { fitView({ duration: 800 }); setIsMenuOpen(false); }}><span>Zoom to fit</span> <span className="text-xs text-gray-500">Ctrl 1</span></div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- 6. MAIN FLOW CANVAS ---
const FlowCanvas = () => {
    const [workflowName, setWorkflowName] = useState("untitled");
    const [activePanel, setActivePanel] = useState<string | null>(null);
    
    // New State for Selection vs Pan
    const [isSelectionMode, setIsSelectionMode] = useState(false); 

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const nodeTypes = useMemo(() => ({ 
      textNode: TextNode,
      imageNode: ImageNode,
      videoNode: VideoNode,
      llmNode: LLMNode 
    }), []);

    const onNodesChange = useCallback((changes: any) => setNodes((ns) => applyNodeChanges(changes, ns)), []);
    const onEdgesChange = useCallback((changes: any) => setEdges((es) => applyEdgeChanges(changes, es)), []);
    const onConnect = useCallback((params: Connection) => setEdges((es) => addEdge(params, es)), []);
    const { screenToFlowPosition } = useReactFlow();

    const onDragOver = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (typeof type === 'undefined' || !type) return;
        
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode: Node = {
          id: `${type}-${nodes.length + 1}`,
          type,
          position,
          data: { label: `New ${type}`, text: "" }, 
        };
        setNodes((nds) => nds.concat(newNode));
      },
      [screenToFlowPosition, nodes],
    );

    return (
        <div className="flex h-screen w-screen bg-[#171717]">
            <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
            {(activePanel === 'search' || activePanel === 'history' || activePanel === 'projects' || activePanel === 'gallery' || activePanel === 'video') && (
                <SideDrawer isOpen={true} activePanel={activePanel} workflowName={workflowName} />
            )}
            <div className="flex-1 relative h-full">
                <Header workflowName={workflowName} setWorkflowName={setWorkflowName} />
                
                {/* Pass state and setter to toolbar */}
                <BottomToolbar isSelectionMode={isSelectionMode} setIsSelectionMode={setIsSelectionMode} />
                
                <ReactFlow 
                    nodes={nodes} 
                    edges={edges} 
                    onNodesChange={onNodesChange} 
                    onEdgesChange={onEdgesChange} 
                    onConnect={onConnect} 
                    nodeTypes={nodeTypes} 
                    onDragOver={onDragOver} 
                    onDrop={onDrop} 
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }} 
                    colorMode="dark" 
                    zoomOnScroll={true} 
                    proOptions={{ hideAttribution: true }}
                    
                    // --- FORCE CURSOR STYLE ---
                    style={{ cursor: isSelectionMode ? 'default' : 'grab' }}

                    // --- LOGIC FOR SELECTION VS PAN ---
                    panOnDrag={!isSelectionMode} 
                    selectionOnDrag={isSelectionMode}
                    selectionKeyCode={null} 
                    selectionMode={SelectionMode.Partial}
                    panOnScroll={true}
                    
                    // --- EXPLICIT DELETE KEYS ---
                    deleteKeyCode={["Backspace", "Delete"]}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} bgColor="#040405" color="rgba(255, 255, 255, 0.4)" />
                </ReactFlow>
            </div>
        </div>
    );
}



export default function App() {
    return ( <ReactFlowProvider> <FlowCanvas /> </ReactFlowProvider> );
}