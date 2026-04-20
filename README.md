# HR Flow Designer 🚀

A high-performance, premium visual workflow editor for engineering complex employee lifecycles and recruitment automations.

## 🏗️ Architecture

Built on a modern, reactive stack designed for graph-based state management and low-latency UI interactions:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://reactjs.org/)
- **Graph Engine**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Centralized graph state with Undo/Redo/History)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Glassmorphism and micro-interactions)

## 🎨 Design Decisions

1. **Zustand over Context**: Graph-based UIs are notorious for unnecessary re-renders. Zustand was used to provide a lean, externalized state that updates the canvas without triggering heavy React component tree diffing.
2. **Registry-Based Nodes**: The application uses a strictly typed node registry. Adding a new functional node type (e.g., `SlackNotification`) only requires adding a key to the registry, making the platform exceptionally extensible.
3. **Spotlight-Style Command Bar**: Instead of burying tools in menus, we implemented a `Cmd+K` Command Palette. This uses React Flow's `Panel` API to sit natively within the canvas coordinate system.
4. **Glassmorphism & Micro-animations**: To stand out from generic admin tools, we used a heavy blur/transparency aesthetic with spring-based motion for a tactile, premium software feel.

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the designer.

## ✅ Completed Features
- **Visual Graph Engine**: Infinite canvas with custom `Start`, `Task`, `Approval`, `Automated`, and `End` nodes.
- **Auto-Layout**: Intelligent programmatic positioning of nodes using Dagre/Elk logic.
- **Spotlight Search (Cmd+K)**: Rapidly add nodes or execute system actions via keyboard.
- **Structural JSON Injection**: Drag any physical `.json` file from your desktop onto the browser to instantly reconstruct a workflow.
- **Simulation Sandbox**: A recursive execution engine that validates logical integrity and provides execution logs.
- **Interactive Walkthrough**: A multi-step, glassmorphic help card for rapid user onboarding.

## 🔮 Future Roadmap (Given more time)
- **Zod Schema Validation**: Implement strict run-time validation for imported JSON payloads to ensure data integrity.
- **Collaborative Editing**: Integrate WebSockets (Socket.io) to allow multiple recruiters to design flows simultaneously.
- **Sub-flow Nesting**: Allow complex workflows to be collapsed into "Sub-groups" for better manageable scale.
- **Persistent Backend**: Connect to Supabase or PostgreSQL for permanent workflow storage and versioning.

## 💡 A Tricky Engineering Bug: "The Input Undo Bloat"

**The Challenge**: In the early build, updating a node's title (e.g., typing "New Hire") was creating 8 separate entries in the Undo/Redo history—one for every single character typed. This effectively made the Undo feature useless for power users.

**The Solution**: I solved this by **de-coupling the visual update from the history commit**. 
- I refactored the `PropertiesPanel` to use `onChange` for silent, real-time visual syncing on the canvas. 
- I then implemented a custom `onBlur` (focus loss) or `onKeyDownEnter` trigger to "Commit" the final state to the Undo history. 

**Result**: Users can type long descriptions or complex rules, and it generates exactly **one** clean, logical history snapshot once they finish their thought. This keeps the version history precise and actually usable.

---
*Developed as a high-signal technical case study for premium HR automation platforms.*
