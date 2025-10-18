# OPRF Server

[![Bun](https://img.shields.io/badge/Bun-1.0+-000000?style=flat&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![OPRF](https://img.shields.io/badge/OPRF-Cloudflare-FF6B35?style=flat)](https://github.com/cloudflare/voprf-ts)

高性能なOPRF（Oblivious Pseudorandom Function）サーバーを提供するTypeScriptライブラリです。Bunランタイムで動作し、Express.jsベースのWebサーバーとして実装されています。

## 🚀 特徴

- **高性能**: Bunランタイムによる高速な実行
- **型安全**: TypeScriptによる完全な型安全性
- **モジュラー設計**: 再利用可能なサービスクラス
- **包括的テスト**: 18個のテストケースによる品質保証
- **RESTful API**: 標準的なHTTPエンドポイント
- **エラーハンドリング**: 堅牢なエラー処理とログ機能
- **API ドキュメント**: Swagger OpenAPI 3.0による自動生成ドキュメント
- **インタラクティブUI**: Swagger UIによるAPIテスト機能

## 📦 インストール

```bash
# 依存関係のインストール
bun install

# 開発用依存関係も含めてインストール
bun install --dev
```

## 🛠️ セットアップ

### 1. 秘密鍵の準備

```bash
# 秘密鍵ディレクトリを作成
mkdir -p secrets

# 秘密鍵ファイルを生成（例）
echo "your-base64-encoded-private-key" > secrets/key.priv
```

### 2. 環境変数の設定（オプション）

```bash
# ポート番号を設定（デフォルト: 3000）
export PORT=3000
```

## 🏃‍♂️ 使用方法

### 基本的な使用

```typescript
import { ExpressService } from './src/services/ExpressService';

async function startServer() {
    const expressService = new ExpressService();
    await expressService.initialize('./secrets/key.priv');
    expressService.start(3000);
}

startServer();
```

### OPRFサービスの直接使用

```typescript
import { OPRFService } from './src/services/OPRFService';

async function processData() {
    const oprfService = new OPRFService('./secrets/key.priv');
    await oprfService.initialize();
    
    const input = new TextEncoder().encode("Hello, OPRF!");
    const result = await oprfService.processData(input);
    
    console.log('処理結果:', result);
}
```

## 🌐 API エンドポイント

### 📚 API ドキュメント

**Swagger UI**: http://localhost:3000/api-docs/  
**API仕様書（JSON）**: http://localhost:3000/api-docs.json

インタラクティブなAPIドキュメントで、すべてのエンドポイントの詳細な説明、リクエスト/レスポンスの例、そして実際のAPIテストが可能です。

### 主要エンドポイント

#### GET /
サーバーの基本情報を取得します。

**レスポンス:**
```json
{
    "message": "OPRF Server is running! 🚀",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
}
```

#### GET /api/status
サーバーの詳細なステータス情報を取得します。

**レスポンス:**
```json
{
    "status": "OK",
    "runtime": "Bun",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "oprf": {
        "initialized": true
    }
}
```

#### POST /upload-binary
バイナリデータをOPRFプロトコルで処理します。

**リクエスト:**
- Content-Type: `application/octet-stream`
- Body: バイナリデータ

**レスポンス:**
- Content-Type: `application/octet-stream`
- Body: 処理済みバイナリデータ

### エラーレスポンス

すべてのエンドポイントは統一されたエラーレスポンス形式を返します：

```json
{
    "error": "エラーメッセージ",
    "code": "ERROR_CODE",
    "path": "/api/endpoint",
    "method": "GET"
}
```

## 🧪 テスト

```bash
# すべてのテストを実行
bun test

# ウォッチモードでテストを実行
bun test --watch

# 特定のテストファイルを実行
bun test tests/oprf.test.ts
```

### テストカバレッジ

- **SecretKeyLoader**: 6個のテストケース
- **Express Routes**: 5個のテストケース
- **OPRF Functionality**: 7個のテストケース

## 📁 プロジェクト構造

```
jph-back-core/
├── src/
│   ├── config/
│   │   └── swagger.ts         # Swagger OpenAPI設定
│   └── services/
│       ├── OPRFService.ts      # OPRF処理サービス
│       └── ExpressService.ts   # Expressサーバーサービス
├── tests/
│   ├── oprf.test.ts           # OPRF機能テスト
│   ├── express.test.ts        # Expressルートテスト
│   ├── secretLoader.test.ts   # 秘密鍵ローダーテスト
│   ├── setup.ts               # テストセットアップ
│   └── README.md              # テストドキュメント
├── examples/                  # 使用例
├── secrets/
│   └── key.priv               # 秘密鍵ファイル
├── index.ts                   # メインエントリーポイント
├── secretLoader.ts            # 秘密鍵ローダー
├── package.json               # プロジェクト設定
└── README.md                  # このファイル
```

## 🔧 開発

### 開発サーバーの起動

```bash
# 開発モードでサーバーを起動
bun run dev

# 本番モードでサーバーを起動
bun run start
```

### コードの品質チェック

```bash
# TypeScriptの型チェック
bun run tsc --noEmit

# テストの実行
bun test
```

## 🔒 セキュリティ

- 秘密鍵はBase64エンコードされた形式で保存
- 適切なエラーハンドリングによる情報漏洩の防止
- CORS設定によるクロスオリジンリクエストの制御
- リクエストサイズ制限によるDoS攻撃の防止

## 📚 依存関係

### 本番依存関係
- `@cloudflare/voprf-ts`: OPRFプロトコルの実装
- `express`: Webサーバーフレームワーク
- `swagger-jsdoc`: JSDocコメントからOpenAPI仕様を生成
- `swagger-ui-express`: Swagger UIの提供

### 開発依存関係
- `@types/bun`: Bunの型定義
- `@types/express`: Expressの型定義
- `@types/supertest`: Supertestの型定義
- `@types/swagger-jsdoc`: Swagger JSDocの型定義
- `@types/swagger-ui-express`: Swagger UI Expressの型定義
- `supertest`: HTTPテストライブラリ

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

問題が発生した場合や質問がある場合は、GitHubのIssuesページで報告してください。

---

**注意**: このプロジェクトは教育・研究目的で作成されています。本番環境で使用する前に、セキュリティ要件を十分に確認してください。