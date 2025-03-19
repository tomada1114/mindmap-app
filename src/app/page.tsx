"use client";

import { useState } from "react";
import MindMap from "../components/MindMap";
import { NodeData } from "../types/types";

export default function Home() {
  // Initial mind map data with a root node
  const [rootNode, setRootNode] = useState<NodeData>({
    id: "root",
    text: "Main Topic",
    children: [],
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <header className="w-full max-w-4xl py-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mind Map App</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Hover over nodes to add branches, click on nodes to edit, and use the delete button to remove branches.
        </p>
      </header>

      <main className="flex-1 w-full max-w-6xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[600px] flex items-center justify-center">
          <MindMap rootNode={rootNode} setRootNode={setRootNode} />
        </div>
      </main>

      <footer className="w-full max-w-4xl py-6 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Built with Next.js and React
      </footer>
    </div>
  );
}
