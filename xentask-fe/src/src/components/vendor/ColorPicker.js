import React, { useState, useRef } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import CloseButton from 'react-bootstrap/CloseButton';

const ColorPicker = ({ selectedColor, callBack }) => {

    const [color, setColor] = useState( selectedColor || "#aabbcc" );
    const [showPicker, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);

    //  Preset Color Pallete For The Swatches
    const presetColors = [
        '#fff',
        '#000',
        '#aabbcc',
        '#0d6efd',
        '#6610f2',
        '#6f42c1',
        '#d63384',
        '#dc3545',
        '#fd7e14',
        '#ffc107',
        '#198754',
        '#20c997',
        '#0dcaf0',
        '#fab5ff',
    ];

    //  Handle The Color Pickers Events
    const handleClick = (event) => {
        setShow(!showPicker);
        setTarget(event.target);
    }

    const handleColorChange = (col) =>{
        setColor(col);
        if( callBack ) callBack(col);
    }
    
    return (
        <>
            <div ref={ref}>
                <button type="button" className="color-picker-outer-circle" style={{ border: `2px solid ${color}` }} onClick={handleClick}>
                    <div className="color-picker-inner-circle" style={{ background: color }}></div>
                </button>

                <Overlay
                    show={showPicker}
                    target={target}
                    placement="auto"
                    flip={true} // This enables automatic flipping of the placement if needed
                    container={ref}
                >
                    <Popover id="popover-contained">
                        <Popover.Header as="h3">Color Picker <CloseButton className="float-end" onClick={ ()=>{setShow(false)}} /></Popover.Header>
                        <Popover.Body>
                            <HexColorPicker color={color} onChange={handleColorChange} />
                            <HexColorInput className="form-control" color={color} onChange={handleColorChange} />
                            <div className="picker__swatches">
                                {presetColors.map((presetColor) => (
                                    <button
                                        type="button"
                                        key={presetColor}
                                        className="picker__swatch"
                                        style={{ background: presetColor }}
                                        onClick={() => handleColorChange(presetColor)}
                                    ></button>
                                ))}
                            </div>
                        </Popover.Body>
                    </Popover>
                </Overlay>
            </div>
        </>
    );
}




export default ColorPicker;
/*

 const presetColors = [
        '#fff',
        '#000',
        '#f8f9fa',
        '#0d6efd',
        '#6610f2',
        '#6f42c1',
        '#d63384',
        '#dc3545',
        '#fd7e14',
        '#ffc107',
        '#198754',
        '#20c997',
        '#0dcaf0',
    ];

import React from "react";
import { HexColorPicker } from "react-colorful";

export const SwatchesPicker = ({ color, onChange, presetColors }) => {
  return (
    <div className="picker">
      <HexColorPicker color={color} onChange={onChange} />

      <div className="picker__swatches">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            className="picker__swatch"
            style={{ background: presetColor }}
            onClick={() => onChange(presetColor)}
          />
        ))}
      </div>
    </div>
  );
};
*/