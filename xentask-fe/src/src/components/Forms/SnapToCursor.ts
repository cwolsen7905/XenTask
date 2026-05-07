import { Modifier } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';

export const snapToCursor: Modifier = ({ 
  activatorEvent, 
  draggingNodeRect, 
  transform 
}) => {
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);

    if (!activatorCoordinates) {
      return transform;
    }

    // Calculate the offset between the mouse and the item's position
    const offsetX = activatorCoordinates.x - draggingNodeRect.left;
    const offsetY = activatorCoordinates.y - draggingNodeRect.top;

    // Snap the item to the cursor, no additional offsets (no centering)
    return {
      ...transform,
      x: transform.x + offsetX,
      y: transform.y + offsetY,
    };
  }

  return transform;
};
