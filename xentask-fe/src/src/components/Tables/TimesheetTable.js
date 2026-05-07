import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faSort, faSortUp, faSortDown, faMagnifyingGlass, faFilter, faTrash, faColumns } from '@fortawesome/free-solid-svg-icons';
import SortableList from '../Draggable/SortableList';
import FilterItem from './components/Filters/FilterItem';
import ModalSidePanel from '../Modal/Body/ModalSidePanel';

import { v4 as uuidv4 } from "uuid";

import {
  //createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

function TaskTable({ 
    tableData = [], 
    columns, 
    rearrangeMenus, 
    callBack, 
    filterDropdownOptions, 
    disableFilter,
    deleteSelected 
}) {

  const [data, setData] = useState(tableData);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnFilterRows, setcolumnFilterRows] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const [rowSelection, setRowSelection] = useState({});

  //console.log(rowSelection);

  //  Handle SidePanel Reference
  const modalSidePanelRef = useRef(null);

  const openPanel = (title) => {

    //  Open Up The Modal If It's Not Already
    if (!(modalSidePanelRef.current.getIsVisible())) {

      modalSidePanelRef.current.openPanel(title);

    }

  };

  // Hide The Modal With Aditional Actions
  const togglePanelVisibility = (title) => {
    modalSidePanelRef.current.toggleVisibility(title);
  };

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: row => row.id || row.hash ,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortingFns: {
      // General Function To Sort Rearrangables By Their Sort Order
      sortRearrangables: (rowA, rowB, key) => {

        const sortOrder = rearrangeMenus[key].map(item => item.id || item.hash);

        const priorityA = sortOrder.indexOf(rowA.original[key]);
        const priorityB = sortOrder.indexOf(rowB.original[key]);

        return priorityA - priorityB;
      }
    },
    autoResetPageIndex: false, //turn off auto reset of pageIndex
    columnResizeMode: "onChange",
    initialState: {
      pagination: {
        pageIndex: pagination.pageIndex, //custom initial page index
        pageSize: 10, //custom default page size
      },
    },
    meta: {
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                ...prev[rowIndex],
                [columnId]: value,
              }
              : row
          )
        ),
    },
  });

  useEffect(() => {

    const newPageIndex = table.getState().pagination.pageIndex;

    setPagination((prevPagination) => ({
      ...prevPagination,
      pageIndex: newPageIndex
    }));

  }, [table.getState().pagination.pageIndex])

  //  Styles For Pinning The Column Header
  const getCommonPinningStyles = column => {

    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
      isPinned === "left" && column.getIsLastColumn("left")
    const isFirstRightPinnedColumn =
      isPinned === "right" && column.getIsFirstColumn("right")

    const style = {

      boxShadow: isLastLeftPinnedColumn
        ? "-4px 0 4px -4px gray inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px gray inset"
          : undefined,
      left: isPinned === "left" ? `${column.getStart("left") - 9}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right") - 9}px` : undefined,
      opacity: isPinned ? 0.95 : 1,
      position: isPinned ? "sticky" : "relative",
      width: column.getSize(),
      backgroundColor: isPinned ? 'var(--bs-border-color)' : 'var(--bs-body-bg)',

    }

    if (isPinned) style.zIndex = 1001;

    return style;
  }

  // 
  const getSortableListItems = (list) => {
    if (callBack) callBack(list);
  }

  //  Adds A New Row For Column Filters
  const addColumnFilter = () => {

    let newColumnFilters = [...columnFilterRows];

    newColumnFilters.push({
      id: uuidv4(),

    });

    setcolumnFilterRows(newColumnFilters);

  }

  const deleteColumnFilter = (id) => {
    // Find the index of the item with the specified id
    const index = columnFilterRows.findIndex(item => item.id === id);

    if (index !== -1) {

      // Create a new array without the item to be deleted
      const newColumnFilterRows = [
        ...columnFilterRows.slice(0, index),
        ...columnFilterRows.slice(index + 1)
      ];


      let _index = columnFilters.findIndex(f => (f.filterItemId == id));

      const _newFilters = [
        ...columnFilters.slice(0, _index),
        ...columnFilters.slice(index + 1)
      ];

      // Update the state with the new array
      setcolumnFilterRows(newColumnFilterRows);
      setColumnFilters(_newFilters);
    }
  };

  const filterColumns = () => {

    setColumnFilters(prev => {

      // Create a copy of the previous filters
      let newFilters = [...prev];

      // Iterate through each item in columnFilterRows
      columnFilterRows.forEach( item => {

        // Remove any existing filter for the current column
        let _index = newFilters.findIndex(f => (f.filterItemId == item.id));

        // Add the new filter for the current item
        if (_index == -1) {

          newFilters.push({
            id: item.column,      // The Accessor ID
            value: { 
                clause: item.clause, 
                value: ( item.value ? item.value : '' )
            },
            filterItemId: item.id
          });

        } else {

          newFilters[_index].value = { 
            clause: item.clause, 
            value: ( item.value ? item.value : '' )
          };

        }

      });

      //console.log(newFilters);
      return newFilters;

    });

  };

  //  Updates The Filter Items With The 
  const onFilterItemChange = (rowId, field, value) => {

    let _newColumnFilters = [...columnFilterRows];
    let _indexToUpdate = _newColumnFilters.findIndex(item => item.id == rowId);
    _newColumnFilters[_indexToUpdate][field] = value;
    setcolumnFilterRows(_newColumnFilters);

  }

  const onFilterChange = (id, value) => {

    setColumnFilters((prev) => {

      const newFilters = prev.filter((f) => f.id !== id).concat({
        id,
        value,
      });

      return newFilters;
    });


  }

  const updatePagination = (table, prevNext = "next") => {

    if (prevNext === 'next') {
      table.nextPage();
    } else {
      table.previousPage();
    }

  };

  const deleteSelectedTasks = () => {
    
    if( deleteSelected ) {
      deleteSelected(rowSelection);
      setRowSelection({});
    }

  }


  return (
  <>
    <div className="p-2" style={{ overflowX: 'auto' }}>

      {/* Sticky Header For Filter */}
      <div className="row mb-4"
        style={{
          position: "sticky",
          top: 0,
          left: -12,
          zIndex: 1002
        }}
      >
        <div className="col-auto">
          <div className="input-group">
            <input
              className="form-control"
              type="text"
              placeholder="Search for Task"
              aria-label="Search for..."
              onChange={(e) => onFilterChange("title", e.target.value)}
            />
            <button className="btn btn-primary" type="button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>

        {
          !disableFilter && (

            <div className="col-auto">

              <button
                className="btn btn-primary"
                data-bs-toggle="dropdown"
                data-bs-popper-config='{"strategy":"fixed"}'
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                <FontAwesomeIcon icon={faFilter} />
                &nbsp;Filters
              </button>

              {/* Dropdown Menu Filter */}
              <div className="dropdown-menu p-2">

                {/* Filter Settings */}

                <div className="card">


                  <div className="card-header d-flex justify-content-between mb-2 p-2">
                    <h5>Filters</h5>
                    <div>
                      <button className="btn btn-primary btn-sm mx-2" onClick={() => { setcolumnFilterRows([]); setColumnFilters([]); }}>Clear Filters</button>
                      <button className="btn btn-primary btn-sm">Saved Filters</button>
                    </div>
                  </div>


                  <div className="card-body filterDropdownMenu">
                    {columnFilterRows.map((item, index) => (
                      <FilterItem
                        key={item.id}
                        id={item.id}
                        filterDropdownOptions={filterDropdownOptions}
                        deleteItem={deleteColumnFilter}
                        onFilterItemChange={onFilterItemChange}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="mt-2 p-2 card-footer">
                  <button className="btn btn-primary me-2" onClick={addColumnFilter}>Add Filter</button>
                  <button className="btn btn-success me-2" onClick={filterColumns}>Set Filters</button>
                </div>

              </div>

            </div>
          )
        }

        {
            Object.keys(rowSelection).length > 0  &&( 
          <div className="col-auto">
            <button className="btn btn-danger" onClick={deleteSelectedTasks}>Delete Task</button>
          </div>
          )
        }

        {/*
        <div className="col-lg-2">
          <button className="btn btn-primary" type="button" onClick={() => { openPanel('Add New Field') }}>
            <FontAwesomeIcon icon={faColumns} />&nbsp;Columns
          </button>
        </div>
        */}
      </div>

      <table
        className="table table-bordered"
        style={{
          tableLayout: 'fixed',
          width: table.getTotalSize(),
        }}
      >
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {

                const { column } = header

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}

                    style={{ ...getCommonPinningStyles(column) }}
                  >
                    <div className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}{' '}

                      {!header.isPlaceholder && header.column.getCanPin() && (
                        header.column.getIsPinned() !== 'left' ? (
                          <button
                            className="btn btn-outline-secondary btn-sm border-0"
                            onClick={() => {
                              header.column.pin('left')
                            }}
                          >
                            <FontAwesomeIcon icon={faThumbtack} />
                          </button>
                        ) : null
                      )}

                      {
                        header.column.getCanSort() && (
                          (column.columnDef.type == 'dropdown' && !column.columnDef.disableReArrange) ? (
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {header.column.getIsSorted() === 'asc' && <FontAwesomeIcon icon={faSortUp} />}
                                {header.column.getIsSorted() === 'desc' && <FontAwesomeIcon icon={faSortDown} />}
                                {!header.column.getIsSorted() && <FontAwesomeIcon icon={faSort} />}</button>

                              <button type="button"
                                className="btn btn-outline-secondary btn-sm dropdown-toggle dropdown-toggle-split"
                                data-bs-toggle="dropdown"
                                data-bs-auto-close="outside"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >

                                <span className="sr-only">Toggle Dropdown</span>

                              </button>
                              <div className="dropdown-menu">
                                <SortableList items={rearrangeMenus[column.id || column.hash]} callBack={getSortableListItems} keyRef={column.id || column.hash} />
                              </div>
                            </div>
                          ) : (
                            <button className="btn btn-outline-secondary btn-sm border-0"
                              onClick={header.column.getToggleSortingHandler()}>
                              {header.column.getIsSorted() === 'asc' && <FontAwesomeIcon icon={faSortUp} />}
                              {header.column.getIsSorted() === 'desc' && <FontAwesomeIcon icon={faSortDown} />}
                              {!header.column.getIsSorted() && <FontAwesomeIcon icon={faSort} />}
                            </button>
                          )
                        )
                      }

                      {header.column.getIsPinned() ? (
                        <button
                          className="btn btn-danger btn-sm border-0"
                          onClick={() => {
                            header.column.pin(false)
                          }}
                        >
                          ×
                        </button>
                      ) : null}
                    </div>

                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''
                          }`,
                      }}
                    />

                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => {
                const { column } = cell
                return (
                  <td
                    key={cell.id}
                    //IMPORTANT: This is where the magic happens!
                    style={{ ...getCommonPinningStyles(column) }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>

        {/*}
      <tfoot>
        {table.getFooterGroups().map(footerGroup => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map(header => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>*/}
      </table>

      <p className="mb-2">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </p>

      <div className="btn-group btn-group-sm" role="group" aria-label="Pagination mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => updatePagination(table, 'prev')}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => updatePagination(table, 'next')}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
      </div>

    </div>

    <ModalSidePanel ref={modalSidePanelRef}>
      <div>Placeholder</div>
    </ModalSidePanel>

  </>
  )

}

export default TaskTable;
