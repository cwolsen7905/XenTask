import React, { useState,useEffect } from 'react';
import { Form } from 'react-bootstrap';

const FieldsSlider = ({options, callBack, showError}) => {

  const [sliderValue, setSliderValue] = useState( ( options.value || options.min ) || 0 );
  const [isInvalid, setInvalid] = useState(showError);

  useEffect(() => {
    setInvalid(showError);
  }, [showError]);

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
  };

  const handleBlur = (e) => {
    if( callBack ) callBack(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>

      <div style={{ width: 70 }}>
        <input type="number"
          className={`form-control ${ isInvalid ? 'is-invalid' : '' }`}
          value={sliderValue}
          min={options.min}
          max={options.max}
          step={options.step}
          style={{
            flex: 1,
            marginRight: '10px',
          }}
          onChange={handleSliderChange}
          onBlur={handleBlur}
        />
      </div>
      <Form.Range
        min={options.min}
        max={options.max}
        value={sliderValue}
        step={options.step}
        onChange={handleSliderChange}
        onBlur={handleBlur}
        style={{ flex: 1 }}
      />
    </div>
  );
};

export default FieldsSlider;
