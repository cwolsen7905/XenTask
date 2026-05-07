// src/components/Container.js
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

const Container = ({ id, children }) => {
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="container border p-3"
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Container;
