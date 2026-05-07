import { useState, useEffect, useRef } from 'react';
import { useUI } from '../Contexts/UIContext.js';
import { useData } from '../Contexts/DataContext.js';
import { v4 as uuidv4 } from 'uuid';
import { FormField } from './FormField';
import { FormCard } from './FormCard';
import { snapToCursor } from './SnapToCursor.ts';
import CkEditor from '../Fields/CkEditor';
import FormDropHelper from './FormDropHelper.js'

import axios from 'axios';

// DnD
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    rectIntersection,
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates
} from "@dnd-kit/sortable"


const Forms = ({ props }) => {

    const { globalData } = useData();

    const { showToastNotification } = useUI();

    const [activeObj, setActiveObj] = useState(null);

    //  The Containers To Drag And Drop Fields Into
    const [containers, setContainers] = useState(null);

    const [isDragging, setIsDragging] = useState(false);

    const [heading, setHeading] = useState('');

    const [formName, setFormName] = useState('');

    const [formPublished, setPublished] = useState(false);

    const editorRef = useRef(null);

    const getDescriptionRef = (refId) => {
        editorRef.current = refId;
    }

    const getFormData = async () => {

        try {

            const _url = `https://${globalData.api_url}/list/${props.id}/form/${props.selectedForm}`;

            let _response = await axios.get(_url, { withCredentials: true });

            if (_response.status === 200) {

                return _response.data;

            }

        } catch (error) {

        }

    }


    useEffect(() => {
        console.log("Props Has Changed");

        const fetchFormData = async () => {
            setHeading('');
            setFormName('');
            setPublished(false);

            // Only reset description if editorRef is ready
            if (editorRef.current) {
                editorRef.current.setData('');
            }

            const { selectedForm } = props; // Only keep `selectedForm` here

            let _containers = initializeContainers(); // Initialize containers without passing props

            if (selectedForm) {
                let _formData = await getFormData();
                if (_formData) {
                    let _data = JSON.parse(_formData.data);
                    setFormName(_formData.name);
                    setPublished(_formData.published ? true : false);
                    setHeading(_data.heading);

                    // Set description only if editorRef is available
                    if (editorRef.current) {
                        editorRef.current.setData(_data.description);
                    } else {
                        // Wait for editorRef to be available and then set the description
                        const waitForEditorRef = () => {
                            if (editorRef.current) {
                                editorRef.current.setData(_data.description);
                            } else {
                                setTimeout(waitForEditorRef, 50); // Retry every 50ms until editorRef is ready
                            }
                        };
                        waitForEditorRef();
                    }

                    // Assign _data.items to editor items
                    const editorItems = _data.items.filter(item => {
                        const existsInBasic = _containers.basic.items.some(b => b.fieldHash === item.fieldHash);
                        const existsInCustom = _containers.custom.items.some(c => c.fieldHash === item.fieldHash);
                        return existsInBasic || existsInCustom;
                    });

                    // Now, process the editor items
                    editorItems.forEach(item => {
                        const { fieldHash, parent } = item;

                        // Check if the item exists in the parent container
                        if (parent && _containers[parent]) {
                            // Find the parent item
                            const parentItem = _containers[parent].items.find(i => i.fieldHash === fieldHash);

                            if (parentItem) {
                                // Copy the parent item's options to the current item
                                item.options = parentItem.options;

                                // Remove the item from the parent container after copying the options
                                _containers[parent].items = _containers[parent].items.filter(
                                    existingItem => existingItem.fieldHash !== fieldHash
                                );
                            }
                        }

                        // Check if the item has rule fields to copy options from parent items
                        if (item.rules && item.rules.length > 0) {
                            item.rules.forEach(rule => {
                                if (rule.fields) {
                                    rule.fields.forEach(({ fieldHash: ruleFieldHash, parent: ruleParent }) => {
                                        if (ruleParent && _containers[ruleParent]) {
                                            // Find the parent item for the rule
                                            const ruleParentItem = _containers[ruleParent].items.find(i => i.fieldHash === ruleFieldHash);

                                            if (ruleParentItem) {
                                                // Copy the parent item's options to the rule item
                                                rule.options = ruleParentItem.options;

                                                // Remove the field from the rule's parent container
                                                _containers[ruleParent].items = _containers[ruleParent].items.filter(
                                                    existingItem => existingItem.fieldHash !== ruleFieldHash
                                                );
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });

                    // Assign filtered and updated editor items back to the editor container
                    _containers.editor.items = editorItems;
                }
            }

            setContainers(_containers);
        };

        fetchFormData();
    }, [props.selectedForm]);


    // Initialize containers with basic, custom, and editor items
    const initializeContainers = () => {
        const { taskCustomFields, statuses, priority } = props; // Destructure props here

        const _customFields = Object.values(taskCustomFields).map((e) => ({
            id: `item-${e.hash}`,
            parent: 'custom',
            fieldHash: e.hash,
            name: e.name,
            description: '',
            fieldName: e.name,
            type: e.type,
            options: e.options || null,
            required: e.required,
            disabled: e.required,
            logic: false,
        }));

        const _basicFields = [
            {
                id: `item-description`,
                parent: 'basic',
                name: '',
                description: '',
                fieldName: 'Description',
                fieldHash: 'description',
                options: null,
                type: 'text',
                required: false,
                disabled: false,
                logic: false,
            },
            {
                id: `item-status`,
                parent: 'basic',
                fieldHash: 'status',
                name: '',
                description: '',
                type: 'dropdown',
                fieldName: 'Status',
                options: statuses,
                required: false,
                disabled: false,
                logic: false,
            },
            {
                id: `item-priority`,
                parent: 'basic',
                fieldHash: 'priority',
                name: '',
                description: '',
                fieldName: 'Priority',
                type: 'dropdown',
                required: false,
                readonly: false,
                options: priority,
                logic: false,
            },
            {
                id: `item-assignee`,
                parent: 'basic',
                fieldHash: 'assignee',
                name: '',
                description: '',
                fieldName: 'Assignee',
                type: 'dropdown',
                required: false,
                readonly: false,
                options: globalData.WORKSPACE_USERS.map(e => {
                    return {
                        id: e.hash,
                        name: e.full_name
                    }
                }),
                logic: false,
            },
            {
                id: `item-start-date`,
                parent: 'basic',
                fieldHash: 'start_date',
                name: '',
                description: '',
                fieldName: 'Start Date',
                type: 'date',
                required: false,
                readonly: false,
                options: null,
                logic: false,
            },
            {
                id: `item-due-date`,
                parent: 'basic',
                fieldHash: 'due_date',
                name: '',
                description: '',
                fieldName: 'Due Date',
                type: 'date',
                required: false,
                readonly: false,
                options: null,
                logic: false,
            }
        ];

        return {
            basic: {
                id: `container-${uuidv4()}`,
                type: 'basic-field',
                items: _basicFields,
            },
            custom: {
                id: `container-${uuidv4()}`,
                type: 'custom-field',
                items: _customFields,
            },
            editor: {
                id: `container-${uuidv4()}`,
                type: 'editor',
                items: []
            }
        };
    };

    const updateEditorFieldCallback = (itemIndex, key, value) => {

        let _containers = { ...containers }; // Clone the containers state

        // Locate the editor container
        const editorContainer = _containers.editor;

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Locate the item within the editor
        const item = editorContainer.items[itemIndex];

        // Toggle the checkbox value (true/false)
        item[key] = value;

        // Update the state with the modified containers
        setContainers(_containers);
    };

    const addItemToEditor = (item) => {
        let _containers = { ...containers };

        // Find and remove the item from its original container
        let parentContainer = _containers[item.container];

        if (!parentContainer) {
            console.error("Parent container not found.");
            return;
        }

        let itemIndex = parentContainer.items.findIndex((e) => e.id === item.id);

        if (itemIndex !== -1) {
            // Remove item from the parent container
            let [removedItem] = parentContainer.items.splice(itemIndex, 1);

            // Ensure editor container exists
            if (!_containers.editor) {
                _containers.editor = { items: [] };
            }

            // Add the item to editor items
            _containers.editor.items.push(removedItem);

            // Update state (assuming you're using React state)
            setContainers(_containers);

        } else {
            console.error("Item Not Found");
        }
    };


    const addNewRule = (itemIndex, main) => {

        // Create a copy of the containers object
        let _containers = { ...containers };

        // Ensure the rules key exists and is an array in the item at the specified index
        if (!_containers.editor.items[itemIndex].rules) {
            _containers.editor.items[itemIndex].rules = [];
        }

        // Define the new rule
        const newRule = {
            id: uuidv4(),
            main: main,
            sub: [],
            fields: []
        };

        // Add the new rule to the rules array of the item at the specified index
        _containers.editor.items[itemIndex].rules.push(newRule);

        // Update the state with the modified containers
        setContainers(_containers);

        //console.log("New Rule Added", _containers);
    };


    const changeCheckboxCallback = (itemIndex, checkboxKey) => {
        let _containers = { ...containers }; // Clone the containers state

        // Locate the editor container
        const editorContainer = _containers.editor;

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Locate the item within the editor
        const item = editorContainer.items[itemIndex];

        if (!item) {
            console.error(`Item at index ${itemIndex} not found in editor container.`);
            return;
        }

        // Toggle the checkbox value (true/false)
        item[checkboxKey] = !item[checkboxKey];

        // Update the state with the modified containers
        setContainers(_containers);
    };


    const deleteEditorFieldCallback = (itemIndex) => {
        let _containers = { ...containers }; // Clone the containers state

        // Locate the editor container
        const editorContainer = _containers.editor;

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Locate the item within the editor
        const itemToDelete = editorContainer.items[itemIndex];

        if (!itemToDelete) {
            console.error(`Item at index ${itemIndex} not found in editor container.`);
            return;
        }

        // Extract the parent container name from the item
        const parentContainerName = itemToDelete.parent;
        const parentContainer = _containers[parentContainerName];

        if (!parentContainer) {
            console.error(`Parent container "${parentContainerName}" not found for item:`, itemToDelete);
            return;
        }

        // Move all fields from the item's rules back to their respective parent containers
        if (itemToDelete.rules && itemToDelete.rules.length > 0) {
            itemToDelete.rules.forEach((rule) => {
                if (rule.fields && rule.fields.length > 0) {
                    rule.fields.forEach((field) => {
                        const fieldParentContainerName = field.parent;
                        const fieldParentContainer = _containers[fieldParentContainerName];

                        if (!fieldParentContainer) {
                            console.error(`Parent container "${fieldParentContainerName}" not found for field:`, field);
                            return;
                        }

                        // Push the field back to the parent container
                        if (!fieldParentContainer.items) {
                            fieldParentContainer.items = [];
                        }
                        fieldParentContainer.items.push(field);
                    });
                }
            });
        }

        // Remove the rules key from the item
        const { rules, ...itemWithoutRules } = itemToDelete;

        // Push the cleaned-up item back into its parent container
        if (!parentContainer.items) {
            parentContainer.items = [];
        }
        parentContainer.items.push(itemWithoutRules);

        // Remove the item from the editor container
        editorContainer.items.splice(itemIndex, 1);

        // Update the state with the modified containers
        setContainers(_containers);

        // console.log(`Item at index ${itemIndex} has been deleted and moved back to "${parentContainerName}".`);
    };


    const deleteRuleCallback = (itemIndex, ruleIndex) => {
        let _containers = { ...containers }; // Clone the containers state

        // Locate the editor container
        const editorContainer = _containers.editor;

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Locate the rule within the specified item
        const item = editorContainer.items[itemIndex];
        if (!item || !item.rules || !item.rules[ruleIndex]) {
            console.error(`Invalid indices or missing rule at indices: ${itemIndex}, ${ruleIndex}`);
            return;
        }

        const ruleToDelete = item.rules[ruleIndex];

        // Ensure the rule has fields to process
        if (ruleToDelete.fields && ruleToDelete.fields.length > 0) {
            // Move each field back to its corresponding parent container
            ruleToDelete.fields.forEach((field) => {
                const parentContainerName = field.parent;
                const parentContainer = _containers[parentContainerName];

                if (!parentContainer) {
                    console.error(`Parent container "${parentContainerName}" not found for field:`, field);
                    return;
                }

                // Push the field back to the parent container
                if (!parentContainer.items) {
                    parentContainer.items = [];
                }
                parentContainer.items.push(field);
            });
        }

        // Remove the rule from the rules array
        item.rules.splice(ruleIndex, 1);

        // Update the state with the modified containers
        setContainers(_containers);

        // console.log(`Rule at index ${ruleIndex} for item ${itemIndex} has been deleted.`);
    };

    const addSubCondition = (itemIndex, ruleIndex) => {
        // Create a copy of the containers object
        let _containers = { ...containers };

        // Access the specific item and rule
        const item = _containers.editor.items[itemIndex];
        const rule = item.rules[ruleIndex];

        // Ensure the sub key exists and is an array
        if (!rule.sub) {
            rule.sub = [];
        }

        // Add the new condition to the sub array
        rule.sub.push({
            id: uuidv4(),
            field: null,
            field_value: null,
            operator: 'and',
            condition: 'is',
        });

        // Update the state with the modified containers
        setContainers(_containers);


        // console.log("New SubCondition Added", _containers)
    };

    const addConditionalFields = (itemIndex, ruleIndex, e) => {

        let _containers = { ...containers };

        const { container: containerName, id: itemId } = e;
        const sourceContainer = _containers[containerName];

        if (!sourceContainer) {
            console.error(`Container "${containerName}" not found!`);
            return;
        }

        const movedItem = sourceContainer.items.find((item) => item.id === itemId);

        if (!movedItem) {
            console.error(`Item with id "${itemId}" not found in container "${containerName}"!`);
            return;
        }

        sourceContainer.items = sourceContainer.items.filter((item) => item.id !== itemId);

        const editorContainer = _containers.editor;
        const rule = editorContainer.items[itemIndex].rules[ruleIndex];

        if (!rule.fields) {
            rule.fields = [];
        }

        rule.fields.push(movedItem);

        setContainers(_containers);
        //console.log("Adding A Conditional Field")
    }

    const deleteConditionalFieldCallback = (itemIndex, ruleIndex, fieldIndex) => {

        let _containers = { ...containers }; // Clone the containers state

        // Locate the editor container
        const editorContainer = _containers.editor;

        if (!editorContainer) {
            console.error('Editor container not found!');
            return;
        }

        // Locate the rule and its fields
        const rule = editorContainer.items[itemIndex]?.rules[ruleIndex];
        if (!rule || !rule.fields || !rule.fields[fieldIndex]) {
            console.error(`Invalid indices or missing fields at indices: ${itemIndex}, ${ruleIndex}, ${fieldIndex}`);
            return;
        }

        // Extract the field to delete
        const fieldToDelete = rule.fields[fieldIndex];

        // Remove the field from the original array
        rule.fields.splice(fieldIndex, 1);

        // Use the parent property to determine where to move the item
        const parentContainerName = fieldToDelete.parent;
        const parentContainer = _containers[parentContainerName];

        if (!parentContainer) {
            console.error(`Parent container "${parentContainerName}" not found!`);
            return;
        }

        // Push the item back into its parent container
        if (!parentContainer.items) {
            parentContainer.items = [];
        }
        parentContainer.items.push(fieldToDelete);

        // Update the state with the modified containers
        setContainers(_containers);


    };


    const deleteSubconditionCallBack = (itemIndex, ruleIndex, fieldIndex) => {
        let _containers = { ...containers }; // Shallow copy of containers

        const editorContainer = _containers.editor;

        // Check if the editorContainer exists and contains the necessary structure
        if (!editorContainer || !editorContainer.items[itemIndex]) {
            console.error(`Item at index "${itemIndex}" not found in editor container!`);
            return;
        }

        const rule = editorContainer.items[itemIndex].rules[ruleIndex];

        if (!rule || !rule.sub || !rule.sub[fieldIndex]) {
            console.error(
                `Field at index "${fieldIndex}" not found in rule index "${ruleIndex}" for item index "${itemIndex}"!`,
                editorContainer
            );
            return;
        }

        //console.log("Before Removal:", JSON.stringify(rule.sub, null, 2));

        // Remove the specific field
        const removedField = rule.sub.splice(fieldIndex, 1); // splice returns an array of removed items
        //console.log("Removed Field:", removedField);
        // console.log("After Removal:", JSON.stringify(rule.sub, null, 2));

        // Update the state with the modified containers
        setContainers(_containers);

    };

    /**
     * 
     * @param {*} itemIndex  - The Item Index We're Updating
     * @param {*} ruleIndex  - The Rule Index We're Updating
     * @param {*} key        - The key we're updating
     * @param {*} value      - The Value To Update To
     * @param {*} fieldIndex - If None Is Provided That Means We're Updating The Main Condition
     */
    const updateConditionsCallback = (itemIndex, ruleIndex, key, value, fieldIndex = null) => {

        // If This Is Passed As Null Or Defaulted To Null 
        // This Means We're Updating The Main Condition
        let _is_main = fieldIndex === null;

        //console.log("is_main", _is_main);
        //console.log(`Setting ${_is_main ? "main" : "sub"} Condition`, key, value, fieldIndex);

        // Create a copy of the containers object
        let _containers = { ...containers };

        // Access the specific item and rule
        const item = _containers.editor.items[itemIndex];
        const rule = item.rules[ruleIndex];

        if (_is_main) {
            // Add the new condition to the sub array
            rule.main[key] = value;
        } else {
            rule.sub[fieldIndex][key] = value;
        }


        // console.log(rule);

        // Update the state with the modified containers
        setContainers(_containers);


    }

    const updateConditionalFieldsOrderCallback = (itemIndex, ruleIndex, obj) => {

        // Create a copy of the containers object
        let _containers = { ...containers };

        // Access the specific item and rule
        const item = _containers.editor.items[itemIndex];
        const rule = item.rules[ruleIndex];

        // Ensure the sub key exists and is an array
        if (!rule.fields) {
            rule.fields = [];
        }

        // Add the new condition to the sub array
        rule.fields = obj;

        // Update the state with the modified containers
        setContainers(_containers);

        //console.log("Updating Conditional Fields Order", _containers);
    }

    const updateConditionalFieldsCallback = (itemIndex, ruleIndex, fieldIndex, key, value) => {

        // Create a copy of the containers object
        let _containers = { ...containers };

        // Access the specific item and rule
        const item = _containers.editor.items[itemIndex];
        const rule = item.rules[ruleIndex];

        // Ensure the sub key exists and is an array
        if (!rule.fields) {
            rule.fields = [];
        }

        // Add the new condition to the sub array
        rule.fields[fieldIndex][key] = value;

        // Update the state with the modified containers
        setContainers(_containers);

    }

    /**
     * DND Related
     */
    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor, {}),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),
    );

    function findContainerKey(itemId, type) {
        // This function maps item IDs to their respective container keys
        for (const key in containers) {
            const container = containers[key];
            const item = container.items.find(item => item.id === itemId);
            if (item) return key; // Return the container key
        }
        return null;
    }

    function handleDragStart(event) {

        const { active } = event;
        setActiveObj(active.data.current);
        setIsDragging(true);
    }

    function handleDragMove(event) {
        const { active, over } = event;
        if (!over) return;

        const activeContainerKey = findContainerKey(active.id, "item");
        const overContainerKey = findContainerKey(over.id, "item") || findContainerKey(over.id, "container");

        if (!activeContainerKey || !overContainerKey || activeContainerKey === overContainerKey) return;

        // Prevent dragging between Basic Fields and Custom Fields
        if (
            (activeContainerKey === "basic" || activeContainerKey === "custom") &&
            (overContainerKey === "basic" || overContainerKey === "custom")
        ) {
            return;
        }

        // Prevent Editor items from being moved to Basic or Custom
        if (
            activeContainerKey === "editor" &&
            (overContainerKey === "basic" || overContainerKey === "custom")
        ) {
            return;
        }

        let newContainers = { ...containers };

        if (!newContainers[activeContainerKey] || !newContainers[overContainerKey]) return;

        const activeContainer = newContainers[activeContainerKey];
        const overContainer = newContainers[overContainerKey];

        const activeItemIndex = activeContainer.items.findIndex(item => item.id === active.id);
        if (activeItemIndex === -1) return;

        const [removedItem] = activeContainer.items.splice(activeItemIndex, 1);

        if (!overContainer.items) overContainer.items = [];
        overContainer.items.push(removedItem);

        setContainers(newContainers);
    }

    function handleDragEnd(event) {

        const { active, over } = event;

        if (!over) {
            setIsDragging(false);
            return;
        }

        const activeContainerKey = findContainerKey(active.id, "item");
        const overContainerKey = findContainerKey(over.id, "item") || findContainerKey(over.id, "container");

        // Prevent Editor items from being moved to Basic or Custom
        if (
            activeContainerKey === "editor" &&
            (overContainerKey === "basic" || overContainerKey === "custom")
        ) {
            setIsDragging(false);
            return;
        }

        if (over.data.current.type === "helper") {
            //console.log("Over The Helper Node");

            if (activeContainerKey) {
                let newContainers = { ...containers };
                const activeContainer = newContainers[activeContainerKey];
                const editorContainer = newContainers["editor"];

                if (activeContainer && editorContainer) {
                    const activeItemIndex = activeContainer.items.findIndex(item => item.id === active.id);
                    if (activeItemIndex !== -1) {
                        const [removedItem] = activeContainer.items.splice(activeItemIndex, 1);
                        editorContainer.items.push(removedItem);

                        newContainers[activeContainerKey] = {
                            ...activeContainer,
                            items: [...activeContainer.items]
                        };
                        newContainers["editor"] = {
                            ...editorContainer,
                            items: [...editorContainer.items]
                        };

                        setContainers(newContainers);
                    }
                }
            }
            setIsDragging(false);
            return;
        }

        if (activeContainerKey && overContainerKey) {
            if (activeContainerKey !== overContainerKey) {
                if (
                    (activeContainerKey === "basic" || activeContainerKey === "custom") &&
                    (overContainerKey === "basic" || overContainerKey === "custom")
                ) {
                    setIsDragging(false);
                    return;
                }
            }

            let newContainers = { ...containers };
            const activeItems = newContainers[activeContainerKey].items;
            const overItems = newContainers[overContainerKey].items;

            const activeIndex = activeItems.findIndex(item => item.id === active.id);
            const overIndex = overItems.findIndex(item => item.id === over.id);

            if (activeIndex !== -1) {
                const [movedItem] = activeItems.splice(activeIndex, 1);

                if (activeContainerKey === overContainerKey) {
                    overItems.splice(overIndex, 0, movedItem);
                } else {
                    overItems.push(movedItem);
                }

                newContainers[activeContainerKey] = {
                    ...newContainers[activeContainerKey],
                    items: [...activeItems]
                };
                newContainers[overContainerKey] = {
                    ...newContainers[overContainerKey],
                    items: [...overItems]
                };

                setContainers(newContainers);
            }
        }

        setIsDragging(false);
        setActiveObj(null);
    }

    const fixCursorSnapOffset: CollisionDetection = (args) => {
        if (!args.pointerCoordinates) {
            return rectIntersection(args);
        }

        const { x, y } = args.pointerCoordinates;
        const { width, height } = args.collisionRect;

        return rectIntersection({
            ...args,
            // Adjust the collision rectangle to reflect the cursor position accurately
            collisionRect: {
                width,
                height,
                left: x,
                right: x + width,
                top: y,
                bottom: y + height,
            }
        });
    };

    const flatItems = containers
        ? Object.entries(containers)
            .filter(([key, container]) => key !== 'editor' && container.items) // Exclude 'editor' and handle undefined/null items
            .flatMap(([containerName, container]) =>
                (container.items || []).map(item => ({
                    id: item.id,
                    name: item.fieldName,
                    container: containerName, // Include the container name
                }))
            )
        : []; // Return empty array if containers is null or undefined

    /**
     * Saves The Form To The DB
     */
    const saveForm = async () => {

        try {

            const _url = `https://${globalData.api_url}/list/${props.id}/forms`;

            const _formId = props?.selectedForm || null;

            const _data = {
                id: _formId,
                name: formName,
                published: (formPublished ? 1 : 0),
                data: {
                    heading: heading,
                    description: editorRef.current.getData(),
                    items: containers.editor.items,
                }
            }

            let _response;

            if (_formId) {
                _response = await axios.put(_url, _data, { withCredentials: true });
            } else {
                _response = await axios.post(_url, _data, { withCredentials: true });
            }

            if (_response.status === 200) {

                showToastNotification({
                    message: "Form Has Been Saved",
                });

                //  Don't Need To Do This If It's An Update
                if (!_formId) {
                    props.setForms(prevForms => [...prevForms,
                    {
                        hash: _response.data.hash,
                        name: _response.data.name,
                    }]
                    );

                    props.setSelectedForm(_response.data.hash);

                } else {

                    if (_response.data.name_changed) {
                        props.setForms(prevForms =>
                            prevForms.map(form =>
                                form.hash === _formId
                                    ? { ...form, name: formName } // Update only the name
                                    : form
                            )
                        );

                    }

                }
            }

        } catch (error) {

            console.error("Error fetching users", error);

        }


    }

    /**
     * Delete The Form To The DB
     */
    const deleteForm = async () => {

        try {

            const _formId = props?.selectedForm || null;

            const _url = `https://${globalData.api_url}/list/${props.id}/forms/${_formId}`;

            let _response;

            _response = await axios.delete(_url, { withCredentials: true });
            
 
            if (_response.status === 200) {

                showToastNotification({
                    message: "Form Has Been Deleted",
                });

                props.setForms(prevForms =>
                    prevForms.filter(form => form.hash !== _formId) // Remove the item with the matching hash
                );

                props.setSelectedForm(null);
            }

        } catch (error) {

            console.error("Error fetching users", error);

        }


    }

    return (
        <>
            <div class="row g-3 align-items-center mb-2">

                <div class="col-auto">
                    <input
                        className='form-control'
                        placeholder='Form Name'
                        onChange={(e) => setFormName(e.target.value)}
                        value={formName}
                    />
                </div>
                <div class="col-auto">

                    <button type="button" className='btn btn-success me-2' onClick={saveForm}>Save</button>

                    {props.selectedForm && (
                        <button type="button" className='btn btn-danger' onClick={deleteForm}>Delete Form</button>
                    )}

                </div>
            </div>
            <hr />
            {/* The Top Bar Options */}
            <div className='d-flex justify-content-between'>

                <button type="button" className="btn btn-primary">
                    Tasks Created <span className="badge text-bg-secondary">0</span>
                </button>

                <div className="d-flex align-items-center">

                    <span className="me-2">Editing</span>

                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault"></label>
                    </div>

                    <span className="ms-2">Preview</span>

                </div>

                <div className="d-flex align-items-center">

                    <span className="me-2">Published</span>

                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" checked={formPublished} onClick={() => { setPublished(!formPublished); }} />
                    </div>

                    <div className="btn-group">
                        <button className="btn btn-primary" type="button">
                            Copy Link
                        </button>
                        <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                            <span className="visually-hidden">Create Form</span>
                        </button>

                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Embed Code</button></li>
                        </ul>
                    </div>
                </div>
            </div>



            <hr />

            {containers && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={fixCursorSnapOffset}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                >
                    {/* The 3 Columns Content */}
                    <div className="row" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        height: 'calc(100vh - 300px)'
                    }}>

                        {/* Left Column */}
                        <div className="col-lg-4" style={{
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            maxHeight: '100%'
                        }}>
                            {/* Accordion for Left Column */}
                            <div className="accordion" id="accordionPanelsStayOpenExample">

                                <div className="accordion-item">

                                    <h2 className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                                            Task Fields
                                        </button>
                                    </h2>

                                    <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                                        <div className="accordion-body">

                                            <SortableContext items={containers.basic.items.map((item) => item.id)}>

                                                {containers.basic.items.map((e, i) => (
                                                    <FormField
                                                        data={e}
                                                        index={i}
                                                    />
                                                ))}

                                            </SortableContext>
                                        </div>
                                    </div>

                                </div>


                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                                            Custom Fields
                                        </button>
                                    </h2>
                                    <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse">
                                        <div className="accordion-body">
                                            <SortableContext items={containers.custom.items.map((item) => item.id)}>

                                                {containers.custom.items.map((e, i) => (
                                                    <FormField
                                                        data={e}
                                                        index={i}
                                                    />
                                                ))}

                                            </SortableContext>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Center Column */}
                        <div className="col-lg-6" style={{ overflowY: 'auto', maxHeight: '100%' }}>

                            {/* Form Title */}
                            <div className="form-group mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Heading"
                                    value={heading}
                                    onChange={(e) => setHeading(e.target.value)}
                                    style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        height: 'auto',
                                        padding: '.375rem .75rem'
                                    }} />
                            </div>

                            {/* Form Description Area */}
                            <CkEditor props={{ returnRef: getDescriptionRef }} />

                            <div className='card'>
                                <div className='card-body' style={{ minHeight: 300 }}>
                                    <SortableContext items={containers.editor.items.map((elm) => elm.id)}>

                                        {containers.editor.items.map((e, i) => (

                                            <FormCard
                                                key={e.id}
                                                data={e}
                                                index={i}
                                                available={containers.editor.items}
                                                flatItems={flatItems}
                                                updateEditorFieldCallback={updateEditorFieldCallback}
                                                deleteEditorFieldCallback={deleteEditorFieldCallback}
                                                addNewRule={addNewRule}
                                                dragging={isDragging}
                                                deleteRuleCallback={deleteRuleCallback}
                                                addSubCondition={addSubCondition}
                                                addConditionalFields={addConditionalFields}
                                                updateConditionsCallback={updateConditionsCallback}
                                                updateConditionalFieldsOrderCallback={updateConditionalFieldsOrderCallback}
                                                updateConditionalFieldsCallback={updateConditionalFieldsCallback}
                                                deleteConditionalFieldCallback={deleteConditionalFieldCallback}
                                                deleteSubconditionCallBack={deleteSubconditionCallBack}
                                                changeCheckboxCallback={changeCheckboxCallback}
                                            />

                                        ))}

                                    </SortableContext>

                                    <FormDropHelper
                                        id={uuidv4()}
                                        flatItems={flatItems}
                                        show={containers.editor.items.length < 1}
                                        addItemToEditor={addItemToEditor}
                                    />

                                    <DragOverlay adjustScale={false} modifiers={[snapToCursor]}>

                                        {/* Drag Overlay For item Item */}
                                        {
                                            activeObj && (
                                                <FormField data={activeObj} />
                                            )
                                        }
                                    </DragOverlay>

                                </div>
                            </div>
                        </div>
                    </div>
                </DndContext>
            )}

        </>
    );
};






export default Forms;
