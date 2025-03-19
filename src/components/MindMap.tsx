"use client";

import { useState } from "react";
import { NodeData } from "../types/types";
import Node from "./Node";

interface MindMapProps {
  rootNode: NodeData;
  setRootNode: React.Dispatch<React.SetStateAction<NodeData>>;
}

const MindMap: React.FC<MindMapProps> = ({ rootNode, setRootNode }) => {
  // Function to add a new child node to a parent node
  const addNode = (parentId: string) => {
    const newNodeId = `node-${Date.now()}`;

    // Create a deep copy of the root node and add the new child
    const updatedRoot = addChildToNode(rootNode, parentId, {
      id: newNodeId,
      text: "New Topic",
      children: [],
    });

    setRootNode(updatedRoot);
  };

  // Function to delete a node from the mind map
  const deleteNode = (nodeId: string) => {
    // Don't allow deleting the root node
    if (nodeId === "root") return;

    // Create a deep copy of the root node and remove the specified node
    const updatedRoot = removeNodeFromTree(rootNode, nodeId);
    setRootNode(updatedRoot);
  };

  // Function to update the text of a node
  const updateNodeText = (nodeId: string, newText: string) => {
    // Create a deep copy of the root node and update the text
    const updatedRoot = updateNodeTextInTree(rootNode, nodeId, newText);
    setRootNode(updatedRoot);
  };

  // Helper function to recursively add a child to a node
  const addChildToNode = (node: NodeData, targetId: string, newChild: NodeData): NodeData => {
    if (node.id === targetId) {
      // Found the target node, add the new child
      return {
        ...node,
        children: [...node.children, newChild],
      };
    }

    // If not found, recursively check children
    return {
      ...node,
      children: node.children.map(child => addChildToNode(child, targetId, newChild)),
    };
  };

  // Helper function to recursively remove a node from the tree
  const removeNodeFromTree = (node: NodeData, nodeIdToRemove: string): NodeData => {
    // Filter out the node to remove from children
    const updatedChildren = node.children
      .filter(child => child.id !== nodeIdToRemove)
      .map(child => removeNodeFromTree(child, nodeIdToRemove));

    return {
      ...node,
      children: updatedChildren,
    };
  };

  // Helper function to recursively update node text
  const updateNodeTextInTree = (node: NodeData, targetId: string, newText: string): NodeData => {
    if (node.id === targetId) {
      // Found the target node, update its text
      return {
        ...node,
        text: newText,
      };
    }

    // If not found, recursively check children
    return {
      ...node,
      children: node.children.map(child => updateNodeTextInTree(child, targetId, newText)),
    };
  };

  return (
    <div className="flex justify-center items-center w-full h-full overflow-auto p-4">
      <div className="min-w-max">
        <Node
          node={rootNode}
          onAddNode={addNode}
          onDeleteNode={deleteNode}
          onUpdateNodeText={updateNodeText}
          isRoot={true}
        />
      </div>
    </div>
  );
};

export default MindMap;
