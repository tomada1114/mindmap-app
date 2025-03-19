"use client";

import { useState, useRef } from "react";
import { NodeData } from "../types/types";

interface NodeProps {
  node: NodeData;
  onAddNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNodeText: (nodeId: string, newText: string) => void;
  isRoot?: boolean;
}

const Node: React.FC<NodeProps> = ({
  node,
  onAddNode,
  onDeleteNode,
  onUpdateNodeText,
  isRoot = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeText, setNodeText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle mouse enter event
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Handle mouse leave event
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Handle node click to edit
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  };

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeText(e.target.value);
  };

  // Handle text input blur (finish editing)
  const handleInputBlur = () => {
    setIsEditing(false);
    if (nodeText.trim() !== "") {
      onUpdateNodeText(node.id, nodeText);
    } else {
      // If empty, revert to original text
      setNodeText(node.text);
    }
  };

  // Handle key press in text input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setNodeText(node.text);
    }
  };

  // Handle add button click
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddNode(node.id);
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNode(node.id);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center p-3 mb-2 rounded-lg transition-all duration-200 ${
          isRoot
            ? "bg-blue-100 dark:bg-blue-900 min-w-[140px]"
            : "bg-gray-100 dark:bg-gray-700 min-w-[120px]"
        } ${isHovered ? "shadow-lg transform scale-105" : "shadow-md"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleNodeClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={nodeText}
            onChange={handleTextChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-center"
            autoFocus
          />
        ) : (
          <span className="text-center font-medium">{node.text}</span>
        )}

        {/* Controls - always visible when not editing */}
        {!isEditing && (
          <div className="absolute flex space-x-1 -top-3 -right-3">
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center w-6 h-6 text-xs bg-green-500 text-white rounded-full shadow-sm hover:bg-green-600 transition-colors"
              title="Add branch"
            >
              +
            </button>
            {!isRoot && (
              <button
                onClick={handleDeleteClick}
                className="flex items-center justify-center w-6 h-6 text-xs bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                title="Delete node"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children nodes */}
      {node.children.length > 0 && (
        <div className="relative pt-6 mt-2">
          {/* Vertical connector line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>

          <div className="flex flex-wrap justify-center gap-8">
            {node.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Horizontal connector line */}
                <div className="absolute top-0 left-1/2 w-8 h-0.5 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2 -translate-y-3"></div>
                <Node
                  node={child}
                  onAddNode={onAddNode}
                  onDeleteNode={onDeleteNode}
                  onUpdateNodeText={onUpdateNodeText}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Node;
