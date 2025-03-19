# マインドマップアプリケーション

このプロジェクトは、Next.js を使用して構築されたモダンな UI を持つマインドマップアプリケーションです。ノードにカーソルを合わせると枝葉を追加したり、不要な枝葉を削除したりすることができます。

## 目次

- [機能](#機能)
- [必要環境](#必要環境)
- [インストールと実行方法](#インストールと実行方法)
- [使い方](#使い方)
- [アプリケーション設計](#アプリケーション設計)
- [ゼロからの構築手順](#ゼロからの構築手順)

## 機能

- **ノードの追加**: 任意のノードの緑色の「+」ボタンをクリックして新しい枝を追加
- **ノードの編集**: ノードをクリックしてテキストを編集
- **ノードの削除**: 赤色の「×」ボタンをクリックして枝を削除
- **視覚的な接続**: 枝はラインで接続され、階層構造が視覚的に理解しやすい
- **モダンな UI**: ダークモード対応のクリーンでレスポンシブなデザイン

## 必要環境

- Node.js 18.0.0 以上
- npm 7.0.0 以上（または yarn、pnpm、bun などのパッケージマネージャー）
- モダンな Web ブラウザ（Chrome、Firefox、Safari、Edge など）

## インストールと実行方法

1. リポジトリをクローンまたはダウンロードします
2. プロジェクトディレクトリに移動します
   ```bash
   cd mindmap-app
   ```
3. 依存関係をインストールします
   ```bash
   npm install
   ```
4. 開発サーバーを起動します
   ```bash
   npm run dev
   ```
5. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます

## 使い方

1. アプリケーションは「Main Topic」というルートノードから始まります
2. ノードをクリックするとテキストを編集できます
3. ノードの緑色の「+」ボタンをクリックすると新しい枝を追加できます
4. ノードの赤色の「×」ボタンをクリックすると枝を削除できます（ルートノードは削除できません）
5. ノードを追加・編集・削除してマインドマップを構築します

## アプリケーション設計

### コンポーネント構造

- **MindMap**: マインドマップのデータを管理するメインコンテナコンポーネント
- **Node**: マインドマップの各ノードを表示するための再利用可能なコンポーネント

### データ構造

```typescript
interface NodeData {
  id: string;
  text: string;
  children: NodeData[];
}
```

### 主要な機能

1. **ノードの追加**:

   - 親ノードの ID を指定して新しい子ノードを追加
   - 再帰的にツリー構造を更新

2. **ノードの編集**:

   - ノードの ID とテキストを指定してノードのテキストを更新
   - 再帰的にツリー構造を更新

3. **ノードの削除**:
   - ノードの ID を指定してノードを削除
   - 再帰的にツリー構造を更新

### 技術スタック

- **Next.js**: React フレームワーク
- **TypeScript**: 型安全性の確保
- **Tailwind CSS**: スタイリング
- **React Hooks**: 状態管理

## ゼロからの構築手順

### 1. プロジェクトのセットアップ

```bash
# Next.jsプロジェクトの作成
npx create-next-app@latest mindmap-app --typescript --eslint --tailwind --app --src-dir

# プロジェクトディレクトリに移動
cd mindmap-app
```

### 2. 型定義の作成

`src/types/types.ts` ファイルを作成し、以下の内容を追加します：

```typescript
// マインドマップのノードの構造を定義
export interface NodeData {
  id: string;
  text: string;
  children: NodeData[];
}
```

### 3. Node コンポーネントの作成

`src/components/Node.tsx` ファイルを作成し、以下の内容を追加します：

```typescript
'use client';

import { useState, useRef } from 'react';
import { NodeData } from '../types/types';

interface NodeProps {
  node: NodeData;
  onAddNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNodeText: (nodeId: string, newText: string) => void;
  isRoot?: boolean;
}

const Node: React.FC<NodeProps> = ({ node, onAddNode, onDeleteNode, onUpdateNodeText, isRoot = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeText, setNodeText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // マウスエンターイベントの処理
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // マウスリーブイベントの処理
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // ノードクリックで編集モードに
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
      // 入力フィールドにフォーカスを当てる
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  };

  // テキスト入力の変更処理
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeText(e.target.value);
  };

  // 入力フィールドのブラー処理（編集終了）
  const handleInputBlur = () => {
    setIsEditing(false);
    if (nodeText.trim() !== '') {
      onUpdateNodeText(node.id, nodeText);
    } else {
      // 空の場合、元のテキストに戻す
      setNodeText(node.text);
    }
  };

  // 入力フィールドのキー押下処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNodeText(node.text);
    }
  };

  // 追加ボタンのクリック処理
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddNode(node.id);
  };

  // 削除ボタンのクリック処理
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNode(node.id);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center p-3 mb-2 rounded-lg transition-all duration-200 ${
          isRoot ? 'bg-blue-100 dark:bg-blue-900 min-w-[140px]' : 'bg-gray-100 dark:bg-gray-700 min-w-[120px]'
        } ${isHovered ? 'shadow-lg transform scale-105' : 'shadow-md'}`}
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

        {/* コントロール - 編集中でない場合に表示 */}
        {!isEditing && (
          <div className="absolute flex space-x-1 -top-3 -right-3">
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center w-6 h-6 text-xs bg-green-500 text-white rounded-full shadow-sm hover:bg-green-600 transition-colors"
              title="枝を追加"
            >
              +
            </button>
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

      {/* 子ノード */}
      {node.children.length > 0 && (
        <div className="relative pt-6 mt-2">
          {/* 垂直コネクタライン */}
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>

          <div className="flex flex-wrap justify-center gap-8">
            {node.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* 水平コネクタライン */}
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
```

### 4. MindMap コンポーネントの作成

`src/components/MindMap.tsx` ファイルを作成し、以下の内容を追加します：

```typescript
'use client';

import { useState } from 'react';
import { NodeData } from '../types/types';
import Node from './Node';

interface MindMapProps {
  rootNode: NodeData;
  setRootNode: React.Dispatch<React.SetStateAction<NodeData>>;
}

const MindMap: React.FC<MindMapProps> = ({ rootNode, setRootNode }) => {
  // 親ノードに新しい子ノードを追加する関数
  const addNode = (parentId: string) => {
    const newNodeId = `node-${Date.now()}`;

    // ルートノードのディープコピーを作成し、新しい子を追加
    const updatedRoot = addChildToNode(rootNode, parentId, {
      id: newNodeId,
      text: 'New Topic',
      children: [],
    });

    setRootNode(updatedRoot);
  };

  // マインドマップからノードを削除する関数
  const deleteNode = (nodeId: string) => {
    // ルートノードの削除は許可しない
    if (nodeId === 'root') return;

    // ルートノードのディープコピーを作成し、指定されたノードを削除
    const updatedRoot = removeNodeFromTree(rootNode, nodeId);
    setRootNode(updatedRoot);
  };

  // ノードのテキストを更新する関数
  const updateNodeText = (nodeId: string, newText: string) => {
    // ルートノードのディープコピーを作成し、テキストを更新
    const updatedRoot = updateNodeTextInTree(rootNode, nodeId, newText);
    setRootNode(updatedRoot);
  };

  // 再帰的に子ノードを追加するヘルパー関数
  const addChildToNode = (node: NodeData, targetId: string, newChild: NodeData): NodeData => {
    if (node.id === targetId) {
      // ターゲットノードが見つかった場合、新しい子を追加
      return {
        ...node,
        children: [...node.children, newChild],
      };
    }

    // 見つからない場合、子ノードを再帰的に検索
    return {
      ...node,
      children: node.children.map((child) => addChildToNode(child, targetId, newChild)),
    };
  };

  // 再帰的にツリーからノードを削除するヘルパー関数
  const removeNodeFromTree = (node: NodeData, nodeIdToRemove: string): NodeData => {
    // 子から削除対象のノードをフィルタリング
    const updatedChildren = node.children
      .filter((child) => child.id !== nodeIdToRemove)
      .map((child) => removeNodeFromTree(child, nodeIdToRemove));

    return {
      ...node,
      children: updatedChildren,
    };
  };

  // 再帰的にノードテキストを更新するヘルパー関数
  const updateNodeTextInTree = (node: NodeData, targetId: string, newText: string): NodeData => {
    if (node.id === targetId) {
      // ターゲットノードが見つかった場合、テキストを更新
      return {
        ...node,
        text: newText,
      };
    }

    // 見つからない場合、子ノードを再帰的に検索
    return {
      ...node,
      children: node.children.map((child) => updateNodeTextInTree(child, targetId, newText)),
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
```

### 5. メインページの更新

`src/app/page.tsx` ファイルを以下の内容で更新します：

```typescript
'use client';

import { useState } from 'react';
import MindMap from '../components/MindMap';
import { NodeData } from '../types/types';

export default function Home() {
  // ルートノードを持つ初期マインドマップデータ
  const [rootNode, setRootNode] = useState<NodeData>({
    id: 'root',
    text: 'Main Topic',
    children: [],
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <header className="w-full max-w-4xl py-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mind Map App</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          ノードにカーソルを合わせて枝を追加したり、ノードをクリックして編集したり、削除ボタンで枝を削除したりできます。
        </p>
      </header>

      <main className="flex-1 w-full max-w-6xl">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-[600px] flex items-center justify-center">
          <MindMap rootNode={rootNode} setRootNode={setRootNode} />
        </div>
      </main>

      <footer className="w-full max-w-4xl py-6 mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Next.jsとReactで構築
      </footer>
    </div>
  );
}
```

### 6. レイアウトの更新

`src/app/layout.tsx` ファイルを以下の内容で更新します：

```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mind Map App',
  description: 'Next.jsで構築されたモダンなマインドマップアプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

### 7. アプリケーションの実行

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて、マインドマップアプリケーションを使用します。

## まとめ

このマインドマップアプリケーションは、Next.js と React を使用して構築された、シンプルでありながらモダンな UI を持つアプリケーションです。ノードの追加、編集、削除の基本機能を備えており、視覚的に階層構造を表現することができます。

この README では、アプリケーションの使い方、必要環境、詳細設計、およびゼロからの構築手順を説明しました。これらの情報を参考に、アプリケーションをカスタマイズしたり、新機能を追加したりすることができます。
