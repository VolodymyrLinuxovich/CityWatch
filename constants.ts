
import { SystemNode } from './types';

export const PREDEFINED_SYSTEM_NODES: SystemNode[] = [
  {
    name: "Road Network",
    variables: [
      { name: "Traffic volume (vehicles/hour)", value: 15000, unit: "veh/hr" },
      { name: "Congestion index (travel time index)", value: 1.45, unit: "ratio" },
      { name: "Accident frequency (per mile or per day)", value: 0.8, unit: "accidents/day" },
      { name: "Lane miles / network density", value: 1200, unit: "miles" }
    ]
  },
  {
    name: "Local Bus",
    variables: [
      { name: "Ridership (passengers/day)", value: 480000, unit: "passengers" },
      { name: "Load factor (% capacity)", value: 70, unit: "%" },
      { name: "Service frequency (buses/hour)", value: 20, unit: "buses/hr" },
      { name: "Average speed (km/h)", value: 20, unit: "km/h" },
      { name: "On-time performance (%)", value: 85, unit: "%" }
    ]
  },
  {
    name: "Light Rail Transit",
    variables: [
      { name: "Ridership (passengers/day)", value: 200000, unit: "passengers" },
      { name: "Load factor (% capacity)", value: 65, unit: "%" },
      { name: "Service frequency (trains/hour)", value: 12, unit: "trains/hr" },
      { name: "Average speed", value: 25, unit: "km/h" },
      { name: "On-time performance (%)", value: 88, unit: "%" }
    ]
  },
  {
    name: "Bike Share",
    variables: [
      { name: "Total trips/day", value: 5000, unit: "trips" },
      { name: "Availability rate (% of docks with bikes)", value: 92, unit: "%" },
      { name: "Average trip duration (min)", value: 18, unit: "min" },
      { name: "Coverage area (% of city area served)", value: 35, unit: "%" }
    ]
  },
  {
    name: "Power Plants",
    variables: [
      { name: "Energy generation (MWh/day)", value: 1200, unit: "MWh" },
      { name: "Capacity utilization (%)", value: 70, unit: "%" },
      { name: "Reliability / outage frequency (%)", value: 99.9, unit: "%" },
      { name: "Renewable % of total generation", value: 42, unit: "%" }
    ]
  },
  {
    name: "Water Treatment Plants",
    variables: [
      { name: "Water output (million gallons/day)", value: 180, unit: "MGD" },
      { name: "Treatment capacity utilization (%)", value: 85, unit: "%" },
      { name: "Quality metrics (contaminant levels)", value: 100, unit: "% compliant" },
      { name: "Outage / downtime (%)", value: 0.1, unit: "%" }
    ]
  },
  {
    name: "Labor Market System",
    variables: [
      { name: "Unemployment rate (%)", value: 3.2, unit: "%" },
      { name: "Job vacancy rate (%)", value: 5.5, unit: "%" },
      { name: "Average wages ($)", value: 105000, unit: "$" },
      { name: "Labor participation rate (%)", value: 68, unit: "%" }
    ]
  }
];

export const GRAPH_EDGES = [
  // Defined in prompt logic
];
