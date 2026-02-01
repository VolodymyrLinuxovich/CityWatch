
export type ImpactDirection = 'Increase' | 'Decrease' | 'Ambiguous';

export interface ImpactEntry {
  node: string;
  state_variable: string;
  direction: ImpactDirection;
  baselineValue: number;
  postPolicyValue: number | null;
  absDifference: number | null;
  changePercent: number | null;
  evidence_quote?: string;
  justification: string;
  interpretation: string;
  isPropagated?: boolean;
}

export interface AnalysisResult {
  directImpacts: ImpactEntry[];
  propagatedImpacts: ImpactEntry[];
}

export interface VariableBaseline {
  name: string;
  value: number;
  unit: string;
}

export interface SystemNode {
  name: string;
  variables: VariableBaseline[];
}
