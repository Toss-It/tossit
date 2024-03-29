// Makes it easier to add flippable papers for teacher mode too

import React from 'react';
import PropTypes from 'prop-types';


const FlipButton = ({flipped, setFlipped}) => (
    <div>
        <button 
            className='flip-button'
            onClick={(e) => { e.preventDefault(); setFlipped(!flipped)}}
        >
        </button>
    </div>
);

FlipButton.propTypes = {
    flipped: PropTypes.bool.isRequired,
    setFlipped: PropTypes.func.isRequired,
};

const Paper = ({ frontComponent, backComponent, size }) => {

    const [flipped, setFlipped] = React.useState(false);

    return (
        <div id='paper' style={{ width: size }}>
            {flipped ? backComponent : frontComponent}
            <FlipButton flipped={flipped} setFlipped={setFlipped} onClick={() => setFlipped(!flipped)} />
        </div>
    );
};

Paper.propTypes = {
    frontComponent: PropTypes.element.isRequired,
    backComponent: PropTypes.element.isRequired,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

export default Paper;