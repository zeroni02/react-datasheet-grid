import { getObjectData, setObjectData } from '../columns/nestedKeyColumn'

describe('accessRowData', () => {
  const object = {
    a: {
      a1: 2,
      a2: 3,
      a3: {
        x: 4,
        y: [
          { name: 'youji' },
          { name: 'tanaka' }
        ]
      }
    },
    b: 2
  }

  it('should access top-level property', () => {
    expect(getObjectData('b', object)).toBe(2)
  })

  it('should access nested property', () => {
    expect(getObjectData('a.a2', object)).toBe(3)
  })

  it('should access deeply nested property', () => {
    expect(getObjectData('a.a3.x', object)).toBe(4)
  })

  it('should access array element property', () => {
    expect(getObjectData('a.a3.y[0].name', object)).toBe('youji')
    expect(getObjectData('a.a3.y[1].name', object)).toBe('tanaka')
  })

  it('should return undefined for empty path or non-existent property', () => {
    expect(getObjectData('', object)).toBeUndefined()
    expect(getObjectData('c', object)).toBeUndefined()
    expect(getObjectData('not.exist.props', object)).toBeUndefined()
    expect(getObjectData('a.a3.y[3].name', object)).toBeUndefined()
  })
})

describe('setObjectData', () => {
  const object = {
    a: {
      a1: 2,
      a2: 3,
      a3: {
        x: 4,
        y: [
          { name: 'youji' },
          { name: 'tanaka' }
        ]
      }
    },
    b: 2
  }

  it('should overwrite top-level property', () => {
    expect(setObjectData('b', object, 'k')).toEqual({
      a: object.a,
      b: 'k'
    })
  })

  it('should overwrite nested property', () => {
    expect(setObjectData('a.a2', object, 'k')).toEqual({
      a: {
        ...object.a,
        a2: 'k'
      },
      b: 2
    })
  })

  it('should overwrite deeply nested property', () => {
    expect(setObjectData('a.a3.x', object, 'k')).toEqual({
      a: {
        ...object.a,
        a3: {
          ...object.a.a3,
          x: 'k'
        }
      },
      b: 2
    })
  })

  it('should overwrite array element property', () => {
    expect(setObjectData('a.a3.y[0].name', object, 'k')).toEqual({
      a: {
        ...object.a,
        a3: {
          ...object.a.a3,
          y: [
            { name: 'k' },
            { name: 'tanaka' }
          ]
        }
      },
      b: 2
    })
  })

  it('should not change object for empty path or non-existent property', () => {
    expect(setObjectData('', object, 'k')).toEqual(object)
    expect(setObjectData('c', object, 'k')).toEqual(object)
    expect(setObjectData('not.exist.props', object, 'k')).toEqual(object)
    expect(setObjectData('a.a3.y[3].name', object, 'k')).toEqual(object)
  })
})
