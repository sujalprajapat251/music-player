import { createSlice } from '@reduxjs/toolkit';

// Import effect components
import Fuzz from "../../components/Fuzz";
import Clipper from '../../components/Clipper';
import ClassicDist from '../../components/ClassicDist';
import Chorus from '../../components/Chorus';
import Crusher from '../../components/Crusher';
import JuicyDistrotion from '../../components/JuicyDistrotion';
import Overdrive from '../../components/Overdrive';
import AutoPan from '../../components/AutoPan';
import AutoWah from '../../components/AutoWah';
import Flanger from '../../components/Flanger';
import Phaser from '../../components/Phaser';
import Rotary from '../../components/Rotary';
import StereoChorus from '../../components/StereoChorus';
import TapeWobble from '../../components/TapeWobble';

// Effect configuration with parameters
const EFFECT_CONFIGS = {
    "Classic Dist": {
        parameters: [
            { name: "Dist", min: -135, max: 135, defaultAngle: 45 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 0 },
            { name: "Low cut", min: -135, max: 135, defaultAngle: -45 }
        ]
    },
    "Bitcrushar": {
        parameters: [
            { name: "Bit Depth", min: -135, max: 135, defaultAngle: 0 },
            { name: "Sample Rate", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Chorus": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Flanger": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Feedback", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Phaser": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Auto Pan": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Shape", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Clipper": {
        parameters: [
            { name: "Threshold", min: -135, max: 135, defaultAngle: 0 },
            { name: "Ratio", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Crusher": {
        parameters: [
            { name: "Amount", min: -135, max: 135, defaultAngle: 0 },
            { name: "Sample Rate", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Fuzz": {
        parameters: [
            { name: "Drive", min: -135, max: 135, defaultAngle: 0 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Juicy Distrotion": {
        parameters: [
            { name: "Drive", min: -135, max: 135, defaultAngle: 0 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Overdrive": {
        parameters: [
            { name: "Drive", min: -135, max: 135, defaultAngle: 0 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 45 },
            { name: "Level", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Auto-Wah": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Instant Sidechain": {
        parameters: [
            { name: "Attack", min: -135, max: 135, defaultAngle: 0 },
            { name: "Release", min: -135, max: 135, defaultAngle: 45 },
            { name: "Threshold", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Pitch Shifter": {
        parameters: [
            { name: "Pitch", min: -135, max: 135, defaultAngle: 0 },
            { name: "Fine", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Rotary": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Rotary Pro": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Stereo Chorus": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Tape Wobble": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    }
};

// Component mapping for effects
const EFFECT_COMPONENTS = {
    "Fuzz": Fuzz,
    "Clipper" : Clipper,
    "ClassicDist" : ClassicDist,
    "Chorus" : Chorus,
    "Crusher" : Crusher,
    "JuicyDistrotion" : JuicyDistrotion,
    "Overdrive" : Overdrive,
    "AutoPan" : AutoPan,
    "AutoWah" : AutoWah,
    "Flanger" : Flanger,
    "Phaser" : Phaser,
    "Rotary" : Rotary,
    "StereoChorus" : StereoChorus,
    "TapeWobble" : TapeWobble
    // "Classic Dist": ClassicDist,
    // "Bitcrushar": Bitcrushar,
    // etc.
};

const initialState = {
    activeEffects: [], // Array of active effects with their parameters
    effectsLibrary: [
        { id: 1, name: "Bitcrushar", subscription: true, color: "#8F7CFD", category: "Distortion" },
        { id: 2, name: "Classic Dist", subscription: false, color: "#8F7CFD", category: "Distortion" },
        { id: 3, name: "Clipper", subscription: true, color: "#8F7CFD", category: "Distortion" },
        { id: 4, name: "Crusher", subscription: true, color: "#8F7CFD", category: "Distortion" },
        { id: 5, name: "Fuzz", subscription: false, color: "#8F7CFD", category: "Distortion", component: Fuzz },
        { id: 6, name: "Juicy Distrotion", subscription: true, color: "#8F7CFD", category: "Distortion" },
        { id: 7, name: "Overdrive", subscription: false, color: "#8F7CFD", category: "Distortion" },
        { id: 8, name: "Auto Pan", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 9, name: "Auto-Wah", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 10, name: "Chorus", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 11, name: "Flanger", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 12, name: "Instant Sidechain", subscription: true, color: "#409C9F", category: "Compression" },
        { id: 13, name: "Phaser", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 14, name: "Pitch Shifter", subscription: true, color: "#409C9F", category: "Pitch" },
        { id: 15, name: "Rotary", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 16, name: "Rotary Pro", subscription: true, color: "#409C9F", category: "Modulation" },
        { id: 17, name: "Stereo Chorus", subscription: false, color: "#409C9F", category: "Modulation" },
        { id: 18, name: "Tape Wobble", subscription: true, color: "#409C9F", category: "Modulation" },
    ],
    selectedEffect: null, // Currently selected effect for detailed view
    showEffectsLibrary: false, // Controls the effects library modal
    showEffectsOffcanvas: false, // Controls the Effects.jsx component visibility
};

const effectsSlice = createSlice({
    name: 'effects',
    initialState,
    reducers: {
        addEffect: (state, action) => {
            const effect = action.payload;
            
            // Map effect names to component keys
            const componentMapping = {
                "Classic Dist": "ClassicDist",
                "Juicy Distrotion": "JuicyDistrotion", 
                "Auto Pan": "AutoPan",
                "Auto-Wah": "AutoWah",
                "Stereo Chorus": "StereoChorus",
                "Tape Wobble": "TapeWobble"
            };
            
            const componentKey = componentMapping[effect.name] || effect.name;
            const component = EFFECT_COMPONENTS[componentKey];
            
            const newEffect = {
                ...effect,
                instanceId: Date.now(),
                component: component, // Add the component to the effect
                parameters: EFFECT_CONFIGS[effect.name]?.parameters || [
                    { name: "Parameter 1", min: -135, max: 135, defaultAngle: 0 },
                    { name: "Parameter 2", min: -135, max: 135, defaultAngle: 45 },
                    { name: "Parameter 3", min: -135, max: 135, defaultAngle: 90 }
                ]
            };
            console.log('====================================');
            console.log("newEffect :::>",newEffect);
            console.log('====================================');
            state.activeEffects.push(newEffect);
        },
        removeEffect: (state, action) => {
            const instanceId = action.payload;
            state.activeEffects = state.activeEffects.filter(effect => effect.instanceId !== instanceId);
        },
        updateEffectParameter: (state, action) => {
            const { instanceId, parameterIndex, value } = action.payload;
            const effect = state.activeEffects.find(e => e.instanceId === instanceId);
            if (effect && effect.parameters[parameterIndex]) {
                effect.parameters[parameterIndex].value = value;
            }
        },
        setSelectedEffect: (state, action) => {
            state.selectedEffect = action.payload;
        },
        setShowEffectsLibrary: (state, action) => {
            state.showEffectsLibrary = action.payload;
        },
        setShowEffectsOffcanvas: (state, action) => {
            state.showEffectsOffcanvas = action.payload;
        },
        toggleEffectsOffcanvas: (state) => {
            state.showEffectsOffcanvas = !state.showEffectsOffcanvas;
        },
        clearAllEffects: (state) => {
            state.activeEffects = [];
        },
        reorderEffects: (state, action) => {
            const { fromIndex, toIndex } = action.payload;
            const [removed] = state.activeEffects.splice(fromIndex, 1);
            state.activeEffects.splice(toIndex, 0, removed);
        }
    }
});

export const { 
    addEffect, 
    removeEffect, 
    updateEffectParameter, 
    setSelectedEffect, 
    setShowEffectsLibrary,
    setShowEffectsOffcanvas,
    toggleEffectsOffcanvas,
    clearAllEffects,
    reorderEffects
} = effectsSlice.actions;

export default effectsSlice.reducer; 