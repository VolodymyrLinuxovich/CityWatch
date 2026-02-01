
import React from 'react';
import { ImpactEntry, ImpactDirection } from '../types';

interface ResultCardProps {
  nodeName: string;
  impacts: ImpactEntry[];
}

const DirectionBadge: React.FC<{ direction: ImpactDirection }> = ({ direction }) => {
  const styles = {
    'Increase': 'bg-green-100 text-green-700 border-green-200',
    'Decrease': 'bg-red-100 text-red-700 border-red-200',
    'Ambiguous': 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  const icons = {
    'Increase': '↑',
    'Decrease': '↓',
    'Ambiguous': '?'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border shadow-sm uppercase tracking-wider ${styles[direction]}`}>
      <span className="mr-1">{icons[direction]}</span>
      {direction}
    </span>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ nodeName, impacts }) => {
  const renderValue = (val: number | null, unit: string = "") => {
    if (val === null) return <span className="text-[10px] italic text-gray-400">Not quantifiable</span>;
    return <span className="font-bold">{val.toLocaleString()}{unit}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:border-indigo-300 transition-colors">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{nodeName}</h3>
      </div>
      <div className="p-6 space-y-12 flex-grow">
        {impacts.map((impact, idx) => (
          <div key={idx} className="space-y-4 group last:border-0 border-b border-gray-100 pb-10 last:pb-0">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-bold text-gray-800 leading-tight flex-1 mr-4">
                {impact.state_variable}
              </h4>
              <DirectionBadge direction={impact.direction} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Baseline</p>
                <p className="text-xs font-medium text-gray-700 truncate">{impact.baselineValue.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Post-Policy</p>
                <p className="text-xs font-bold text-indigo-900 leading-tight">{renderValue(impact.postPolicyValue)}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Change %</p>
                <div className={`text-xs font-black leading-tight ${impact.changePercent === null ? 'text-gray-400' : (impact.direction === 'Decrease' ? 'text-red-600' : 'text-green-600')}`}>
                  {renderValue(impact.changePercent, "%")}
                </div>
              </div>
            </div>

            <div className="bg-indigo-600/5 p-3 rounded-lg border border-indigo-600/10">
              <p className="text-xs text-indigo-900 font-semibold leading-relaxed">
                {impact.interpretation}
              </p>
            </div>

            {impact.evidence_quote && (
              <div className="bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Verbatim Quote</p>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{impact.evidence_quote}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultCard;
