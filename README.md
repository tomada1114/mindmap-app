# マインドマップアプリケーション

このプロジェクトは、Next.js を使用して構築されたモダンな UI を持つマインドマップアプリケーションです。ノードにカーソルを合わせると枝葉を追加したり、不要な枝葉を削除したりすることができます。また、localStorage を使用してデータを永続化し、ブラウザを閉じても作成したマインドマップが保持されます。

## 目次

- [機能](#機能)
- [必要環境](#必要環境)
- [インストールと実行方法](#インストールと実行方法)
- [使い方](#使い方)
- [アプリケーション設計](#アプリケーション設計)
- [ゼロからの構築手順](#ゼロからの構築手順)
- [コード解説](#コード解説)

## 機能

- **ノードの追加**: 任意のノードの緑色の「+」ボタンをクリックして新しい枝を追加
- **ノードの編集**: ノードをクリックしてテキストを編集
- **ノードの削除**: 赤色の「×」ボタンをクリックして枝を削除
- **視覚的な接続**: 枝はラインで接続され、階層構造が視覚的に理解しやすい
- **モダンな UI**: ダークモード対応のクリーンでレスポンシブなデザイン
- **データ永続化**: localStorage を使用してマインドマップデータを保存し、ブラウザを閉じても再訪問時にデータが復元される

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
- **localStorage**: ブラウザ内データ永続化

### データ永続化の仕組み

アプリケーションはブラウザの localStorage API を使用して、マインドマップのデータを永続化しています：

1. **データの保存**: マインドマップのデータ（rootNode）が変更されるたびに、JSON 形式に変換して localStorage に保存します
2. **データの読み込み**: アプリケーションの初期化時に、localStorage からデータを読み込み、存在する場合はそれを使用して状態を初期化します
3. **エラー処理**: データの読み込みや保存時にエラーが発生した場合に適切に処理し、アプリケーションが正常に動作し続けるようにしています

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
const Node: React.FC<NodeProps> = ({ node, onAddNode, onDeleteNode, onUpdateNodeText, isRoot = false }) => {
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
    if (nodeText.trim() !== '') {
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
    if (e.key === 'Enter') {
      // Enterキーが押された場合、編集を確定
      handleInputBlur();
    } else if (e.key === 'Escape') {
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
            ? 'bg-blue-100 dark:bg-blue-900 min-w-[140px]' // ルートノードは少し大きく、青色で表示
            : 'bg-gray-100 dark:bg-gray-700 min-w-[120px]' // 通常のノードはグレーで表示
        } ${isHovered ? 'shadow-lg transform scale-105' : 'shadow-md'}`} // ホバー時は少し拡大し、影を強調
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
```

### 4. MindMap コンポーネントの作成

`src/components/MindMap.tsx` ファイルを作成し、以下の内容を追加します：

```typescript
'use client';

import { NodeData } from '../types/types';
import Node from './Node';

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
      text: 'New Topic', // 新しいノードのデフォルトテキスト
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
    if (nodeId === 'root') return;

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
      children: node.children.map((child) => addChildToNode(child, targetId, newChild)),
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
      .filter((child) => child.id !== nodeIdToRemove)
      // 残りの各子ノードに対して再帰的に処理を適用（孫ノード以下の削除対象も処理するため）
      .map((child) => removeNodeFromTree(child, nodeIdToRemove));

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
