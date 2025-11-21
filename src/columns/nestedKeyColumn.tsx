import React, { useCallback, useMemo, useRef } from 'react'
import { CellComponent, Column } from '../types'
import { cloneDeep } from 'es-toolkit';


type ColumnData = { key: string; original: Partial<Column<any, any, any>> }

/**
 * Utility function to access nested properties of an object using a dot-separated path
 * @param path ("name", "address.street", "address.street.name")
 * @param obj any object
 * @returns value at the path, or undefined if not found
 */
export const getObjectData = (path: string, obj: any): any => {
  if (!path) return undefined
  const keys = path.split('.').map(k => {
    const arrMatch = k.match(/(\w+)\[(\d+)\]/)
    if (arrMatch) {
      return { key: arrMatch[1], index: parseInt(arrMatch[2], 10) }
    }
    return { key: k }
  })
  let current = obj
  for (let i = 0; i < keys.length; i++) {
    const { key, index } = keys[i]
    if (current == null) return undefined
    if (typeof index === 'number') {
      if (!Array.isArray(current[key])) return undefined
      current = current[key][index]
    } else {
      current = current[key]
    }
  }
  return current
}

/**
 * Utility function to overwrite a property at a dot-separated path in an object, returning a new object
 * @param path ("name", "address.street", "address.street.name")
 * @param obj any object
 * @param value value to set
 * @returns new object with the property overwritten
 */
export const setObjectData = (path: string, obj: any, value: any): any => {
  if (!path) return obj
  const keys = path.split('.').map(k => {
    const arrMatch = k.match(/(\w+)\[(\d+)\]/)
    if (arrMatch) {
      return { key: arrMatch[1], index: parseInt(arrMatch[2], 10) }
    }
    return { key: k }
  })
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj }
  let current = newObj
  for (let i = 0; i < keys.length; i++) {
    const { key, index } = keys[i]
    if (current == null || !(key in current)) return obj
    if (typeof index === 'number') {
      if (!Array.isArray(current[key])) return obj
      current[key] = [...current[key]]
      if (i === keys.length - 1) {
        if (index < 0 || index >= current[key].length) return obj
        current[key][index] = value
      } else {
        if (index < 0 || index >= current[key].length) return obj
        if (typeof current[key][index] !== 'object' || current[key][index] === null) return obj
        current[key][index] = Array.isArray(current[key][index]) ? [...current[key][index]] : { ...current[key][index] }
        current = current[key][index]
      }
    } else {
      if (i === keys.length - 1) {
        current[key] = value
      } else {
        if (typeof current[key] !== 'object' || current[key] === null) return obj
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] }
        current = current[key]
      }
    }
  }
  return newObj
}


const NestedKeyComponent: CellComponent<any, ColumnData> = ({
  columnData: { key, original },
  rowData,
  setRowData,
  ...rest
}) => {
  // We use a ref so useCallback does not produce a new setKeyData function every time the rowData changes
  const rowDataRef = useRef(rowData)
  rowDataRef.current = rowData

  // We wrap the setRowData function to assign the value to the desired key

  const setKeyData = useCallback(
    (value: any) => {
      const base = cloneDeep(rowDataRef.current)
      const result = setObjectData(key, base, value)
      setRowData(result)
    },
    [key, setRowData]
  )
  const keyData = useMemo(() => {
    return getObjectData(key, rowData)
  }, [key, rowData])


  if (!original.component) {
    return <></>
  }

  const Component = original.component

  return (
    <Component
      columnData={original.columnData}
      setRowData={setKeyData}
      rowData={keyData}
      {...rest}
    />
  )
}

export const nestedkeyColumn = <
  T extends Record<string, any>,
  K extends string, // Not key of T because it can be a nested key
  PasteValue = string
>(
  key: K,
  column: Partial<Column<any, any, PasteValue>>
): Partial<Column<T, ColumnData, PasteValue>> => ({
  id: key as string,
  ...column,
  // We pass the key and the original column as columnData to be able to retrieve them in the cell component
  columnData: { key: key as string, original: column },
  component: NestedKeyComponent,

  copyValue: ({ rowData, rowIndex }) =>
    column.copyValue?.({ rowData: getObjectData(key as string, rowData), rowIndex }) ?? null,
  deleteValue: ({ rowData, rowIndex }) => {
    const base = {...rowData}
    const deleteValue = column.deleteValue?.({ rowData: getObjectData(key as string, rowData), rowIndex }) ?? null;
    const results = setObjectData(key as string, base, deleteValue)
    return results;
  },
  pasteValue: ({ rowData, value, rowIndex }) => {
    const base = {...rowData}
    const pasteValue = column.pasteValue?.({ rowData: getObjectData(key as string, rowData), value, rowIndex }) ?? null;
    const results = setObjectData(key as string, base, pasteValue)
    return results;
  },
  disabled:
    typeof column.disabled === 'function'
      ? ({ rowData, rowIndex }) => {
          return typeof column.disabled === 'function'
            ? column.disabled({ rowData: getObjectData(key, rowData), rowIndex })
            : column.disabled ?? false
        }
      : column.disabled,
  cellClassName:
    typeof column.cellClassName === 'function'
      ? ({ rowData, rowIndex, columnId }) => {
          return typeof column.cellClassName === 'function'
            ? column.cellClassName({ rowData: getObjectData(key, rowData), rowIndex, columnId })
            : column.cellClassName ?? undefined
        }
      : column.cellClassName,
  isCellEmpty: ({ rowData, rowIndex }) =>
    column.isCellEmpty?.({ rowData: getObjectData(key, rowData), rowIndex }) ?? false,
})
