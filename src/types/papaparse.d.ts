declare module 'papaparse' {
  interface ParseResult<T> {
    data: T[]
    errors: any[]
    meta: any
  }

  interface ParseConfig {
    delimiter?: string
    newline?: string
    quoteChar?: string
    escapeChar?: string
    header?: boolean
    transformHeader?: (header: string) => string
    dynamicTyping?: boolean
    preview?: number
    encoding?: string
    worker?: boolean
    comments?: string | boolean
    step?: (results: ParseResult<any>, parser: any) => void
    complete?: (results: ParseResult<any>, file?: File) => void
    error?: (error: any, file?: File) => void
    download?: boolean
    downloadRequestHeaders?: { [key: string]: string }
    downloadRequestBody?: any
    skipEmptyLines?: boolean | 'greedy'
    chunk?: (results: ParseResult<any>, parser: any) => void
    fastMode?: boolean
    beforeFirstChunk?: (chunk: string) => string | void
    withCredentials?: boolean
    transform?: (value: string, field: string | number) => any
    delimitersToGuess?: string[]
  }

  function parse<T = any>(input: string | File, config?: ParseConfig): ParseResult<T>
  function unparse(data: any[], config?: ParseConfig): string
  function unparse(data: any, config?: ParseConfig): string

  export default {
    parse,
    unparse
  }
}
