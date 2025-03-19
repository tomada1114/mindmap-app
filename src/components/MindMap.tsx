"use client";

import { NodeData } from "../types/types";
import Node from "./Node";

/**
 * MindMapコンポーネントのプロパティの型定義
 * @property rootNode - マインドマップのルートノードデータ
 * @property setRootNode - ルートノードを更新するための関数
 */
interface MindMapProps {
  rootNode: NodeData;
  setRootNode: React.Dispatch<React.SetStateAction<NodeData>>;
}

/**
 * マインドマップを表示・操作するためのコンポーネント
 * このコンポーネントはマインドマップの全体的な構造と操作ロジックを管理します
 */
const MindMap: React.FC<MindMapProps> = ({ rootNode, setRootNode }) => {
  /**
   * 新しい子ノードを親ノードに追加する関数
   * @param parentId - 親ノードのID
   */
  const addNode = (parentId: string) => {
    // タイムスタンプを使用してユニークなIDを生成
    const newNodeId = `node-${Date.now()}`;

    // ルートノードのディープコピーを作成し、新しい子ノードを追加
    const updatedRoot = addChildToNode(rootNode, parentId, {
      id: newNodeId,
      text: "New Topic", // 新しいノードのデフォルトテキスト
      children: [], // 初期状態では子ノードは空
    });

    // 更新されたルートノードで状態を更新
    // これによりUIが再レンダリングされ、変更が反映される
    setRootNode(updatedRoot);
  };

  /**
   * マインドマップからノードを削除する関数
   * @param nodeId - 削除するノードのID
   */
  const deleteNode = (nodeId: string) => {
    // ルートノードの削除は許可しない（マインドマップの基点が失われるため）
    if (nodeId === "root") return;

    // ルートノードのディープコピーを作成し、指定されたノードを削除
    const updatedRoot = removeNodeFromTree(rootNode, nodeId);
    // 更新されたルートノードで状態を更新
    setRootNode(updatedRoot);
  };

  /**
   * ノードのテキストを更新する関数
   * @param nodeId - 更新するノードのID
   * @param newText - 新しいテキスト内容
   */
  const updateNodeText = (nodeId: string, newText: string) => {
    // ルートノードのディープコピーを作成し、テキストを更新
    const updatedRoot = updateNodeTextInTree(rootNode, nodeId, newText);
    // 更新されたルートノードで状態を更新
    setRootNode(updatedRoot);
  };

  /**
   * 再帰的に子ノードを追加するヘルパー関数
   * ツリー構造を維持しながら特定のノードに子ノードを追加します
   *
   * @param node - 現在処理中のノード
   * @param targetId - 子ノードを追加する対象ノードのID
   * @param newChild - 追加する新しい子ノード
   * @returns 更新されたノード構造
   */
  const addChildToNode = (node: NodeData, targetId: string, newChild: NodeData): NodeData => {
    if (node.id === targetId) {
      // 対象ノードが見つかった場合、新しい子ノードを追加
      return {
        ...node, // 既存のノードプロパティをコピー
        children: [...node.children, newChild], // 既存の子ノード配列に新しい子ノードを追加
      };
    }

    // 対象ノードが見つからない場合、子ノードを再帰的に検索
    return {
      ...node, // 既存のノードプロパティをコピー
      // 各子ノードに対して再帰的に処理を適用
      children: node.children.map(child => addChildToNode(child, targetId, newChild)),
    };
  };

  /**
   * 再帰的にツリーからノードを削除するヘルパー関数
   * 指定されたIDを持つノードをツリー構造から削除します
   *
   * @param node - 現在処理中のノード
   * @param nodeIdToRemove - 削除するノードのID
   * @returns 更新されたノード構造
   */
  const removeNodeFromTree = (node: NodeData, nodeIdToRemove: string): NodeData => {
    // 子ノードから削除対象のノードをフィルタリングし、残りのノードに対して再帰的に処理を適用
    const updatedChildren = node.children
      // 削除対象のIDを持つ子ノードを除外
      .filter(child => child.id !== nodeIdToRemove)
      // 残りの各子ノードに対して再帰的に処理を適用（孫ノード以下の削除対象も処理するため）
      .map(child => removeNodeFromTree(child, nodeIdToRemove));

    // 更新された子ノード配列を持つ新しいノードを返す
    return {
      ...node, // 既存のノードプロパティをコピー
      children: updatedChildren, // 更新された子ノード配列
    };
  };

  /**
   * 再帰的にノードテキストを更新するヘルパー関数
   * 指定されたIDを持つノードのテキストを更新します
   *
   * @param node - 現在処理中のノード
   * @param targetId - テキストを更新する対象ノードのID
   * @param newText - 新しいテキスト内容
   * @returns 更新されたノード構造
   */
  const updateNodeTextInTree = (node: NodeData, targetId: string, newText: string): NodeData => {
    if (node.id === targetId) {
      // 対象ノードが見つかった場合、テキストを更新
      return {
        ...node, // 既存のノードプロパティをコピー
        text: newText, // テキストを新しい値で更新
      };
    }

    // 対象ノードが見つからない場合、子ノードを再帰的に検索
    return {
      ...node, // 既存のノードプロパティをコピー
      // 各子ノードに対して再帰的に処理を適用
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
