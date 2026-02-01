
import React, { useState, useEffect, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import GraphView from './components/GraphView';
import { analyzePolicyDocument } from './services/geminiService';
import { AnalysisResult, ImpactEntry } from './types';

const LOADING_MESSAGES = [
  "Reading policy text...",
  "Identifying direct impacts...",
  "Building city infrastructure graph...",
  "Running system propagation iterations...",
  "Calculating cascading effects..."
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileSelect = async (file: File, base64: string) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    try {
      const analysis = await analyzePolicyDocument(base64, file.type);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setFileName(null);
  };

  const affectedNodes = useMemo(() => {
    if (!result) return [];
    return Array.from(new Set([...result.directImpacts, ...result.propagatedImpacts].map(i => i.node)));
  }, [result]);

  const groupedDirect = useMemo(() => {
    if (!result) return {};
    return result.directImpacts.reduce((acc, impact) => {
      if (!acc[impact.node]) acc[impact.node] = [];
      acc[impact.node].push(impact);
      return acc;
    }, {} as Record<string, ImpactEntry[]>);
  }, [result]);

  const groupedPropagated = useMemo(() => {
    if (!result) return {};
    return result.propagatedImpacts.reduce((acc, impact) => {
      if (!acc[impact.node]) acc[impact.node] = [];
      acc[impact.node].push(impact);
      return acc;
    }, {} as Record<string, ImpactEntry[]>);
  }, [result]);

  return (
    <div className="min-h-screen pb-24 bg-gray-50/50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">C</div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">CITYWATCH</h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Urban Simulation v2.0</span>
            </div>
          </div>
          {result && (
            <div className="flex items-center space-x-6">
               <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Active Simulation</p>
                <p className="text-sm font-bold truncate max-w-[200px] text-slate-700">{fileName}</p>
              </div>
              <button onClick={reset} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all">
                New Analysis
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {!result && !isLoading && (
          <div className="max-w-3xl mx-auto text-center py-20 animate-in fade-in duration-700">
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
              Analyze Policy Impact Across <br/> The City System.
            </h2>
            <p className="text-lg text-gray-500 mb-12 font-medium">
              Upload a policy document to calculate impacts and propagate effects through San Francisco's urban graph.
            </p>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        )}

        {isLoading && (
          <div className="max-w-xl mx-auto py-32 text-center">
            <div className="mb-8 flex justify-center space-x-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>
              ))}
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">{LOADING_MESSAGES[loadingMsgIdx]}</p>
            <p className="text-sm text-gray-400 font-medium">Running iterative system dynamics iterations...</p>
          </div>
        )}

        {result && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <GraphView affectedNodes={affectedNodes} />

            <section>
              <div className="flex items-baseline space-x-4 mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Direct Policy Impacts</h2>
                <div className="h-1 flex-grow bg-gray-100 rounded-full"></div>
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Iteration 0</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(groupedDirect).map(([node, impacts]) => (
                  <ResultCard key={node} nodeName={node} impacts={impacts} />
                ))}
              </div>
            </section>

            <section className="bg-gray-100/50 -mx-6 px-6 py-16 border-y border-gray-100">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-baseline space-x-4 mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Cascaded System Effects</h2>
                  <div className="h-1 flex-grow bg-indigo-100 rounded-full"></div>
                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Iteration 2</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.entries(groupedPropagated).map(([node, impacts]) => (
                    <ResultCard key={node} nodeName={node} impacts={impacts} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      
      {/* Aesthetic Dot Matrix Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <svg width="100%" height="100%"><pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="black" /></pattern><rect width="100%" height="100%" fill="url(#dots)" /></svg>
      </div>
    </div>
  );
};

export default App;
