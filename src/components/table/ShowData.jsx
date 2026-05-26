import React, { useEffect, useRef } from 'react'
import {
  getPreferredPageSize,
  PREFERENCES_CHANGED_EVENT,
} from 'utils/preferences';

export default function ShowData({setLimit, limit=10}) {
    const hasAppliedPreferredLimit = useRef(false);

    useEffect(() => {
        if (typeof setLimit !== 'function') return undefined;

        const applyPreferredLimit = () => {
            const preferredLimit = getPreferredPageSize();
            if (Number(limit) !== preferredLimit) {
                hasAppliedPreferredLimit.current = true;
                setLimit(preferredLimit);
            }
        };

        if (!hasAppliedPreferredLimit.current) {
            applyPreferredLimit();
        }

        window.addEventListener(PREFERENCES_CHANGED_EVENT, applyPreferredLimit);
        return () => {
            window.removeEventListener(PREFERENCES_CHANGED_EVENT, applyPreferredLimit);
        };
    }, [limit, setLimit]);

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
