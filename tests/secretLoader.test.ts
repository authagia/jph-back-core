import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SecretKeyLoader } from '../secretLoader';
import { writeFile, unlink } from 'fs/promises';
import * as path from 'path';

describe('SecretKeyLoader', () => {
    const testKeyPath = './test-secret.key';
    const testKeyContent = 'dGVzdC1zZWNyZXQta2V5LWRhdGE='; // base64 encoded test data

    beforeEach(async () => {
        // テスト用の秘密鍵ファイルを作成
        await writeFile(testKeyPath, testKeyContent, 'utf8');
    });

    afterEach(async () => {
        // テスト用の秘密鍵ファイルを削除
        try {
            await unlink(testKeyPath);
        } catch (error) {
            // ファイルが存在しない場合は無視
        }
    });

    it('正しいパスで秘密鍵を読み込めること', async () => {
        const loader = new SecretKeyLoader(testKeyPath);
        const secretKey = await loader.getSecretKey();
        
        expect(secretKey).toBeInstanceOf(Uint8Array);
        expect(secretKey.length).toBeGreaterThan(0);
    });

    it('存在しないファイルパスでエラーが発生すること', async () => {
        const loader = new SecretKeyLoader('./non-existent-file.key');
        
        await expect(async () => {
            await loader.getSecretKey();
        }).toThrow();
    });

    it('相対パスが絶対パスに正しく解決されること', () => {
        const relativePath = './secrets/test.key';
        const loader = new SecretKeyLoader(relativePath);
        
        // プライベートプロパティにアクセスしてテスト
        const resolvedPath = (loader as any).keyPath;
        expect(path.isAbsolute(resolvedPath)).toBe(true);
    });

    it('base64エンコードされたデータが正しくデコードされること', async () => {
        const loader = new SecretKeyLoader(testKeyPath);
        const secretKey = await loader.getSecretKey();
        
        // base64デコードされたデータを確認
        const expectedData = Buffer.from(testKeyContent, 'base64');
        expect(secretKey).toEqual(expectedData);
    });

    it('空のファイルで空のUint8Arrayが返されること', async () => {
        const emptyFilePath = './empty-test.key';
        await writeFile(emptyFilePath, '', 'utf8');
        
        const loader = new SecretKeyLoader(emptyFilePath);
        
        try {
            // 空のファイルは空のUint8Arrayを返す
            const result = await loader.getSecretKey();
            expect(result).toBeInstanceOf(Uint8Array);
            expect(result.length).toBe(0);
        } finally {
            await unlink(emptyFilePath);
        }
    });

    it('無効なbase64データでUint8Arrayが返されること', async () => {
        const invalidBase64Path = './invalid-base64.key';
        await writeFile(invalidBase64Path, 'invalid-base64-data!@#', 'utf8');
        
        const loader = new SecretKeyLoader(invalidBase64Path);
        
        try {
            // 無効なbase64データでもBuffer.fromは処理を続行する
            const result = await loader.getSecretKey();
            expect(result).toBeInstanceOf(Uint8Array);
            expect(result.length).toBeGreaterThan(0);
        } finally {
            await unlink(invalidBase64Path);
        }
    });
});
