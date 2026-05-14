import React from 'react'

export default function ShowData({setLimit, limit=10}) {
    const handleLimitChange = (e)=>{
        setLimit(e.target.value)
      }
  return (
  <div className="show-data-selector">
    <label className='show-data-label'>Show</label>
    <select onChange={handleLimitChange} className="show-data-select" value={limit}>
        <option value={2}>2</option>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
    </select>
    <label className='show-data-label'>Rows</label>
  </div>
  )
}
