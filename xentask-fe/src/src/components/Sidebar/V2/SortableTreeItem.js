import { forwardRef } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import SideBarSpace from './SideBarSpace';
import SideBarList from './SideBarList';
import SideBarFolder from './SideBarFolder';

const animateLayoutChanges = ({ isSorting, wasSorting }) =>
    isSorting || wasSorting ? false : true

const SortableTreeItem = ({ id, name, depth, type, indentationWidth, ...props }) => {

    const {
        attributes,
        isDragging,
        isSorting,
        listeners,
        setDraggableNodeRef,
        setDroppableNodeRef,
        transform,
        transition
    } = useSortable({
        id,
        animateLayoutChanges
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition
    }

    const renderItem = () => {

        switch (type) {

            case ('space'):
                return (
                    <SideBarSpace
                        ref={setDraggableNodeRef}
                        wrapperRef={setDroppableNodeRef}
                        id={id}
                        name={name}
                        style={style}
                        depth={depth}
                        indentationWidth={indentationWidth}
                        handleProps={{
                            ...attributes,
                            ...listeners
                        }}
                        {...props}
                    />
                );


                case ('list'):
                return (
                    <SideBarList
                        ref={setDraggableNodeRef}
                        wrapperRef={setDroppableNodeRef}
                        id={id}
                        name={name}
                        style={style}
                        depth={depth}
                        indentationWidth={indentationWidth}
                        handleProps={{
                            ...attributes,
                            ...listeners
                        }}
                        {...props}
                    />
                );
                case ('folder'):
                    return (
                        <SideBarFolder
                            ref={setDraggableNodeRef}
                            wrapperRef={setDroppableNodeRef}
                            id={id}
                            name={name}
                            style={style}
                            depth={depth}
                            indentationWidth={indentationWidth}
                            handleProps={{
                                ...attributes,
                                ...listeners
                            }}
                            {...props}
                        />
                    );

        }
    }

    return (
        renderItem()
    );

};

export default SortableTreeItem;