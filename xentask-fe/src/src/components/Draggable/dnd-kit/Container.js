import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
//import clsx from "clsx"
//import { Button } from "../Button"

const Container = ( { className, id, children, title, description, onAddItem, hasHandle=false, hasAddButton=true, hasTitle=true } ) => {
  
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,
    data: { type: "container" }
  })

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform)
      }}
      className={className}
    >

      <div className="flex items-center justify-between">
        {
          hasTitle && (
          <div className="flex flex-col gap-y-1">
            <label className="form-label fs-5"><u>{title}</u></label>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
          )
        }
        {
          hasHandle && (
            <button
            className="border p-2 text-xs rounded-xl shadow-lg hover:shadow-xl"
            {...listeners}
            >
            Drag Handle
            </button>
            )
        }
      </div>

      {children}

      {
        hasAddButton && (
          <button type="button" className="btn btn-outline-success mt-2" onClick={onAddItem}>Add Option</button>
        )
      }
      

    </div>
  )
}

export default Container

/* clsx(
        "w-full h-full p-4 bg-gray-50 rounded-xl flex flex-col gap-y-4",
        isDragging && "opacity-50"
      )
 */