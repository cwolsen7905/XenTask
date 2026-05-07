import { useState, useEffect, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faThumbtack,
  faSort,
  faSortUp,
  faSortDown,
  faCheck,
  faTrash,
  faCirclePlus,
  faEllipsisV
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

function DataTable({

  tableData = [],
  columns,
  columnFilters,
  setRowSelection,
  rowSelection,
  columnVisibility = {},
  addNewRow,
  deleteColumn,
  toggleAddRow,
  addingRow

}) {

  const [data, setData] = useState([]);

  const [newRowData, setNewRowData] = useState({});

  const handleInputChange = (event, accessorKey) => {
    setNewRowData(prev => ({
      ...prev,
      [accessorKey]: event.target.value,
    }));
  };

  const handleSaveRow = async () => {

    let _res = await addNewRow(newRowData);

    if (_res) {

      toggleAddRow(!addingRow);
      setNewRowData({});

    } else {

    }

  };


  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  //  Update Table Data
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
    initialState: {
      columnPinning: {
        right: ['actions'],
      },
      //...
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: row => row._id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

    const isPinned = column.getIsPinned();

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
            {table.getHeaderGroups().map((headerGroup, index, array) => (
              <tr key={headerGroup.id}>

                {headerGroup.headers.map(header => {

                  const { column } = header;

                  return (
                    <th key={header.id} colSpan={header.colSpan} style={{ ...getCommonPinningStyles(column) }}>

                      <div className="d-flex align-items-center">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}{' '}

                        {!header.isPlaceholder && header.column.getCanPin() &&
                          (header.column.getIsPinned() !== 'left' ? (
                            <button className="btn btn-outline-secondary btn-sm border-0" onClick={() => header.column.pin('left')}>
                              <FontAwesomeIcon icon={faThumbtack} />
                            </button>
                          ) : null)
                        }

                        {header.column.getCanSort() && (
                          <button className="btn btn-outline-secondary btn-sm border-0" onClick={header.column.getToggleSortingHandler()}>
                            {header.column.getIsSorted() === 'asc' && <FontAwesomeIcon icon={faSortUp} />}
                            {header.column.getIsSorted() === 'desc' && <FontAwesomeIcon icon={faSortDown} />}
                            {!header.column.getIsSorted() && <FontAwesomeIcon icon={faSort} />}
                          </button>
                        )}

                        {/* Column Option */}
                        {header.column.columnDef.meta.hasOptions && (
                          <div class="dropdown">
                            <button type="button" className="btn btn-outline-secondary btn-sm border-0" data-bs-toggle="dropdown" aria-expanded="false">
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                            <ul class="dropdown-menu">
                              {header.column.columnDef.meta.canDelete && (
                                <li><button type="button" class="dropdown-item" onClick={()=>deleteColumn(header.id)}>Delete Column</button></li>
                              )}
                              <li><button type="button" class="dropdown-item">Lock Column</button></li>
                            </ul>

                          </div>
                        )}


                        {header.column.getIsPinned() && (
                          <button className="btn btn-danger btn-sm border-0" onClick={() => header.column.pin(false)}>
                            ×
                          </button>
                        )}

                      </div>

                      <div
                        {...{
                          onDoubleClick: () => header.column.resetSize(),
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`,
                        }}
                      />
                    </th>
                  );
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

            <tr>

              { addingRow && (

                table.options.columns.map((column, index) => {
                  if (index !== 0 && index !== table.options.columns.length - 1) {
                    return (
                      <td key={index}>
                        <input
                          className="form-control"
                          value={newRowData[column.accessorKey] || ''}
                          onChange={(e) => handleInputChange(e, column.accessorKey)}
                        />
                      </td>
                    );
                  } else if (index === table.options.columns.length - 1) {
                    return (
                      <td key={index}>
                        <button className='btn btn-success' onClick={handleSaveRow}>
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          className='btn btn-danger'
                          onClick={() => {
                            toggleAddRow(!addingRow);
                            setNewRowData({})
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    );
                  } else if (index === 0) {
                    return (
                      <td key={index}>

                        <button
                          className='btn btn-danger'
                          onClick={() => {
                            toggleAddRow(!addingRow);
                            setNewRowData({})
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    );

                  } else {
                    return <td key={index}></td>;
                  }
                })

              )}
            </tr>
          </tbody>

          {/*

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

export default DataTable;
