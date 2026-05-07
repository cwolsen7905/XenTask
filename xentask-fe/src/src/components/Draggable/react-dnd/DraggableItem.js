// src/components/DraggableItem.js
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const DraggableItem = ({ id, content, index }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="draggable-item bg-light p-2 mb-2"
        >
          {content}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableItem;