import React, { useState, useEffect } from 'react';

const descriptions = {
    Q: 'Chant: Hey!', W: 'Clap', E: 'Crash',
    A: 'Closed hi-hat', S: 'Open hi-hat', D: 'Percussion',
    Z: 'Snare', X: 'Kick one', C: 'Kick two'
};

// It's good performance-wise to cache the audio elements as we are setting the volume globally to every element.
let audioElements = [];

const playSound = (id, setterCallback) => {
    const ele = document.getElementById(id);
    if (!ele) {
        setterCallback("Sound not found!");
        return;
    }
    ele.currentTime = 0;
    ele.play().catch(() => {
        setterCallback("Sound file missing or cannot be played!");
    });
    ele.parentElement.style.backgroundColor = "#800080";
    ele.parentElement.style.fontSize = "3rem";
    setTimeout(() => { ele.parentElement.style.backgroundColor = ""; ele.parentElement.style.fontSize = "" }, 100);
    setterCallback(descriptions[id]);
}

const Drum = () => {
    const [displayDescription, setDisplayDescription] = useState('');
    const [volume, setVolume] = useState(1);

    const initKeyboard = (callback, setter) => {
        document.body.addEventListener('keydown', event => {
          switch (event.keyCode) {
            case 81:
              callback('Q', setter);
              break;
            case 87:
              callback('W', setter);
              break;
            case 69:
              callback('E', setter);
              break;
            case 65:
              callback('A', setter);
              break;
            case 83:
              callback('S', setter);
              break;
            case 68:
              callback('D', setter);
              break;
            case 90:
              callback('Z', setter);
              break;
            case 88:
              callback('X', setter);
              break;
            case 67:
              callback('C', setter);
              break;
            default:
              break;
          }
        });
    }

    useEffect(() => {
        initKeyboard(playSound, setDisplayDescription);
        audioElements = Array.from(document.getElementsByClassName('clip'));
    }, []);

    useEffect(() => {
        audioElements.forEach(element => {
            element.volume = volume
        });
    }, [volume])


    return (
        <div id="drum-machine">
            <div id="button-container">
                <div className="btn-row">
                <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="chant" onClick={() => playSound('Q', setDisplayDescription)}>Q<audio className="clip" id="Q" src={require('../Audio/clap.mp3')} preload="auto"></audio></button>
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="clap" onClick={() => playSound('W', setDisplayDescription)}>W<audio className="clip" id="W" src={require('../Audio/clap.mp3')} preload="auto"></audio></button>
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="crash" onClick={() => playSound('E', setDisplayDescription)}>E<audio className="clip" id="E" src={require('../Audio/crash.mp3')} preload="auto"></audio></button>
                </div>
                <div className="btn-row">
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="hat-closed" onClick={() => playSound('A', setDisplayDescription)}>A<audio className="clip" id="A" src={require('../Audio/hat_closed.mp3')} preload="auto"></audio></button>
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="hat-open" onClick={() => playSound('S', setDisplayDescription)}>S<audio className="clip" id="S" src={require('../Audio/hat_open.mp3')} preload="auto"></audio></button>
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="perc" onClick={() => playSound('D', setDisplayDescription)}>D<audio className="clip" id="D" src={require('../Audio/perc.mp3')} preload="auto"></audio></button>
                </div>
                <div className="btn-row">
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="snare" onClick={() => playSound('Z', setDisplayDescription)}>Z<audio className="clip" id="Z" src={require('../Audio/snare.mp3')} preload="auto"></audio></button>
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="kick-1" onClick={() => playSound('X', setDisplayDescription)}>X<audio className="clip" id="X" src={require('../Audio/kick_1.mp3')} preload="auto"></audio></button>
                    <button className="drum-pad text-white bg-black w-[100px] h-[100px] text-xl mx-3" id="kick-2" onClick={() => playSound('C', setDisplayDescription)}>C<audio className="clip" id="C" src={require('../Audio/kick_2.mp3')} preload="auto"></audio></button>
                </div>
            </div>
            <div id="controls">
                <p id="display">{displayDescription}</p>
                <div id="volume-control">
                  
                </div>
            </div>
        </div>
    );
}

export default Drum;
