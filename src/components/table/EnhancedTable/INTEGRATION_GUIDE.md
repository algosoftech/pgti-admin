# EnhancedTable Component - Integration Guide

## 🎯 Overview

This guide shows you how to convert any existing list page to use the **EnhancedTable** component with all 11 TanStack features.

---

## 📦 List Pages to Enhance

✅ **Already Enhanced:**
- `src/pages/Admin/products/List.jsx`

⏳ **To Be Enhanced:**
1. `src/pages/Admin/categories/List.jsx`
2. `src/pages/Admin/subCategories/List.jsx`
3. `src/pages/Admin/users/List.jsx`
4. `src/pages/Admin/productVariants/List.jsx`
5. `src/pages/Admin/Accounts/List.jsx`

---

## 🔧 Integration Steps

### Step 1: Import the Enhanced Table

```javascript
import EnhancedTable from "../../../components/EnhancedTable/EnhancedTable";
import { useMemo } from "react"; // If not already imported
```

### Step 2: Define Your Columns

Convert your table structure to column definitions:

```javascript
const columns = useMemo(
  () => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          style={{ cursor: 'pointer' }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          style={{ cursor: 'pointer' }}
        />
      ),
      size: 50,
      enableSorting: false,
      enableResizing: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: 'index',
      header: '#',
      cell: ({ row }) => row.index + SKIP + 1,
      size: 60,
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => <div className="font-weight-600">{getValue()}</div>,
      size: 200,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      accessorFn: (row) => row.status === "A" ? "Active" : "Inactive",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
          {row.original.status === "A" ? "Active" : "Inactive"}
        </span>
      ),
      size: 100,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      accessorFn: (row) => moment(row.created_at).format("MMM DD, YYYY HH:mm"),
      cell: ({ row }) => (
        <>
          <div className="text-muted">{moment(row.original.created_at).format("MMM DD, YYYY")}</div>
          <div className="text-muted small">{moment(row.original.created_at).format("HH:mm")}</div>
        </>
      ),
      size: 120,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original;
        return (PERMISSION?.add_edit === "Y" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y") ? (
          <div className="action-dropdown">
            <Dropdown overlay={() => dropdownMenu(item)} placement="bottomRight" trigger={['click']}>
              <button className="action-dropdown-trigger">
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
            </Dropdown>
          </div>
        ) : (
          <span className="text-muted">--</span>
        );
      },
      size: 100,
      enableSorting: false,
      enableResizing: false,
      enableGlobalFilter: false,
    },
  ],
  [SKIP, PERMISSION]
);
```

### Step 3: Set Up Server-Side Column Filters

```javascript
const [serverColumnFilters, setServerColumnFilters] = useState({
  name: "",
  status: "",
  // Add other filterable columns
});

// Debounce effect for server-side filters
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    if (currentPage !== 1) {
      dispatch(setCurrentPage(1));
    } else {
      getList();
    }
  }, 500);

  return () => clearTimeout(debounceTimer);
}, [serverColumnFilters]);

// Update getList() to include server filters
const getList = () => {
  const options = {
    type: "",
    condition: {
      ...(serverColumnFilters.name ? { name: serverColumnFilters.name } : null),
      ...(serverColumnFilters.status ? { statusSearch: serverColumnFilters.status } : null),
      ...(showRequest ? { status: showRequest } : null),
    },
    skip: SKIP ? SKIP : 0,
    limit: LIMIT ? LIMIT : 10,
  };
  dispatch(fetchYourList(options));
};
```

### Step 4: Replace Table HTML with EnhancedTable Component

```javascript
<EnhancedTable
  // Data
  data={ALLLISTDATA}
  columns={columns}
  isLoading={isLoading}
  
  // Pagination
  currentPage={currentPage}
  totalPages={TOTALPAGES}
  limit={LIMIT}
  skip={SKIP}
  count={count}
  onPageChange={(page) => {
    dispatch(setCurrentPage(page));
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  }}
  onLimitChange={(newLimit) => {
    dispatch(setLimit(Number(newLimit)));
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  }}
  
  // Server-side filters
  serverColumnFilters={serverColumnFilters}
  onServerColumnFiltersChange={setServerColumnFilters}
  
  // Callbacks
  onRefresh={getList}
  
  // Permissions
  permission={PERMISSION}
  
  // Empty state
  emptyStateMessage="No items found"
  activeTab={activeTab}
  
  // Ref
  targetRef={targetRef}
/>
```

### Step 5: Remove Old Code

Remove these from your list component:
- ❌ Old table HTML (`<table>`, `<thead>`, `<tbody>`)
- ❌ Old pagination (MUI Pagination)
- ❌ Filter drawer (if using new column filters)
- ❌ `inputRef1-4` (if only used for filter drawer)
- ❌ `handlePageChange` function
- ❌ Manual map over `ALLLISTDATA`

---

## 📋 Example: Categories List Integration

### Before (Old Code):

```javascript
export default function CategoryList() {
  // ... all the state and handlers ...
  
  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Categories" />
        
        <div className="content-card">
          <div className="tabs-header">
            {/* tabs code */}
          </div>
          
          <div className="content-card-body">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ALLLISTDATA?.map((item, index) => (
                  <tr key={index}>
                    <td>{index + SKIP + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.status}</td>
                    <td>{/* actions */}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <Pagination count={TOTALPAGES} page={currentPage} onChange={handlePageChange} />
          </div>
        </div>
      </div>
    </>
  );
}
```

### After (With EnhancedTable):

```javascript
import EnhancedTable from "../../../components/EnhancedTable/EnhancedTable";
import { useMemo } from "react";

export default function CategoryList() {
  // ... existing state ...
  
  // Add server filters
  const [serverColumnFilters, setServerColumnFilters] = useState({
    name: "",
    status: "",
  });
  
  // Define columns
  const columns = useMemo(() => [
    // ... column definitions from Step 2 ...
  ], [SKIP, PERMISSION]);
  
  // Debounce server filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) dispatch(setCurrentPage(1));
      else getList();
    }, 500);
    return () => clearTimeout(timer);
  }, [serverColumnFilters]);
  
  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Categories" />
        
        <div className="content-card-body">
          <EnhancedTable
            data={ALLLISTDATA}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={TOTALPAGES}
            limit={LIMIT}
            skip={SKIP}
            count={count}
            onPageChange={(page) => {
              dispatch(setCurrentPage(page));
              targetRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={(newLimit) => dispatch(setLimit(Number(newLimit)))}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            permission={PERMISSION}
            emptyStateMessage="No categories found"
            activeTab={activeTab}
          />
        </div>
      </div>
    </>
  );
}
```

---

## 🎯 Column Definition Templates

### Basic Text Column
```javascript
{
  accessorKey: 'name',
  header: 'Name',
  cell: ({ getValue }) => <div className="font-weight-600">{getValue()}</div>,
  size: 200,
  enableSorting: true,
  enableColumnFilter: true,
}
```

### Status Column
```javascript
{
  accessorKey: 'status',
  header: 'Status',
  accessorFn: (row) => row.status === "A" ? "Active" : "Inactive",
  cell: ({ row }) => (
    <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
      {row.original.status === "A" ? "Active" : "Inactive"}
    </span>
  ),
  size: 100,
  enableSorting: true,
  enableColumnFilter: true,
}
```

### Date Column
```javascript
{
  accessorKey: 'created_at',
  header: 'Created',
  accessorFn: (row) => moment(row.created_at).format("MMM DD, YYYY HH:mm"),
  cell: ({ row }) => (
    <>
      <div className="text-muted">{moment(row.original.created_at).format("MMM DD, YYYY")}</div>
      <div className="text-muted small">{moment(row.original.created_at).format("HH:mm")}</div>
    </>
  ),
  size: 120,
  enableSorting: true,
}
```

### Image Column
```javascript
{
  accessorKey: 'image',
  header: 'Image',
  cell: ({ getValue, row }) => {
    const image = getValue();
    return image ? (
      <img
        src={`${process.env.REACT_APP_IMAGE_BASE_URL}${image}`}
        alt={row.original?.name}
        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
      />
    ) : (
      <span className="text-muted">No Image</span>
    );
  },
  size: 100,
  enableSorting: false,
  enableGlobalFilter: false,
}
```

### Relation Column (Category, Product, etc.)
```javascript
{
  accessorKey: 'category',
  header: 'Category',
  accessorFn: (row) => getCategoryName(row.category), // Use helper function
  cell: ({ getValue }) => <div className="font-weight-500">{getValue()}</div>,
  size: 150,
  enableSorting: true,
  enableColumnFilter: true,
}
```

---

## 📝 Quick Checklist for Each List Page

- [ ] Import EnhancedTable component
- [ ] Import useMemo from React
- [ ] Define columns array with useMemo
- [ ] Add serverColumnFilters state
- [ ] Add debounce useEffect for server filters
- [ ] Update getList() to use server filters
- [ ] Replace table HTML with <EnhancedTable />
- [ ] Pass all required props
- [ ] Remove old pagination
- [ ] Remove filter drawer (optional)
- [ ] Test all features

---

## 🎁 What You Get

By using EnhancedTable, each list page automatically gets:

1. ✅ Column Sorting (client-side)
2. ✅ Column Resizing  
3. ✅ Column Reordering
4. ✅ Row Selection with checkboxes
5. ✅ Virtual Scrolling
6. ✅ Global Search (instant)
7. ✅ Column Filters (server-side)
8. ✅ Toggle Column Filters button
9. ✅ TanStack Pagination (server-side)
10. ✅ Column Pinning
11. ✅ Fullscreen Mode

---

## 💡 Tips

1. **Use `accessorFn`** for:
   - Computed values (status text)
   - Related data (category names from IDs)
   - Formatted dates
   - Any non-direct field access

2. **Set `enableGlobalFilter: false`** for:
   - Checkbox column
   - Index column (#)
   - Image columns
   - Action buttons

3. **Set `enableColumnFilter: true`** for:
   - Text fields
   - Status fields
   - Any searchable column

4. **Column Sizes:**
   - Checkbox: 50px
   - Index: 60px
   - Short text: 100-120px
   - Medium text: 150-200px
   - Long text: 250-300px
   - Actions: 100px

---

## 🚀 Benefits of Reusable Component

✅ **Consistency** - All tables look and behave the same  
✅ **Maintainability** - Update once, affects all tables  
✅ **Less Code** - 50-100 lines vs 1400 lines per page  
✅ **Faster Development** - Just define columns  
✅ **Bug Fixes** - Fix once, all tables fixed  
✅ **New Features** - Add once, all tables get it  

---

## 📊 Estimated Time per Page

- **Manual Implementation:** 2-3 hours per page
- **Using EnhancedTable:** 15-30 minutes per page

**Total Time Saved:** 10-15 hours for 5 pages!

---

## 🎯 Next Steps

1. Review the EnhancedTable component
2. Start with one simple page (categories)
3. Test all features
4. Apply to remaining pages
5. Enjoy consistent, feature-rich tables across your app!

---

Ready to get started? Let me know which page you'd like to convert first, or I can do them all for you!

