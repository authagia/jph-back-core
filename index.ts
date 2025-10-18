import {
    Oprf, OPRFClient, OPRFServer
} from '@cloudflare/voprf-ts';
import { SecretKeyLoader } from './secretLoader';

const suite = Oprf.Suite.P384_SHA384;

const loader = new SecretKeyLoader("./secrets/key.priv")
const privateKey = await loader.getSecretKey();

const server = new OPRFServer(suite, privateKey);

// client code

const client = new OPRFClient(suite);

const input = new TextEncoder().encode("This is the client's input");
const batch = [input];
const [finData, evalReq] = await client.blind(batch);

// server code

const evaluation = await server.blindEvaluate(evalReq);

// Get output matching first input of batch
const [output] = await client.finalize(finData, evaluation);

console.log(output?.toHex());














import express, { type Request, type Response } from 'express';

// Expressアプリケーションのインスタンスを作成
const app = express();

app.use(express.raw({ 
    type: 'application/octet-stream', 
    limit: '10mb' 
}));

// サーバーがリッスンするポート番号を定義
// Bunの環境でも Node.js と同様に process.env.PORT が使えます
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// ------------------------------------
// ルーティングの設定
// ------------------------------------

// ルートURL ('/') へのGETリクエストに対するハンドラ
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World from Bun/TypeScript Express Server! 🚀');
});

// // '/api/status' へのGETリクエストに対するハンドラ
// app.get('/api/status', (req: Request, res: Response) => {
//     // サーバーのステータス情報をJSONで送信
//     res.json({
//         status: 'OK',
//         runtime: 'Bun',
//         timestamp: new Date().toISOString()
//     });
// });


app.post('/upload-binary', (req: Request, res: Response) => {
    // req.body は express.raw() によって Buffer 型（Uint8Arrayの一種）としてパースされます。
    const binaryData: Buffer | undefined = req.body;
    console.log(binaryData);

    if (!binaryData || binaryData.length === 0) {
        return res.status(400).send('Binary data is missing or empty.');
    }

    // 1. BufferをUint8Arrayとして扱う
    // BufferはUint8Arrayのサブクラスなので、型アサーションや追加の変換は不要です。
    const uint8ArrayData: Uint8Array = binaryData;

    console.log(`受信したデータのバイト数: ${uint8ArrayData.length}`);
    console.log(`データの最初の10バイト: ${uint8ArrayData.subarray(0, 10)}`);
    
    // const evaluation = await server.blindEvaluate(evalReq);
    server.blindEvaluate(evalReq)
    .then(evaluation => {
        res.send(evaluation.serialize());
    })
});

// ------------------------------------
// サーバーの起動
// ------------------------------------

// Bun は Express の .listen() を高速に実行します
app.listen(PORT, () => {
    console.log(`✅ Bun Expressサーバーが起動しました: http://localhost:${PORT}`);
    console.log(`ステータスの例: http://localhost:${PORT}/api/status`);
});


// fetch("hr", {
//     body: new Uint8Array([0,0,0,0,0,0,0])
// })