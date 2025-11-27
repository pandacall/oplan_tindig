# Big One Cell Site Impact Dashboard

Emergency telecommunications infrastructure monitoring dashboard for Big One earthquake preparedness in Metro Manila, Philippines.

## 🎯 Purpose

Visualize cell site vulnerability to the West Valley Fault, enabling emergency response teams to:
- Identify high-risk telecommunications infrastructure
- Assess potential service disruptions during Big One earthquake
- Plan emergency response and recovery strategies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5173`

## 📋 Implementation Status

**Phase 1: Setup Complete** ✅ (Tasks T001-T008)  
**Phase 2: Foundational Complete** ✅ (Tasks T009-T014)

### Completed Features:
- ✅ Project configuration (package.json, vite.config.js, tailwind.config.js)
- ✅ React app structure with state management
- ✅ 6 components (TopNav, FilterControls, Map, StatsPanel, CSVUploader, CellSitePopup)
- ✅ 3 utility files with full functionality
- ✅ Sample data (45 cell sites, West Valley Fault GeoJSON)
- ✅ **Risk calculation based on fault line distance** (Haversine formula)
- ✅ **LocalStorage persistence** for data caching
- ✅ **Risk zone visualization** (5km and 15km circles)
- ✅ **Clear cache functionality**
- ✅ **Loading states and error handling**
- ✅ **Filter results counter**
- ✅ **Docker deployment ready** (Dockerfile, nginx.conf, cloudbuild.yaml)

### Next Steps: MVP Enhancement

Follow the task breakdown in `C:\Users\PCUser\specs\001-cell-site-dashboard\tasks.md`

**Priority: MVP Enhancement** 
- ✅ Phase 1: Setup (8 tasks) - COMPLETE
- ✅ Phase 2: Foundational (6 tasks) - COMPLETE  
- Phase 3: User Story 1 MVP (T015-T027) - 13 tasks - IN PROGRESS
- Remaining: Phases 4-9 (45 tasks)

**Timeline**: MVP baseline complete, enhancing visualization and UX

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (dark mode support)
- **Mapping**: Leaflet.js + react-leaflet + react-leaflet-cluster
- **Data**: PapaParse (CSV parsing), LocalStorage (persistence)
- **Deployment**: Docker + Google Cloud Run

## 📁 Project Structure

```
big-one-dashboard/
├── public/
│   ├── sample-cellsites.csv       # 45 sample cell sites with risk levels
│   └── fault-line.geojson          # West Valley Fault coordinates
├── src/
│   ├── components/
│   │   ├── TopNav.jsx              # Navigation bar with theme toggle
│   │   ├── FilterControls.jsx     # City/Status/Provider/Risk filters
│   │   ├── Map.jsx                 # Leaflet map with markers & clustering
│   │   ├── StatsPanel.jsx          # Statistics sidebar
│   │   ├── CSVUploader.jsx         # File upload component
│   │   └── CellSitePopup.jsx       # Marker popup content
│   ├── utils/
│   │   ├── csvParser.js            # PapaParse CSV processing
│   │   ├── filterLogic.js          # Filter application (AND logic)
│   │   └── geoCalculations.js      # Haversine distance, risk level calculations
│   ├── App.jsx                     # Main app with state management
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind + Leaflet styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Features (Planned)

### User Story 1: Interactive Map Visualization (P1 - MVP)
- Leaflet.js map with OpenStreetMap tiles
- West Valley Fault line overlay (red)
- Cell site markers (color-coded by status)
- Automatic marker clustering
- Risk zones visualization

### User Story 2: Advanced Filtering (P2)
- Filter by city, status, provider, risk level
- Real-time filter application with AND logic
- Clear filters button

### User Story 3: Real-Time Statistics (P2)
- Total cell sites count
- Operational vs non-operational breakdown
- Risk distribution (high/medium/low)
- Responsive stats panel (drawer on mobile)

### User Story 4: Detailed Site Information (P3)
- Click marker to view site details
- Site ID, provider, city, coordinates
- Status and risk level indicators

### User Story 5: CSV Data Upload (P3)
- Upload custom cell site data
- PapaParse CSV processing
- LocalStorage persistence
- Data validation

## 🔧 Development Commands

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Sample Data Format

CSV columns: `siteId,provider,city,latitude,longitude,status,address,riskLevel`

Example:
```csv
SITE-001,Globe,Quezon City,14.6760,121.0437,operational,"Commonwealth Avenue",high
SITE-002,Smart,Makati,14.5547,121.0244,operational,"Ayala Avenue",medium
```

## 🌍 Risk Level Calculation

- **High Risk**: < 5km from fault line (red)
- **Medium Risk**: 5-15km from fault line (yellow)
- **Low Risk**: > 15km from fault line (green)

## 📚 Documentation

- **Feature Specification**: `C:\Users\PCUser\specs\001-cell-site-dashboard\spec.md`
- **Task Breakdown**: `C:\Users\PCUser\specs\001-cell-site-dashboard\tasks.md`
- **Constitution**: `C:\Users\PCUser\FaultLine_Ops\.specify\memory\constitution.md`

## 🎯 Constitutional Principles

1. **Instant Usability** - Zero training required, visual information at a glance
2. **Data Integrity** - Precise coordinates from authoritative sources (PHIVOLCS)
3. **Mobile-First** - Touch-optimized, works on field devices
4. **Maintainability** - Single-person operation, YAGNI principle
5. **Performance** - <3s load on 4G, <100ms interactions

## 🚢 Deployment (Planned)

Target: Google Cloud Run
- Docker containerization
- Serverless auto-scaling
- Support for 10K+ concurrent users

## 📝 License

Internal emergency response tool - See organization policies.

## 🆘 Support

For implementation questions, refer to:
- Task breakdown: `tasks.md` (72 tasks across 9 phases)
- Specification: `spec.md` (3 user stories, 46 functional requirements)
- Constitution: `constitution.md` (5 core principles)
