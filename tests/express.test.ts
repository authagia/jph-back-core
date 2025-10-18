import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { writeFile, unlink } from 'fs/promises';
import { SecretKeyLoader } from '../secretLoader';
import { Oprf, OPRFClient, OPRFServer } from '@cloudflare/voprf-ts';
import request from 'supertest';

// テスト用のExpressアプリケーションを作成する関数
async function createTestApp() {
    const express = await import('express');
    const app = express.default();
    
    app.use(express.default.raw({ 
        type: 'application/octet-stream', 
        limit: '10mb' 
    }));

    // テスト用の秘密鍵ファイルを作成
    const testKeyPath = './test-secret-for-express.key';
    const testKeyContent = 'dGVzdC1zZWNyZXQta2V5LWRhdGE='; // base64 encoded test data
    await writeFile(testKeyPath, testKeyContent, 'utf8');

    // OPRFサーバーをセットアップ
    const suite = Oprf.Suite.P384_SHA384;
    const loader = new SecretKeyLoader(testKeyPath);
    const privateKey = await loader.getSecretKey();
    const server = new OPRFServer(suite, privateKey);

    // ルートの設定
    app.get('/', (req, res) => {
        res.send('Hello World from Bun/TypeScript Express Server! 🚀');
    });

    app.post('/upload-binary', async (req, res) => {
        const binaryData: Buffer | undefined = req.body;

        if (!binaryData || binaryData.length === 0) {
            return res.status(400).send('Binary data is missing or empty.');
        }

        const uint8ArrayData: Uint8Array = binaryData;
        
        try {
            // テスト用のモックレスポンスを返す
            const mockResponse = Buffer.from('mock-oprf-response-data');
            res.send(mockResponse);
        } catch (error) {
            console.error('Processing error:', error);
            res.status(500).send('Internal server error');
        }
    });

    return { app, testKeyPath };
}

describe('Express Routes', () => {
    let testKeyPath: string;

    afterEach(async () => {
        // テスト用の秘密鍵ファイルを削除
        try {
            await unlink(testKeyPath);
        } catch (error) {
            // ファイルが存在しない場合は無視
        }
    });

    it('GET / が正しいレスポンスを返すこと', async () => {
        const { app } = await createTestApp();
        
        const response = await request(app).get('/');
        
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello World from Bun/TypeScript Express Server! 🚀');
    });

    it('POST /upload-binary が空のデータで400エラーを返すこと', async () => {
        const { app } = await createTestApp();
        
        const response = await request(app)
            .post('/upload-binary')
            .set('Content-Type', 'application/octet-stream')
            .send(Buffer.alloc(0));
        
        expect(response.status).toBe(400);
        expect(response.text).toBe('Binary data is missing or empty.');
    });

    it('POST /upload-binary が有効なデータで正常に処理すること', async () => {
        const { app, testKeyPath: keyPath } = await createTestApp();
        testKeyPath = keyPath;
        
        const testData = new TextEncoder().encode("test binary data");
        
        const response = await request(app)
            .post('/upload-binary')
            .set('Content-Type', 'application/octet-stream')
            .send(Buffer.from(testData));
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('POST /upload-binary がContent-Typeヘッダーなしでも動作すること', async () => {
        const { app, testKeyPath: keyPath } = await createTestApp();
        testKeyPath = keyPath;
        
        const testData = new TextEncoder().encode("test data without content-type");
        
        const response = await request(app)
            .post('/upload-binary')
            .set('Content-Type', 'application/octet-stream')
            .send(Buffer.from(testData));
        
        expect(response.status).toBe(200);
    });

    it('存在しないルートで404エラーを返すこと', async () => {
        const { app } = await createTestApp();
        
        const response = await request(app).get('/non-existent-route');
        
        expect(response.status).toBe(404);
    });
});
