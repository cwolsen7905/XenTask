import { useState, useEffect, useRef } from 'react';

import SortableList from '../Draggable/SortableList';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbtack,
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';



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
  columnFilters,
  setRowSelection,
  rowSelection,
  updateRearrangeMenus,
  columnVisibility = {},

}) {

  const [data, setData] = useState(tableData);

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      rowSelection,
      columnVisibility,

    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: row => row.id || row.hash,
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

  const getSortableListItems = (list) => {
    updateRearrangeMenus(list);
  }

  const updatePagination = (table, prevNext = "next") => {

    if (prevNext === 'next') {
      table.nextPage();
    } else {
      table.previousPage();
    }

  };






  return (
    <>
      <div className="p-2" style={{ overflowX: 'auto' }}>


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


    </>
  )

}

export default TaskTable;
