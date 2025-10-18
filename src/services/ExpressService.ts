import express, { type Request, type Response, type Application } from 'express';
import { OPRFService } from './OPRFService';

/**
 * Expressサーバーサービスクラス
 * 
 * このクラスは、Expressアプリケーションの設定とルーティングを管理します。
 * OPRFサービスとの統合も提供します。
 * 
 * @example
 * ```typescript
 * const expressService = new ExpressService();
 * await expressService.initialize();
 * expressService.start(3000);
 * ```
 */
export class ExpressService {
    private app: Application;
    private oprfService: OPRFService | null = null;
    private isInitialized = false;

    /**
     * Expressサービスの新しいインスタンスを作成します。
     */
    constructor() {
        this.app = express();
        this.setupMiddleware();
    }

    /**
     * Expressサービスを初期化します。
     * OPRFサービスも初期化されます。
     * 
     * @param keyPath 秘密鍵ファイルのパス（デフォルト: './secrets/key.priv'）
     * @throws {Error} 初期化に失敗した場合
     */
    async initialize(keyPath: string = './secrets/key.priv'): Promise<void> {
        try {
            this.oprfService = new OPRFService(keyPath);
            await this.oprfService.initialize();
            this.setupRoutes();
            this.isInitialized = true;
        } catch (error) {
            throw new Error(`Expressサービスの初期化に失敗しました: ${error}`);
        }
    }

    /**
     * 初期化状態を確認します。
     * 
     * @returns 初期化済みかどうか
     */
    isReady(): boolean {
        return this.isInitialized && this.oprfService?.isReady() === true;
    }

    /**
     * Expressアプリケーションインスタンスを取得します。
     * 
     * @returns Expressアプリケーション
     */
    getApp(): Application {
        return this.app;
    }

    /**
     * サーバーを指定されたポートで開始します。
     * 
     * @param port ポート番号（デフォルト: 3000）
     * @param callback 開始時のコールバック関数
     */
    start(port: number = 3000, callback?: () => void): void {
        if (!this.isReady()) {
            throw new Error('Expressサービスが初期化されていません。initialize()を呼び出してください。');
        }

        const server = this.app.listen(port, () => {
            console.log(`✅ Expressサーバーが起動しました: http://localhost:${port}`);
            console.log(`📊 ステータス: http://localhost:${port}/api/status`);
            console.log(`🔐 OPRF処理: http://localhost:${port}/upload-binary`);

            if (callback) {
                callback();
            }
        });

        // グレースフルシャットダウンの処理
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERMを受信しました。サーバーをシャットダウンしています...');
            server.close(() => {
                console.log('✅ サーバーが正常にシャットダウンしました。');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINTを受信しました。サーバーをシャットダウンしています...');
            server.close(() => {
                console.log('✅ サーバーが正常にシャットダウンしました。');
                process.exit(0);
            });
        });
    }

    /**
     * ミドルウェアを設定します。
     * 
     * @private
     */
    private setupMiddleware(): void {
        // バイナリデータの処理用ミドルウェア
        this.app.use(express.raw({
            type: 'application/octet-stream',
            limit: '10mb'
        }));

        // JSONパース用ミドルウェア
        this.app.use(express.json({ limit: '10mb' }));

        // CORS設定（必要に応じて）
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // リクエストログ
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * ルートを設定します。
     * 
     * @private
     */
    private setupRoutes(): void {
        // ヘルスチェックエンドポイント
        this.app.get('/', (req: Request, res: Response) => {
            res.json({
                message: 'OPRF Server is running! 🚀',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // ステータスエンドポイント
        this.app.get('/api/status', (req: Request, res: Response) => {
            res.json({
                status: 'OK',
                runtime: 'Bun',
                timestamp: new Date().toISOString(),
                oprf: {
                    initialized: this.oprfService?.isReady() || false
                }
            });
        });

        // OPRF処理エンドポイント
        this.app.post('/upload-binary', async (req: Request, res: Response) => {
            try {
                const binaryData: Buffer | undefined = req.body;

                if (!binaryData || binaryData.length === 0) {
                    return res.status(400).json({
                        error: 'Binary data is missing or empty.',
                        code: 'MISSING_DATA'
                    });
                }

                const uint8ArrayData: Uint8Array = binaryData;

                // OPRF処理を実行
                const result = await this.oprfService!.evaluate(uint8ArrayData);

                res.set('Content-Type', 'application/octet-stream');
                res.send(Buffer.from(result));

            } catch (error) {
                console.error('OPRF processing error:', error);
                res.status(500).json({
                    error: 'Internal server error during OPRF processing.',
                    code: 'OPRF_ERROR'
                });
            }
        });

        // バッチ処理エンドポイント
        // this.app.post('/api/oprf/batch', async (req: Request, res: Response) => {
        //     try {
        //         const { data } = req.body;

        //         if (!Array.isArray(data) || data.length === 0) {
        //             return res.status(400).json({
        //                 error: 'Data array is required and must not be empty.',
        //                 code: 'INVALID_DATA'
        //             });
        //         }

        //         // 文字列配列をUint8Arrayに変換
        //         const inputs = data.map((item: string) => new TextEncoder().encode(item));

        //         // バッチ処理を実行
        //         const results = await this.oprfService!.processBatch(inputs);

        //         // 結果をBase64エンコードして返す
        //         const encodedResults = results.map(result => Buffer.from(result).toString('base64'));

        //         res.json({
        //             results: encodedResults,
        //             count: results.length
        //         });

        //     } catch (error) {
        //         console.error('Batch OPRF processing error:', error);
        //         res.status(500).json({
        //             error: 'Internal server error during batch OPRF processing.',
        //             code: 'BATCH_OPRF_ERROR'
        //         });
        //     }
        // });

        // 404エラーハンドラー
        this.app.use('/{*any}', (req: Request, res: Response) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.originalUrl,
                method: req.method
            });
        });
        // エラーハンドラー
        this.app.use((error: Error, req: Request, res: Response, next: any) => {
            console.error('Unhandled error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });
    }
}
