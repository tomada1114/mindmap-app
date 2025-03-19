"use client";

import { useState, useRef } from "react";
import { NodeData } from "../types/types";

/**
 * Nodeコンポーネントのプロパティの型定義
 * @property node - 表示するノードのデータ
 * @property onAddNode - 新しいノードを追加する際に呼び出される関数
 * @property onDeleteNode - ノードを削除する際に呼び出される関数
 * @property onUpdateNodeText - ノードのテキストを更新する際に呼び出される関数
 * @property isRoot - ルートノードかどうかを示すフラグ（オプション）
 */
interface NodeProps {
  node: NodeData;
  onAddNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNodeText: (nodeId: string, newText: string) => void;
  isRoot?: boolean;
}

/**
 * マインドマップの各ノードを表示するコンポーネント
 * このコンポーネントは個々のノードの表示と、ノードに対するユーザー操作を処理します
 */
const Node: React.FC<NodeProps> = ({
  node,
  onAddNode,
  onDeleteNode,
  onUpdateNodeText,
  isRoot = false,
}) => {
  // ノードがホバーされているかどうかの状態
  const [isHovered, setIsHovered] = useState(false);
  // ノードが編集モードかどうかの状態
  const [isEditing, setIsEditing] = useState(false);
  // ノードのテキスト内容の状態（編集中のテキストを保持）
  const [nodeText, setNodeText] = useState(node.text);
  // 編集用入力フィールドへの参照
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * マウスがノード上に入った時のイベントハンドラ
   * ホバー状態をtrueに設定し、UIの見た目を変更します
   */
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  /**
   * マウスがノードから出た時のイベントハンドラ
   * ホバー状態をfalseに設定し、UIを元の状態に戻します
   */
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  /**
   * ノードがクリックされた時のイベントハンドラ
   * 編集モードを開始し、テキスト入力フィールドにフォーカスします
   * @param e - Reactのマウスイベント
   */
  const handleNodeClick = (e: React.MouseEvent) => {
    // イベントの伝播を停止（親要素へのクリックイベントの伝達を防ぐ）
    e.stopPropagation();
    if (!isEditing) {
      // 編集モードをオンにする
      setIsEditing(true);
      // 入力フィールドが描画された後にフォーカスを当てる（小さな遅延を設定）
      setTimeout(() => {
        // 入力フィールドにフォーカスを当て、テキストを選択状態にする
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  };

  /**
   * テキスト入力の変更を処理するハンドラ
   * ユーザーが入力フィールドに入力するたびに呼び出されます
   * @param e - 入力変更イベント
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 入力された新しいテキストで状態を更新
    setNodeText(e.target.value);
  };

  /**
   * 入力フィールドからフォーカスが外れた時のハンドラ
   * 編集を完了し、変更を保存します
   */
  const handleInputBlur = () => {
    // 編集モードを終了
    setIsEditing(false);
    // 入力が空でない場合のみ更新を適用
    if (nodeText.trim() !== "") {
      // 親コンポーネントから渡された更新関数を呼び出し
      onUpdateNodeText(node.id, nodeText);
    } else {
      // 空の場合は元のテキストに戻す
      setNodeText(node.text);
    }
  };

  /**
   * 入力フィールドでのキー押下を処理するハンドラ
   * Enterキーで編集を確定、Escapeキーで編集をキャンセルします
   * @param e - キーボードイベント
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Enterキーが押された場合、編集を確定
      handleInputBlur();
    } else if (e.key === "Escape") {
      // Escapeキーが押された場合、編集をキャンセルして元の値に戻す
      setIsEditing(false);
      setNodeText(node.text);
    }
  };

  /**
   * 追加ボタンがクリックされた時のハンドラ
   * 現在のノードに新しい子ノードを追加します
   * @param e - マウスイベント
   */
  const handleAddClick = (e: React.MouseEvent) => {
    // イベントの伝播を停止（親要素へのクリックイベントの伝達を防ぐ）
    e.stopPropagation();
    // 親コンポーネントから渡された追加関数を呼び出し
    onAddNode(node.id);
  };

  /**
   * 削除ボタンがクリックされた時のハンドラ
   * 現在のノードを削除します
   * @param e - マウスイベント
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    // イベントの伝播を停止（親要素へのクリックイベントの伝達を防ぐ）
    e.stopPropagation();
    // 親コンポーネントから渡された削除関数を呼び出し
    onDeleteNode(node.id);
  };

  return (
    <div className="flex flex-col items-center">
      {/* ノード本体 - ホバー状態や編集状態に応じてスタイルが変化 */}
      <div
        className={`relative flex items-center justify-center p-3 mb-2 rounded-lg transition-all duration-200 ${
          isRoot
            ? "bg-blue-100 dark:bg-blue-900 min-w-[140px]" // ルートノードは少し大きく、青色で表示
            : "bg-gray-100 dark:bg-gray-700 min-w-[120px]" // 通常のノードはグレーで表示
        } ${isHovered ? "shadow-lg transform scale-105" : "shadow-md"}`} // ホバー時は少し拡大し、影を強調
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleNodeClick}
      >
        {/* 編集モードの場合はテキスト入力フィールドを表示、そうでなければテキストを表示 */}
        {isEditing ? (
          <input
            ref={inputRef} // 参照を設定して、フォーカス制御ができるようにする
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

        {/* コントロールボタン - 編集中でない場合に表示 */}
        {!isEditing && (
          <div className="absolute flex space-x-1 -top-3 -right-3">
            {/* 追加ボタン - 常に表示 */}
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center w-6 h-6 text-xs bg-green-500 text-white rounded-full shadow-sm hover:bg-green-600 transition-colors"
              title="枝を追加"
            >
              +
            </button>
            {/* 削除ボタン - ルートノード以外の場合のみ表示 */}
            {!isRoot && (
              <button
                onClick={handleDeleteClick}
                className="flex items-center justify-center w-6 h-6 text-xs bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                title="ノードを削除"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* 子ノードの表示 - 子ノードがある場合のみ表示 */}
      {node.children.length > 0 && (
        <div className="relative pt-6 mt-2">
          {/* 垂直接続線 - 親ノードと子ノード群を接続 */}
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>

          {/* 子ノード群のコンテナ - フレックスボックスで横並びに配置 */}
          <div className="flex flex-wrap justify-center gap-8">
            {/* 各子ノードをマップして表示 */}
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* 水平接続線 - 垂直線と各子ノードを接続 */}
                <div className="absolute top-0 left-1/2 w-8 h-0.5 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2 -translate-y-3"></div>
                {/* 子ノードコンポーネント - 再帰的に表示（ツリー構造を形成） */}
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
