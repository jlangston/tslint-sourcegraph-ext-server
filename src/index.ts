import * as express from 'express'
import * as asyncHandler from 'express-async-handler'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
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
    // Remove sourcFile from failures to reduce bloat over the wire that isn't used yet
    // As well as removing need for circular JSON
    if (result && Array.isArray(result.failures)) {
        for (const failure of result.failures) {
            delete (failure as any).sourceFile
        }
    }
    return result
}

export function init(port = 2345) {
    const app = express()
    app.use(bodyParser.json({ limit: '10mb' }))
    app.use(cors())
    app.post(
        '/',
        asyncHandler(async (req, res) => {
            if (req.body.doc && req.body.config) {
                res.send(await lint(req.body.doc, req.body.config))
            } else {
                res.status(406).send({
                    error: 'Missing document or configuration',
                })
            }
        })
    )
    const server = app.listen(port, () => {
        console.log(`Listening for HTTP requests on port ${port}`)
    })
    return { app, server }
}

init()
