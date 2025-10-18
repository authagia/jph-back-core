# 開発者ガイド

このドキュメントは、OPRF Serverプロジェクトの開発者向けの詳細な情報を提供します。

## 🏗️ アーキテクチャ

### プロジェクト構造

```
src/
├── config/
│   └── swagger.ts         # Swagger OpenAPI設定
└── services/
    ├── OPRFService.ts     # OPRF処理のコアロジック
    └── ExpressService.ts  # Expressサーバーの管理
```

### 主要コンポーネント

#### OPRFService
- **責任**: OPRFプロトコルの実装と管理
- **主要メソッド**:
  - `initialize()`: サービスと秘密鍵の初期化
  - `evaluate()`: データの評価処理
  - `isReady()`: 初期化状態の確認

#### ExpressService
- **責任**: HTTPサーバーの管理とルーティング
- **主要メソッド**:
  - `initialize()`: サービスの初期化
  - `start()`: サーバーの起動
  - `setupRoutes()`: ルートの設定
  - `setupMiddleware()`: ミドルウェアの設定

## 🔧 開発環境のセットアップ

### 必要なツール

```bash
# Bunのインストール
curl -fsSL https://bun.sh/install | bash

# プロジェクトのクローン
git clone <repository-url>
cd jph-back-core

# 依存関係のインストール
bun install
```

### 環境変数

```bash
# .envファイルの作成（オプション）
PORT=3000
NODE_ENV=development
```

## 🧪 テスト

### テストの実行

```bash
# すべてのテストを実行
bun test

# ウォッチモード
bun test --watch

# 特定のテストファイル
bun test tests/oprf.test.ts

# カバレッジレポート
bun test --coverage
```

### テスト構造

```
tests/
├── setup.ts              # テストセットアップ
├── oprf.test.ts          # OPRF機能テスト
├── express.test.ts       # Expressルートテスト
└── secretLoader.test.ts  # 秘密鍵ローダーテスト
```

### テストの書き方

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { OPRFService } from '../src/services/OPRFService';

describe('OPRFService', () => {
    let oprfService: OPRFService;

    beforeEach(async () => {
        oprfService = new OPRFService('./secrets/key.priv');
        await oprfService.initialize();
    });

    it('should initialize correctly', () => {
        expect(oprfService.isReady()).toBe(true);
    });
});
```

## 📚 API ドキュメント

### Swagger OpenAPI

プロジェクトはSwagger OpenAPI 3.0を使用してAPIドキュメントを自動生成します。

#### ドキュメントの更新

1. **JSDocコメントの追加**:
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: エンドポイントの説明
 *     description: 詳細な説明
 *     tags: [TagName]
 *     responses:
 *       200:
 *         description: 成功レスポンス
 */
```

2. **スキーマの定義**:
```typescript
// swagger.ts内で定義
components: {
    schemas: {
        MyResponse: {
            type: 'object',
            properties: {
                message: { type: 'string' }
            }
        }
    }
}
```

#### ドキュメントの確認

- **Swagger UI**: http://localhost:3000/api-docs/
- **JSON仕様書**: http://localhost:3000/api-docs.json

## 🔒 セキュリティ

### 秘密鍵の管理

```typescript
// 秘密鍵の生成（開発用）
const key = generatePrivateKey();
const base64Key = Buffer.from(key).toString('base64');
fs.writeFileSync('./secrets/key.priv', base64Key);
```

### セキュリティベストプラクティス

1. **秘密鍵の保護**:
   - 本番環境では環境変数を使用
   - ファイル権限の適切な設定
   - バージョン管理からの除外

2. **入力検証**:
   - リクエストサイズの制限
   - データ形式の検証
   - エラーメッセージの適切な処理

3. **CORS設定**:
   - 本番環境では適切なオリジンの設定
   - 不要なHTTPメソッドの制限

## 🚀 デプロイメント

### 本番環境での設定

```bash
# 環境変数の設定
export NODE_ENV=production
export PORT=3000

# 秘密鍵の設定
export PRIVATE_KEY_PATH=/path/to/production/key.priv

# サーバーの起動
bun run start
```

### Docker化

```dockerfile
FROM oven/bun:1

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
EXPOSE 3000

CMD ["bun", "run", "start"]
```

## 🐛 デバッグ

### ログの確認

```typescript
// デバッグログの有効化
console.log('Debug info:', debugData);

// エラーログの記録
console.error('Error occurred:', error);
```

### よくある問題

1. **OPRF初期化エラー**:
   - 秘密鍵ファイルの存在確認
   - ファイル形式の確認（Base64エンコード）

2. **ポート競合**:
   - 使用中のポートの確認
   - 環境変数PORTの設定

3. **依存関係エラー**:
   - `bun install`の再実行
   - キャッシュのクリア

## 📝 コーディング規約

### TypeScript

- 厳密な型定義の使用
- インターフェースの適切な定義
- エラーハンドリングの統一

### コメント

- 日本語でのコメント記述
- JSDoc形式での関数説明
- 複雑なロジックの説明

### ファイル命名

- PascalCase: クラス名
- camelCase: 関数・変数名
- kebab-case: ファイル名

## 🔄 継続的インテグレーション

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
```

## 📞 サポート

開発に関する質問や問題がある場合は、以下に連絡してください：

- GitHub Issues: バグレポートや機能要求
- ドキュメント: このファイルやREADME.md
- コードレビュー: プルリクエストでの議論

---

**注意**: このドキュメントは開発者向けの詳細情報を含んでいます。本番環境での使用前に、セキュリティ要件を十分に確認してください。
