import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AuthPage from './AuthPage';

/**
 * AuthPageコンポーネントをHTMLに変換
 */
export function renderAuthPageToHTML(type: 'success' | 'error' | 'cancelled'): string {
    return '<!DOCTYPE html>' + renderToStaticMarkup(<AuthPage type={type} />);
}

/**
 * 認証結果ページのHTMLを生成（TSX版）
 * @param type - 'success', 'error', 'cancelled'
 * @returns HTML文字列
 */
export function getAuthPageHTML(type: 'success' | 'error' | 'cancelled'): string {
    return renderAuthPageToHTML(type);
}