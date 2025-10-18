import { Oprf, OPRFClient, OPRFServer } from '@cloudflare/voprf-ts';
import { SecretKeyLoader } from '../../secretLoader';

/**
 * OPRF (Oblivious Pseudorandom Function) サービスクラス
 * 
 * このクラスは、OPRFプロトコルの実装を提供します。
 * クライアントとサーバー間での安全なデータ処理を可能にします。
 * 
 * @example
 * ```typescript
 * const oprfService = new OPRFService('./secrets/key.priv');
 * await oprfService.initialize();
 * 
 * const result = await oprfService.processData(inputData);
 * ```
 */
export class OPRFService {
    private server: OPRFServer | null = null;
    private client: OPRFClient | null = null;
    private suite = Oprf.Suite.P384_SHA384;
    private isInitialized = false;

    /**
     * OPRFサービスの新しいインスタンスを作成します。
     * 
     * @param keyPath 秘密鍵ファイルのパス
     */
    constructor(private keyPath: string) {}

    /**
     * OPRFサービスを初期化します。
     * 秘密鍵を読み込み、サーバーとクライアントを設定します。
     * 
     * @throws {Error} 秘密鍵の読み込みに失敗した場合
     */
    async initialize(): Promise<void> {
        try {
            const loader = new SecretKeyLoader(this.keyPath);
            const privateKey = await loader.getSecretKey();
            
            this.server = new OPRFServer(this.suite, privateKey);
            this.client = new OPRFClient(this.suite);
            this.isInitialized = true;
        } catch (error) {
            throw new Error(`OPRFサービスの初期化に失敗しました: ${error}`);
        }
    }

    /**
     * 初期化状態を確認します。
     * 
     * @returns 初期化済みかどうか
     */
    isReady(): boolean {
        return this.isInitialized && this.server !== null && this.client !== null;
    }

    /**
     * 単一のデータをOPRFプロトコルで処理します。
     * 
     * @param input 処理するデータ
     * @returns 処理結果
     * @throws {Error} サービスが初期化されていない場合
     */
    async processData(input: Uint8Array): Promise<Uint8Array> {
        this.ensureInitialized();
        
        const batch = [input];
        const [finData, evalReq] = await this.client!.blind(batch);
        const evaluation = await this.server!.blindEvaluate(evalReq);
        const [output] = await this.client!.finalize(finData, evaluation);
        
        if (!output) {
            throw new Error('OPRF処理の結果が空です');
        }
        
        return output;
    }

    /**
     * 複数のデータをバッチでOPRFプロトコルで処理します。
     * 
     * @param inputs 処理するデータの配列
     * @returns 処理結果の配列
     * @throws {Error} サービスが初期化されていない場合
     */
    async processBatch(inputs: Uint8Array[]): Promise<Uint8Array[]> {
        this.ensureInitialized();
        
        if (inputs.length === 0) {
            return [];
        }
        
        const [finData, evalReq] = await this.client!.blind(inputs);
        const evaluation = await this.server!.blindEvaluate(evalReq);
        const outputs = await this.client!.finalize(finData, evaluation);
        
        return outputs.filter((output): output is Uint8Array => output !== undefined);
    }

    /**
     * データの評価のみを実行します（クライアント側のブラインド化は行わない）。
     * 
     * @param evalReq 評価リクエスト
     * @returns 評価結果
     * @throws {Error} サービスが初期化されていない場合
     */
    async evaluate(evalReq: any): Promise<any> {
        this.ensureInitialized();
        return await this.server!.blindEvaluate(evalReq);
    }

    /**
     * クライアント側でデータをブラインド化します。
     * 
     * @param inputs ブラインド化するデータの配列
     * @returns [finData, evalReq] のタプル
     * @throws {Error} サービスが初期化されていない場合
     */
    async blind(inputs: Uint8Array[]): Promise<[any, any]> {
        this.ensureInitialized();
        return await this.client!.blind(inputs);
    }

    /**
     * クライアント側でファイナライズ処理を実行します。
     * 
     * @param finData ファイナライズデータ
     * @param evaluation 評価結果
     * @returns 最終結果の配列
     * @throws {Error} サービスが初期化されていない場合
     */
    async finalize(finData: any, evaluation: any): Promise<Uint8Array[]> {
        this.ensureInitialized();
        const outputs = await this.client!.finalize(finData, evaluation);
        return outputs.filter((output): output is Uint8Array => output !== undefined);
    }

    /**
     * サービスが初期化されていることを確認します。
     * 
     * @private
     * @throws {Error} サービスが初期化されていない場合
     */
    private ensureInitialized(): void {
        if (!this.isReady()) {
            throw new Error('OPRFサービスが初期化されていません。initialize()を呼び出してください。');
        }
    }
}
