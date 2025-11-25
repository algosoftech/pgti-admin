import React from 'react'

export default function ShowData({setLimit, limit=10}) {
    const handleLimitChange = (e)=>{
        setLimit(e.target.value)
      }
  return (
  <div className="inventory_filter_div">
    <label className='filter_btn_invontry_rating_review'> Show</label>
    <select onChange={handleLimitChange} className="form-control store_input_field" >
        <option value={2} selected={limit === 2?true:false} >2</option>
        <option value={5} selected={limit === 5?true:false} >5</option>
        <option value={10} selected={limit === 10?true:false} >10</option>
        <option value={20} selected={limit === 20?true:false} >20</option>
        <option value={50} selected={limit === 50?true:false} >50</option>
        <option value={100} selected={limit === 100?true:false} >100</option>
    </select>
    <label className='filter_btn_invontry_rating_review'>Rows</label>
  </div>
  )
}
