import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { type Application } from 'express';

/**
 * Swagger OpenAPI設定
 * 
 * APIドキュメントの生成とSwagger UIの設定を行います。
 */

// Swagger設定オプション
const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OPRF Server API',
            version: '1.0.0',
            description: 'Oblivious Pseudorandom Function (OPRF) サーバーのAPIドキュメント',
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '開発サーバー'
            }
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'エラーメッセージ'
                        },
                        code: {
                            type: 'string',
                            description: 'エラーコード'
                        },
                        path: {
                            type: 'string',
                            description: 'リクエストパス（404エラーの場合）'
                        },
                        method: {
                            type: 'string',
                            description: 'HTTPメソッド（404エラーの場合）'
                        }
                    }
                },
                StatusResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'OK'
                        },
                        runtime: {
                            type: 'string',
                            example: 'Bun'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        oprf: {
                            type: 'object',
                            properties: {
                                initialized: {
                                    type: 'boolean',
                                    example: true
                                }
                            }
                        }
                    }
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'OPRF Server is running! 🚀'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        version: {
                            type: 'string',
                            example: '1.0.0'
                        }
                    }
                }
            },
            responses: {
                BadRequest: {
                    description: '不正なリクエスト',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Binary data is missing or empty.',
                                code: 'MISSING_DATA'
                            }
                        }
                    }
                },
                NotFound: {
                    description: 'エンドポイントが見つかりません',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Endpoint not found',
                                path: '/api/nonexistent',
                                method: 'GET'
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: '内部サーバーエラー',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Internal server error during OPRF processing.',
                                code: 'OPRF_ERROR'
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'ヘルスチェック関連のエンドポイント'
            },
            {
                name: 'OPRF',
                description: 'OPRF処理関連のエンドポイント'
            },
            {
                name: 'Error',
                description: 'エラー関連のエンドポイント'
            }
        ]
    },
    apis: [
        './src/services/ExpressService.ts' // パスを指定してJSDocコメントを読み込み
    ]
};

// Swagger仕様を生成
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * ExpressアプリケーションにSwagger UIを設定します
 * 
 * @param app Expressアプリケーションインスタンス
 */
export function setupSwagger(app: Application): void {
    // Swagger UIの設定
    const swaggerUiOptions = {
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info .title { color: #3b82f6; }
        `,
        customSiteTitle: 'OPRF Server API Documentation',
        customfavIcon: '/favicon.ico'
    };

    // Swagger UIをマウント
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

    // JSON形式の仕様書も提供
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📚 Swagger UI: http://localhost:3000/api-docs');
    console.log('📄 API Spec: http://localhost:3000/api-docs.json');
}

export { swaggerSpec };