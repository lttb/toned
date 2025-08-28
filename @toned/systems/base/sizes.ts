import { defineCssToken } from '../defineCssToken'

const sizeValues = [new Number(), new String()] as const

export const minWidth = defineCssToken('minWidth', sizeValues)
export const maxWidth = defineCssToken('maxWidth', sizeValues)
export const width = defineCssToken('width', sizeValues)
export const height = defineCssToken('height', sizeValues)
export const minHeight = defineCssToken('minHeight', sizeValues)
export const maxHeight = defineCssToken('maxHeight', sizeValues)
