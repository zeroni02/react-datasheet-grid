import React, { useState } from 'react'
import {
  checkboxColumn,
  Column,
  DataSheetGrid,
  dateColumn,
  floatColumn,
  keyColumn,
  nestedkeyColumn,
  textColumn,
} from '../../src'
import '../../src/style.css'

type Row = {
  active: boolean
  firstName: string | null
  lastName: string | null
  date: Date | null
  num: number | null
  obj : {
    nested: string
  }
}

function App() {
  const [data, setData] = useState<Row[]>([
    { active: true, firstName: 'Elon', lastName: 'Musk', date: null, num: 1234.56, obj: { nested: 'value1' } },
    { active: false, firstName: 'Jeff', lastName: 'Bezos', date: null, num: -9876.54, obj: { nested: 'value2' } },
  ])

  const columns: Column<Row>[] = [
    {
      ...keyColumn<Row, 'active'>('active', checkboxColumn),
      title: 'Active',
      grow: 0.5,
    },
    {
      ...keyColumn<Row, 'firstName'>('firstName', textColumn),
      title: 'First name',
    },
    {
      ...keyColumn<Row, 'lastName'>('lastName', textColumn),
      title: 'Last name',
      grow: 2,
    },
    {
      ...nestedkeyColumn<Row, 'obj.nested'>( 'obj.nested', textColumn),
      title: 'Nested Key',
      grow: 1,
    },
    {
      ...keyColumn<Row, 'date'>('date', dateColumn),
      title: 'Date',
      grow: 1,
    },
    {
      ...keyColumn<Row, 'num'>('num', floatColumn),
      title: 'Num',
      grow: 1,
    }
  ]

  return (
    <div
      style={{
        margin: '50px',
        padding: '50px',
        maxWidth: '900px',
        background: '#f3f3f3',
      }}
    >
      <DataSheetGrid value={data} onChange={setData} columns={columns} />
    </div>
  )
}

export default App

