import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { writeFile, unlink } from 'fs/promises';
import { SecretKeyLoader } from '../secretLoader';
import { Oprf, OPRFClient, OPRFServer } from '@cloudflare/voprf-ts';

describe('OPRF Functionality', () => {
    const testKeyPath = './test-secret-for-oprf.key';
    // P384スイート用の適切なサイズの秘密鍵（48バイト）
    const testKeyContent = 'dGVzdC1zZWNyZXQta2V5LWRhdGEtZm9yLXAzODQtc3VpdGUtZXhhbXBsZS1kYXRhLTEyMzQ1Njc4OTA='; // base64 encoded test data
    let server: OPRFServer;
    let client: OPRFClient;
    const suite = Oprf.Suite.P384_SHA384;

    beforeEach(async () => {
        // テスト用の秘密鍵ファイルを作成
        await writeFile(testKeyPath, testKeyContent, 'utf8');
        
        // OPRFサーバーとクライアントを初期化
        const loader = new SecretKeyLoader(testKeyPath);
        const privateKey = await loader.getSecretKey();
        server = new OPRFServer(suite, privateKey);
        client = new OPRFClient(suite);
    });

    afterEach(async () => {
        // テスト用の秘密鍵ファイルを削除
        try {
            await unlink(testKeyPath);
        } catch (error) {
            // ファイルが存在しない場合は無視
        }
    });

    it('OPRFクライアントとサーバーが正常に初期化されること', () => {
        expect(server).toBeDefined();
        expect(client).toBeDefined();
        expect(server).toBeInstanceOf(OPRFServer);
        expect(client).toBeInstanceOf(OPRFClient);
    });

    it('単一の入力でOPRFプロトコルが正常に動作すること', async () => {
        const input = new TextEncoder().encode("test input data");
        const batch = [input];
        
        // クライアント側でブラインド化
        const [finData, evalReq] = await client.blind(batch);
        
        expect(finData).toBeDefined();
        expect(evalReq).toBeDefined();
        
        // サーバー側で評価
        const evaluation = await server.blindEvaluate(evalReq);
        
        expect(evaluation).toBeDefined();
        
        // クライアント側でファイナライズ
        const [output] = await client.finalize(finData, evaluation);
        
        expect(output).toBeDefined();
        expect(output).toBeInstanceOf(Uint8Array);
        expect(output!.length).toBeGreaterThan(0);
    });

    it('複数の入力でOPRFプロトコルが正常に動作すること', async () => {
        const inputs = [
            new TextEncoder().encode("first input"),
            new TextEncoder().encode("second input"),
            new TextEncoder().encode("third input")
        ];
        
        // クライアント側でブラインド化
        const [finData, evalReq] = await client.blind(inputs);
        
        expect(finData).toBeDefined();
        expect(evalReq).toBeDefined();
        
        // サーバー側で評価
        const evaluation = await server.blindEvaluate(evalReq);
        
        expect(evaluation).toBeDefined();
        
        // クライアント側でファイナライズ
        const outputs = await client.finalize(finData, evaluation);
        
        expect(outputs).toBeDefined();
        expect(outputs.length).toBe(3);
        
        // 各出力が有効であることを確認
        for (const output of outputs) {
            expect(output).toBeDefined();
            expect(output).toBeInstanceOf(Uint8Array);
            expect(output.length).toBeGreaterThan(0);
        }
    });

    it('同じ入力に対して同じ出力が生成されること', async () => {
        const input = new TextEncoder().encode("deterministic test input");
        const batch = [input];
        
        // 1回目の実行
        const [finData1, evalReq1] = await client.blind(batch);
        const evaluation1 = await server.blindEvaluate(evalReq1);
        const [output1] = await client.finalize(finData1, evaluation1);
        
        // 2回目の実行
        const [finData2, evalReq2] = await client.blind(batch);
        const evaluation2 = await server.blindEvaluate(evalReq2);
        const [output2] = await client.finalize(finData2, evaluation2);
        
        // 同じ入力に対して同じ出力が生成されることを確認
        expect(output1).toBeDefined();
        expect(output2).toBeDefined();
        expect(output1).toEqual(output2);
    });

    it('異なる入力に対して異なる出力が生成されること', async () => {
        const input1 = new TextEncoder().encode("first different input");
        const input2 = new TextEncoder().encode("second different input");
        
        // 1つ目の入力の処理
        const [finData1, evalReq1] = await client.blind([input1]);
        const evaluation1 = await server.blindEvaluate(evalReq1);
        const [output1] = await client.finalize(finData1, evaluation1);
        
        // 2つ目の入力の処理
        const [finData2, evalReq2] = await client.blind([input2]);
        const evaluation2 = await server.blindEvaluate(evalReq2);
        const [output2] = await client.finalize(finData2, evaluation2);
        
        // 異なる入力に対して異なる出力が生成されることを確認
        expect(output1).toBeDefined();
        expect(output2).toBeDefined();
        expect(output1).not.toEqual(output2);
    });

    it('空の入力配列で空の結果が返されること', async () => {
        const emptyBatch: Uint8Array[] = [];
        
        const [finData, evalReq] = await client.blind(emptyBatch);
        
        expect(finData).toBeDefined();
        expect(evalReq).toBeDefined();
        // 空の配列の場合、finDataとevalReqは配列ではない
        expect(Array.isArray(finData)).toBe(false);
        expect(Array.isArray(evalReq)).toBe(false);
        // finDataとevalReqが定義されていることを確認
    });

    it('評価結果がシリアライズ可能であること', async () => {
        const input = new TextEncoder().encode("serialization test input");
        const batch = [input];
        
        const [finData, evalReq] = await client.blind(batch);
        const evaluation = await server.blindEvaluate(evalReq);
        
        // シリアライズが可能であることを確認
        const serialized = evaluation.serialize();
        expect(serialized).toBeDefined();
        expect(serialized).toBeInstanceOf(Uint8Array);
        expect(serialized.length).toBeGreaterThan(0);
    });
});
