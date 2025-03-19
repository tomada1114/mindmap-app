"use client";

import { useState, useEffect } from "react";
import MindMap from "../components/MindMap";
import { NodeData } from "../types/types";

// localStorageのキー名を定数として定義
const STORAGE_KEY = "mindmap-data";

export default function Home() {
  // マインドマップのデータを保持するための状態
  const [rootNode, setRootNode] = useState<NodeData>({
    id: "root",
    text: "Main Topic",
    children: [],
  });

  // コンポーネントのマウント時にlocalStorageからデータを読み込む
  useEffect(() => {
    // ブラウザ環境でのみ実行（Next.jsのSSR対策）
    if (typeof window !== "undefined") {
      try {
        // localStorageからデータを取得
        const savedData = localStorage.getItem(STORAGE_KEY);

        // データが存在する場合は、JSONとしてパースして状態を更新
        if (savedData) {
          const parsedData = JSON.parse(savedData) as NodeData;
          setRootNode(parsedData);
        }
      } catch (error) {
        // エラーが発生した場合はコンソールに出力（データの破損など）
        console.error("マインドマップデータの読み込みに失敗しました:", error);
      }
    }
  }, []); // 空の依存配列で、コンポーネントのマウント時に一度だけ実行

  // rootNodeが変更されたときにlocalStorageに保存する
  useEffect(() => {
    // ブラウザ環境でのみ実行（Next.jsのSSR対策）
    if (typeof window !== "undefined") {
      try {
        // オブジェクトをJSON文字列に変換してlocalStorageに保存
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rootNode));
      } catch (error) {
        // エラーが発生した場合はコンソールに出力
        console.error("マインドマップデータの保存に失敗しました:", error);
      }
    }
  }, [rootNode]); // rootNodeが変更されるたびに実行

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
