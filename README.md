# CityWatch

CityWatch is an AI-powered urban policy impact simulator that analyzes a policy document, extracts direct effects with Gemini, and propagates those effects through a predefined city infrastructure graph to estimate cascading system-wide outcomes.

The project is built as a React + TypeScript + Vite application and currently models a San Francisco-style city system with transportation, utilities, and labor-market components.

## Why this project matters

Urban policy decisions rarely affect just one subsystem. A transportation rule can change road traffic, which can influence buses, rail, bike-share usage, labor mobility, and even infrastructure reliability. CityWatch is designed to make those interactions easier to inspect by combining:

- document-level policy analysis,
- structured impact extraction,
- baseline city-system variables,
- iterative propagation across connected systems.

## What CityWatch does

CityWatch takes a policy document as input and produces two layers of results:

### 1. Direct policy impacts
These are the effects explicitly supported by evidence in the uploaded document. The Gemini model extracts structured impacts for predefined nodes and variables, including:

- affected node,
- affected state variable,
- direction of change,
- baseline value,
- post-policy value when available,
- absolute and percentage change,
- evidence quote,
- justification,
- interpretation.

### 2. Cascaded system effects
After the direct impacts are identified, CityWatch runs propagation logic over a predefined urban graph. This estimates secondary effects across the rest of the system through iterative update formulas.

The UI separates these into:

- **Direct Policy Impacts** (Iteration 0)
- **Cascaded System Effects** (Iteration 2)

## Current modeled system

The current version includes predefined baseline variables for the following urban subsystems:

- Road Network
- Local Bus
- Light Rail Transit
- Bike Share
- Power Plants
- Water Treatment Plants
- Labor Market System

Each node has baseline metrics such as ridership, congestion, outage rates, generation capacity, unemployment, wages, and other operational indicators.

## How it works

### Step 1: Upload a policy document
The user uploads a policy document through the frontend.

### Step 2: Gemini extracts direct impacts
The app sends the document to Gemini together with the predefined system nodes and variable baselines. The model is asked to return structured JSON describing only supported direct effects.

### Step 3: Baselines are reconciled
Extracted impacts are matched back to the predefined system constants so the application uses canonical baseline values.

### Step 4: System propagation runs
The app initializes a normalized state for every modeled variable and injects the direct policy changes. It then runs propagation formulas across the city system for two iterations.

### Step 5: Results are visualized
The frontend groups results by node and displays:

- direct impacts,
- propagated impacts,
- affected nodes,
- graph-based system visualization.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **AI layer:** Google Gemini via `@google/genai`
- **State & rendering:** React hooks and component-based UI
- **Modeling approach:** predefined baselines + iterative propagation formulas

## Project structure

```text
CityWatch/
├── components/           # UI components such as file upload, result cards, graph view
├── services/
│   └── geminiService.ts  # Gemini call + propagation engine
├── App.tsx               # Main application flow and UI orchestration
├── constants.ts          # Predefined system nodes and baseline variables
├── types.ts              # Shared TypeScript interfaces
├── index.tsx             # App entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Local setup

### Prerequisites

- Node.js
- npm
- a Gemini API key

### Installation

```bash
npm install
```

### Environment variable

Create a local environment file:

```bash
.env.local
```

Add:

```env
API_KEY=your_gemini_api_key_here
```

> Note: the current code reads `process.env.API_KEY`.

### Run the app

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Output schema

The application works with structured impact entries of the form:

```ts
{
  node: string;
  state_variable: string;
  direction: 'Increase' | 'Decrease' | 'Ambiguous';
  baselineValue: number;
  postPolicyValue: number | null;
  absDifference: number | null;
  changePercent: number | null;
  evidence_quote?: string;
  justification: string;
  interpretation: string;
  isPropagated?: boolean;
}
```

## Current propagation logic

The current propagation engine is deterministic and formula-based. It starts from direct policy changes, converts them into normalized multipliers, and updates downstream subsystems over two iterations.

At the moment, propagation formulas are defined for relationships affecting:

- Local Bus
- Light Rail Transit
- Bike Share

These formulas depend on values from:

- Road Network
- Water Treatment Plants
- Power Plants
- Labor Market System

This makes the current version a strong prototype for system-level policy simulation, while still leaving room for more realistic network topology, learned weights, uncertainty estimates, and temporal modeling.

## Strengths of the current prototype

- Clear separation between direct and propagated effects
- Structured AI extraction instead of free-form text summaries
- Baseline-aware system modeling
- Transparent deterministic propagation layer
- Clean frontend for policy-to-system analysis workflow

## Limitations

- The city graph is predefined rather than dynamically learned
- Propagation currently runs for only two iterations
- The model depends on a fixed set of nodes and variables
- Graph edges are declared conceptually, while much of the dependency structure lives directly in propagation formulas
- Accuracy depends on both document quality and Gemini extraction quality

## Ideas for next versions

- Add more urban subsystems such as emergency response, housing, policing, healthcare, and freight
- Replace hand-written propagation rules with weighted graph inference or causal modeling
- Add uncertainty intervals and confidence scores
- Support scenario comparison across multiple policies
- Add timeline simulation instead of fixed iteration depth
- Export reports or dashboards for decision-makers

## Use cases

CityWatch can be extended for:

- municipal policy review,
- transportation planning,
- utility resilience analysis,
- what-if scenario exploration,
- civic-tech demonstrations,
- AI-assisted public policy research.

## Acknowledgment

This project combines LLM-based document understanding with graph-inspired systems thinking for urban policy analysis.

---

If you want, I can also make a second version that sounds more hackathon-style and more investor-style for GitHub.
