import { useState,useRef } from "react";
import SortableListItem from "./SortableListItem";

import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

/**
 * Items Needs To Be An Array Of Objects
 * 
 * This Is A Sample Format And Each Item Should Have A Unique ID: 
 * items=[ {id:001,name:'Name',Color}, ...]
 * 
 * keyRef is there in case we're looping throuh an array
 * and want to have a reference to point back to Look At TaskTable Component As An Example
 */
const SortableList = ({ items, callBack, keyRef }) => {

    var conts = [...items];

    const [listItems,setListItems] = useState(conts);
    const [activeObj,setActiveObj] = useState(null);

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates
        })
    )

    function handleDragStart(event) {
        
        const { active } = event
        const { id } = active
        setActiveObj(active.id || active.hash);

    }

    function getItemIndex(id) {

        const itemIndex = listItems.findIndex( item => ( item.id || item.hash ) === id );

        return itemIndex;
    
    }

    function handleDragEnd(event) {
        
        const { active, over } = event;

        let newItems = [...listItems];

        //console.log("NewItems",newItems);

        if( active && over && ( active.id || active.hash) != ( over.id || over.hash ) ) {

            const activeItemIndex = getItemIndex( active.id || active.hash );
            const overItemIndex = getItemIndex( over.id || over.hash );

            newItems = arrayMove(
                newItems,
                activeItemIndex,
                overItemIndex
            );
        }

        //  Send The new Updated List Position Back To Parent
        if( callBack ) {
            let info = {  
                items: newItems
            }

            if( keyRef ) info['keyRef'] = keyRef;

            callBack(info);
        }

        setListItems(newItems);
        setActiveObj(null);
    }

    return (
        <div className="p-2">  
            <h6>Sort Order</h6>
            <hr />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                    <SortableContext items={ listItems.map( i => ( i.id || i.hash) ) }>

                        {listItems.map( item => (
                            <SortableListItem 
                                key={item.id || item.hash} 
                                id={item.id || item.hash } 
                                label={ ('label' in item ) ? item.label : item.name } 
                                color={item.color} 
                            />
                        ))}

                    </SortableContext>

            </DndContext >


        </div>
    )



}

export default SortableList;