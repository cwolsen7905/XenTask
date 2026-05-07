import {  useState, forwardRef, useImperativeHandle, useCallback  } from "react";

export default forwardRef( function EditSlider( { values }, ref ) {
    
    const [startVal, setStartVal] = useState( values.start || 0 );
    const [endVal, setEndVal] = useState( values.end || 100 );
    const [stepVal, setStepVal] = useState( values.step || 1 );

    const getItems = useCallback(() => {

        return {
            start: startVal,
            end: endVal,
            step: stepVal,
        };

    }, [startVal, endVal, stepVal]);

    useImperativeHandle(ref, () => {
        return {
            getItems,
        };
    });

    const updateStartVal = (e) =>{

        // Check Here If The Number Is A Multiple Of The Step
        setStartVal(e.target.value);
    }

    const updateEndVal = (e) => {
        // Check Here If The Number Is A Multiple Of The Step
        setEndVal( e.target.value );
    }

    return (
        <>

            <label className="form-label mb-2">Start</label>
            <input type="number" className="form-control" value={startVal} onChange={updateStartVal} />

            <label className="form-label mb-2">End</label>
            <input type="number" className="form-control" value={endVal} onChange={updateEndVal} />


            <label className="form-label mb-2">Step</label>
            <input type="number" className="form-control" value={stepVal} onChange={(e) => { setStepVal(e.target.value) }} />
        </>
    );

});