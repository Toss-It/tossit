import React from 'react';
import PropTypes from 'prop-types';
import { sanitizeCode } from '../util/filter';

/*
 * width: width of the input box (should be 0 - 100%)
 * height: height of the input box (should be 0 - 100%)
 * numInputs: number of boxes to display
 * middleDash: whether or not to display a middle dash
 * outlineStyle: style of the inputBoxes. 'solid', 'dashed' or 'underscore' (default: 'underscore')
 */
const inputBoxWidth = 2.5;
const DashedInput = ({ width, height, numInputs, idxSplit=-1, splitString=null, outlineStyle, textId=null, onlyNumbers=false, onSubmit, inputNumberLimit=[]}) => {
    const outline = deriveOutline(outlineStyle);
    const handleChange = (index, e) => {
        // let charCode = String.fromCharCode(e.which).toLowerCase();
        // if ((e.ctrlKey || e.metaKey) && charCode === 'v') {
        //     for (let i = 0; i < 6;) {
        //         navigator.clipboard.writeText
        //     }
        // }
        const keyCode = e.keyCode;
        // dirty code to shift focus to the next input box
        if (keyCode === 13) {
            handleSubmit();
        }
        // left arrow key
        if (keyCode === 37) {
            if (index > 0) {
                inputEl.current[index - 1].focus();
            }
            return;
        }
        // right arrow key
        if (keyCode === 39) {
            if (index < numInputs - 1) {
                inputEl.current[index + 1].focus();
            }
            return;
        }
        // backspace or delete
        if (keyCode === 8 || keyCode === 46) {
            const newValues = values.slice();
            newValues[index] = '';
            setValues(newValues);
            inputEl.current[Math.max(0, index - 1)].focus();
            return;
        }

        // Timer input restrictions
        if (onlyNumbers && !(keyCode >= 48 && keyCode <= 48 + (inputNumberLimit.length === 0 ? 9 : inputNumberLimit[index]))) return;

        // Code input restrictions
        if(!onlyNumbers && (keyCode <= 46 || keyCode >= 91)) return;
        
        const newChar = String.fromCharCode(keyCode);
        const newValues = values.slice();
        newValues[index] = newChar;
        setValues(newValues);
        inputEl.current[Math.min(numInputs - 1, index + 1)].focus();
    }

    const onPaste = (e) => {
        const pasted = e.clipboardData.getData('Text');
        const cleanCode = sanitizeCode(pasted);
        if (cleanCode.length === 0) {
            return;
        }
        const pastedLength = cleanCode.length;
        for (let emptySpaceIndex = pastedLength; emptySpaceIndex < numInputs; emptySpaceIndex++) {
            cleanCode.push('');
        }
        setValues(cleanCode);
        inputEl.current[pastedLength >= 6 ? 5 : pastedLength].focus();
    };

    const handleSubmit = () => {
        const fullCode = values.join('');
        if (fullCode.length === numInputs) {
            onSubmit(fullCode);
        }
    }

    const [values, setValues] = React.useState(new Array(numInputs).fill(''));
    const [nodes, setNodes] = React.useState([]);
    const inputEl = React.useRef(new Array());

    React.useEffect(() => {
        const newNodes = new Array(numInputs + (idxSplit !== -1));
        for (let i = 0; i < values.length; i++) {
            newNodes[i] = <InputBox
                key={i}
                ref={ref => inputEl.current.push(ref)}
                index={i}
                value={values[i]}
                style={{ outline: outline }}
                textId={textId}
                handleChange={handleChange}
                onPaste={onPaste}
                caretTransparent={true}
            />;
        }
        
        if (idxSplit !== -1) {
            newNodes.splice(idxSplit, 0, <p key='e' className='input-box' id={textId}>{splitString}</p>);
        }
        setNodes(newNodes);
    }, [values]);

    return (
        <div id='input' style={{ width, height }}>
            {nodes}
        </div>
    );
}

DashedInput.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    numInputs: PropTypes.number.isRequired,
    idxSplit: PropTypes.number,
    splitString: PropTypes.string,
    outlineStyle: PropTypes.string,
    textId: PropTypes.string,
    onlyNumbers: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    inputNumberLimit: PropTypes.array,
};

const deriveOutline = (style) => {
    switch (style) {
        case 'solid':
            return 'solid';
        case 'dashed':
            return 'dashed';
        case 'underscore':
            return 'underscore';
        default:
            return 'underscore';
    }
}

const InputBox = React.forwardRef(({ index, value, style, handleChange, onPaste, caretTransparent=false, textId=null }, ref) => (
    <input
        ref={ref}
        type='text'
        value={value}
        className='input-box'
        id={textId}
        autoFocus={index === 0}
        style={{
            width: `${inputBoxWidth}rem`,
            height: '100%',
            [style.outline === 'underscore' ? 'borderBottom' : 'border']: deriveBorderStyle(style.outline),
            caretColor: caretTransparent ? 'transparent' : '',
        }}
        onChange={(e) => e.preventDefault()}
        onKeyDown={(e) => handleChange(index, e)}
        onPaste={(e) => onPaste(e)}
        maxLength={1}
        minLength={1}
    />
));

InputBox.displayName = 'InputBox';

InputBox.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.string,
    style: PropTypes.object,
    handleChange: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    caretTransparent: PropTypes.bool,
    textId: PropTypes.string,
};

const deriveBorderStyle = (style) => {
    switch (style) {
        case 'solid':
            return 'solid 3.5px white';
        case 'dashed':
            return 'dashed 3.5px white';
        case 'underscore':
            return 'solid 5px white';
        default:
            return 'solid 5px white';
    }
}

export default DashedInput;