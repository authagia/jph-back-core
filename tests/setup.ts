// テスト環境のセットアップファイル
// このファイルはテスト実行前に読み込まれます

import { beforeAll, afterAll } from 'bun:test';

// テスト実行前のセットアップ
beforeAll(() => {
    console.log('🧪 テスト環境をセットアップ中...');
});

// テスト実行後のクリーンアップ
afterAll(() => {
    console.log('🧹 テスト環境をクリーンアップ中...');
});
