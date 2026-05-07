import { useState, useEffect } from 'react';

import {
  //createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';


function Tables({ tableData, columns }) {

  const [data, setData] = useState(tableData);

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      //columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
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

  return (
    <div className="p-2">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>

              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                  {
                    header.column.getCanSort() && (
                        <button className="btn btn-outline-secondary btn-sm border-0"
                          onClick={header.column.getToggleSortingHandler()}>
                          {header.column.getIsSorted() === 'asc' && <FontAwesomeIcon icon={faSortUp} />}
                          {header.column.getIsSorted() === 'desc' && <FontAwesomeIcon icon={faSortDown} />}
                          {!header.column.getIsSorted() && <FontAwesomeIcon icon={faSort} />}
                        </button>
                      
                    )
                  }
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/*<tfoot>
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


    </div>
  )
}

export default Tables;