import * as request from 'supertest'
import { init } from './index'

describe('TSLint Server', () => {
    describe('GET Lint Result', () => {
        const config = {
            extends: 'tslint:recommended',
            rules: {
                'array-type': [true, 'array-simple'],
                'arrow-parens': true,
                'no-var-keyword': true,
                'no-unused-variable': [true, { 'ignore-pattern': '^_' }],
                'ordered-imports': [
                    true,
                    { 'import-sources-order': 'lowercase-last', 'named-imports-order': 'lowercase-first' },
                ],
                'trailing-comma': [true, { multiline: 'always', singleline: 'never' }],
                'class-name': true,
                'comment-format': [true, 'check-space'],
                indent: [true, 'spaces'],
                'no-eval': true,
                'no-internal-module': true,
                'no-trailing-whitespace': true,
                'no-unsafe-finally': true,
                'one-line': [true, 'check-open-brace', 'check-whitespace'],
                quotemark: [true, 'double'],
                semicolon: [true, 'always'],
                'triple-equals': [true, 'allow-null-check'],
                'typedef-whitespace': [
                    true,
                    {
                        'call-signature': 'nospace',
                        'index-signature': 'nospace',
                        parameter: 'nospace',
                        'property-declaration': 'nospace',
                        'variable-declaration': 'nospace',
                    },
                ],
                'variable-name': [true, 'ban-keywords'],
                whitespace: [true, 'check-branch', 'check-decl', 'check-operator', 'check-separator', 'check-type'],
            },
            jsRules: { 'triple-equals': [true, 'allow-null-check'], 'arrow-parens': true },
            defaultSeverity: 'warning',
        }
        const postBody = {
            config,
            doc: {
                text: 'let t: Array<string> = new Array<string>();\n\nconsole.log(t);\n',
                uri:
                    'git://github.com/jlangston/dummy-tslint-ext-target?b0a5fad1005935e565820a1cd867d85ba2fdf5dc#test-data/warnings/test.ts',
            },
        }
        let app = null
        let server = null

        beforeAll(() => {
            const { app: application, server: svr } = init(1234)
            app = application
            server = svr
        })

        afterAll(done => {
            server.close()
            done()
        })

        it('Return lint Result', async () => {
            const response = await request(app)
                .post('/')
                .send(postBody)
            expect(response.status).toBe(200)
            expect(response.body.warningCount).toEqual(1)
        })

        it('returns error with missing doc', async () => {
            const response = await request(app)
                .post('/')
                .send({ config })
            expect(response.status).toBe(406)
            expect(response.body).toHaveProperty('error')
        })
    })
})
