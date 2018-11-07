import * as express from 'express'
import * as asyncHandler from 'express-async-handler'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as stringify from 'json-stringify-safe';
import { Linter, LintResult, Configuration } from 'tslint'
import { RawConfigFile } from 'tslint/lib/configuration'

interface TextDocument {
    uri: string
    text: string
}

async function lint(doc: TextDocument, config: RawConfigFile): Promise<LintResult> {
    const options = {
        fix: false,
        formatter: 'json',
    }
    const linter = new Linter(options)
    const configuration = Configuration.parseConfigFile(config)
    linter.lint(doc.uri, doc.text, configuration)
    const result = linter.getResult()
    return stringify(result)
}

function init() {
    const app = express()
    app.use(bodyParser.json({ limit: '10mb' }))
    app.use(cors())
    app.post(
        '/',
        asyncHandler(async (req, res) => {
            if (req.body.doc && req.body.config) {
                res.send(await lint(req.body.doc, req.body.config))
            } else {
                res.send({
                    error: 'Missing document or configuration',
                })
            }
        })
    )
    app.listen(2345, () => {
        console.log('Listening for HTTP requests on port 2345')
    })
}

init()
