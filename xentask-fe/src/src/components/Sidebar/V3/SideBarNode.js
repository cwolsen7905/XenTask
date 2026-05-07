import React from "react";
import { getDescendants } from "@minoru/react-dnd-treeview";
import styles from "./styles.module.css";
import SideBarSpace from "./SideBarSpace";
import SideBarList from "./SideBarList";
import SideBarFolder from "./SideBarFolder";

const TREE_X_OFFSET = 22;

const Node = ({
  node,
  depth,
  isOpen,
  isDropTarget,
  onClick,
  treeData,
  getPipeHeight,
  isDragging
}) => {
  
  const indent = depth * TREE_X_OFFSET;

  const handleToggle = (e) => {
    e.stopPropagation();
    onClick(node.id);
  };


  const renderNodeContent = () => { 
    switch (node.data.type) {
      case "space":
        return <SideBarSpace name={node.text} id={node.id} handleToggle={handleToggle} isDragging={isDragging}/>;
      case "list":
        return <SideBarList name={node.text} id={node.id} parentId={node.parent} parentSpaceId={node.data.parentSpaceId} isDragging={isDragging}/>;
      case "folder":
        return <SideBarFolder name={node.text} id={node.id} parentId={node.parent} handleToggle={handleToggle} isDragging={isDragging}/>;
      default:
        return null;
    }
  };

  return (
    <div
    
      className={`${styles.nodeWrapper} ${
        node.droppable && isDropTarget ? styles.dropTarget : ""
      }`}
      style={{ marginInlineStart: indent }}

    >
        {renderNodeContent()}

    </div>
  );
};

export default Node;