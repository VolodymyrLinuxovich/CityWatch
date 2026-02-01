
import { GoogleGenAI, Type } from "@google/genai";
import { PREDEFINED_SYSTEM_NODES } from "../constants";
import { AnalysisResult, ImpactEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const schema = {
  type: Type.OBJECT,
  properties: {
    impacts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          node: { type: Type.STRING },
          state_variable: { type: Type.STRING },
          direction: { type: Type.STRING },
          baselineValue: { type: Type.NUMBER },
          postPolicyValue: { type: Type.NUMBER, nullable: true },
          absDifference: { type: Type.NUMBER, nullable: true },
          changePercent: { type: Type.NUMBER, nullable: true },
          evidence_quote: { type: Type.STRING },
          justification: { type: Type.STRING },
          interpretation: { type: Type.STRING }
        },
        required: ["node", "state_variable", "direction", "baselineValue", "evidence_quote", "justification", "interpretation"]
      }
    }
  },
  required: ["impacts"]
};

const propagateImpacts = (directImpacts: ImpactEntry[]): ImpactEntry[] => {
  const state: Record<string, Record<string, number>> = {};
  
  PREDEFINED_SYSTEM_NODES.forEach(node => {
    state[node.name] = {};
    node.variables.forEach(v => {
      state[node.name][v.name] = 1.0; 
    });
  });

  directImpacts.forEach(imp => {
    if (imp.changePercent !== null) {
      state[imp.node][imp.state_variable] = 1 + (imp.changePercent / 100);
    }
  });

  for (let i = 0; i < 2; i++) {
    const nextState = JSON.parse(JSON.stringify(state));

    // LOCAL BUS FORMULAS
    nextState["Local Bus"]["Ridership (passengers/day)"] = 
      0.3 * state["Road Network"]["Traffic volume (vehicles/hour)"] +
      0.1 * state["Water Treatment Plants"]["Outage / downtime (%)"] +
      0.25 * state["Labor Market System"]["Unemployment rate (%)"] +
      0.05 * state["Power Plants"]["Renewable % of total generation"];

    nextState["Local Bus"]["Load factor (% capacity)"] = 
      0.6 * state["Road Network"]["Congestion index (travel time index)"] +
      0.4 * state["Labor Market System"]["Job vacancy rate (%)"];

    nextState["Local Bus"]["Service frequency (buses/hour)"] = 
      0.25 * state["Road Network"]["Accident frequency (per mile or per day)"] +
      0.25 * state["Water Treatment Plants"]["Water output (million gallons/day)"] +
      0.25 * state["Labor Market System"]["Average wages ($)"] +
      0.25 * state["Power Plants"]["Energy generation (MWh/day)"];

    nextState["Local Bus"]["Average speed (km/h)"] = 
      0.4 * state["Road Network"]["Lane miles / network density"] +
      0.3 * state["Water Treatment Plants"]["Treatment capacity utilization (%)"] +
      0.3 * state["Power Plants"]["Capacity utilization (%)"];

    nextState["Local Bus"]["On-time performance (%)"] = 
      0.4 * state["Water Treatment Plants"]["Quality metrics (contaminant levels)"] +
      0.35 * state["Power Plants"]["Reliability / outage frequency (%)"] +
      0.25 * state["Labor Market System"]["Labor participation rate (%)"];

    // LRT FORMULAS
    nextState["Light Rail Transit"]["Ridership (passengers/day)"] = 
      0.3 * state["Road Network"]["Traffic volume (vehicles/hour)"] +
      0.1 * state["Water Treatment Plants"]["Outage / downtime (%)"] +
      0.25 * state["Labor Market System"]["Unemployment rate (%)"] +
      0.05 * state["Power Plants"]["Renewable % of total generation"];

    nextState["Light Rail Transit"]["Load factor (% capacity)"] = 
      0.6 * state["Road Network"]["Congestion index (travel time index)"] +
      0.4 * state["Labor Market System"]["Job vacancy rate (%)"];

    nextState["Light Rail Transit"]["Service frequency (trains/hour)"] = 
      0.25 * state["Road Network"]["Accident frequency (per mile or per day)"] +
      0.25 * state["Water Treatment Plants"]["Water output (million gallons/day)"] +
      0.25 * state["Labor Market System"]["Average wages ($)"] +
      0.25 * state["Power Plants"]["Energy generation (MWh/day)"];

    nextState["Light Rail Transit"]["Average speed"] = 
      0.4 * state["Road Network"]["Lane miles / network density"] +
      0.3 * state["Water Treatment Plants"]["Treatment capacity utilization (%)"] +
      0.3 * state["Power Plants"]["Capacity utilization (%)"];

    nextState["Light Rail Transit"]["On-time performance (%)"] = 
      0.4 * state["Water Treatment Plants"]["Quality metrics (contaminant levels)"] +
      0.35 * state["Power Plants"]["Reliability / outage frequency (%)"] +
      0.25 * state["Labor Market System"]["Labor participation rate (%)"];

    // BIKE SHARE FORMULAS
    nextState["Bike Share"]["Total trips/day"] = 
       0.5 * state["Road Network"]["Traffic volume (vehicles/hour)"] +
       0.5 * state["Road Network"]["Lane miles / network density"];

    nextState["Bike Share"]["Availability rate (% of docks with bikes)"] = 
       1.0 * state["Road Network"]["Lane miles / network density"];

    nextState["Bike Share"]["Average trip duration (min)"] = 
       1.0 * state["Road Network"]["Traffic volume (vehicles/hour)"];

    nextState["Bike Share"]["Coverage area (% of city area served)"] = 
       1.0 * state["Road Network"]["Lane miles / network density"];

    Object.assign(state, nextState);
  }

  const results: ImpactEntry[] = [];
  PREDEFINED_SYSTEM_NODES.forEach(node => {
    node.variables.forEach(v => {
      const finalMultiplier = state[node.name][v.name];
      const changePercent = (finalMultiplier - 1) * 100;
      const isDirect = directImpacts.some(d => d.node === node.name && d.state_variable === v.name);
      
      if (Math.abs(changePercent) > 0.01 && !isDirect) {
        results.push({
          node: node.name,
          state_variable: v.name,
          direction: changePercent > 0 ? "Increase" : "Decrease",
          baselineValue: v.value,
          postPolicyValue: finalMultiplier * v.value,
          absDifference: (finalMultiplier * v.value) - v.value,
          changePercent: changePercent,
          justification: `Propagated system effect.`,
          interpretation: `Calculated from city graph dynamics.`,
          isPropagated: true
        });
      }
    });
  });

  return results;
};

export const analyzePolicyDocument = async (fileBase64: string, mimeType: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-pro-preview';
  const systemNodesText = PREDEFINED_SYSTEM_NODES.map(node => 
    `Node: ${node.name}\nVariables: ${node.variables.map(v => `${v.name} (Baseline: ${v.value} ${v.unit})`).join(', ')}`
  ).join("\n\n");
  
  const prompt = `Identify direct policy impacts for: CityWatch Simulation.\nSystem Nodes and their current baseline variables:\n${systemNodesText}\nOnly record impacts supported by text evidence. Use the exact baseline values provided for each variable.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ inlineData: { data: fileBase64, mimeType: mimeType } }, { text: prompt }] },
      config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0 }
    });
    
    const rawData = JSON.parse(response.text || '{"impacts": []}');
    
    // Ensure extracted baseline values match the constants to fix the "baseline is 0" issue
    const directImpacts: ImpactEntry[] = rawData.impacts.map((imp: any) => {
      const node = PREDEFINED_SYSTEM_NODES.find(n => n.name === imp.node);
      const variable = node?.variables.find(v => v.name === imp.state_variable);
      return {
        ...imp,
        baselineValue: variable?.value ?? imp.baselineValue ?? 0
      };
    });

    const propagatedImpacts = propagateImpacts(directImpacts);
    return { directImpacts, propagatedImpacts };
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Simulation analysis failed.");
  }
};
