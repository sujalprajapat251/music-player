import { createSlice } from '@reduxjs/toolkit';

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

const EFFECT_CONFIGS = {
    "Classic Dist": {
        parameters: [
            { name: "Dist", min: -135, max: 135, defaultAngle: 45, value: 45 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 0, value: 0 },
            { name: "Low Cut", min: -135, max: 135, defaultAngle: -90, value: -90 }
        ]
    },
    "Chorus": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
        ]
    },
    "Flanger": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
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
        ]
    },
    "Clipper": {
        parameters: [
            { name: "Mix", min: -135, max: 135, defaultAngle: 0 },
            { name: "Amount", min: -135, max: 135, defaultAngle: 45 },
            { name: "Makeup", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Crusher": {
        parameters: [
            { name: "Low Cut", min: -135, max: 135, defaultAngle: 0 },
            { name: "High Cut", min: -135, max: 135, defaultAngle: 45 },
            { name: "Grain", min: -135, max: 135, defaultAngle: 90 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Fuzz": {
        parameters: [
            { name: "Grain", min: -135, max: 135, defaultAngle: 0 },
            { name: "Bite", min: -135, max: 135, defaultAngle: 45 },
            { name: "Low Cut", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Juicy Distrotion": {
        parameters: [
            { name: "Dist", min: -135, max: 135, defaultAngle: 0 },
            { name: "Volume", min: -135, max: 135, defaultAngle: 90 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 45 },
            { name: "Low Cut", min: -135, max: 135, defaultAngle: 45 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Overdrive": {
        parameters: [
            { name: "Dist", min: -135, max: 135, defaultAngle: 0 },
            { name: "Tone", min: -135, max: 135, defaultAngle: 45 },
            { name: "Low Cut", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Auto-Wah": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Mix", min: -135, max: 135, defaultAngle: 90 }
        ]
    },
    "Rotary": {
        parameters: [
            { name: "Rate", min: -135, max: 135, defaultAngle: 0 },
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
            { name: "Flutter Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Flutter Depth", min: -135, max: 135, defaultAngle: 45 },
            { name: "Wow Rate", min: -135, max: 135, defaultAngle: 0 },
            { name: "Wow Depth", min: -135, max: 135, defaultAngle: 45 }
        ]
    }
};

const EFFECT_COMPONENTS = {
    "Fuzz": Fuzz,
    "Clipper": Clipper,
    "ClassicDist": ClassicDist,
    "Chorus": Chorus,
    "Crusher": Crusher,
    "JuicyDistrotion": JuicyDistrotion,
    "Overdrive": Overdrive,
    "AutoPan": AutoPan,
    "AutoWah": AutoWah,
    "Flanger": Flanger,
    "Phaser": Phaser,
    "Rotary": Rotary,
    "StereoChorus": StereoChorus,
    "TapeWobble": TapeWobble
};

const initialState = {
    trackEffects: {}, // New: Store effects per track ID
    activeEffects: [],
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
    selectedEffect: null,
    showEffectsLibrary: false,
    showEffectsOffcanvas: false,
    showEffectsTwo: false, // Add this line
    activeTabs: '',
    selectedTrackId: null // New: Track which track is selected for effects
};

const effectsSlice = createSlice({
    name: 'effects',
    initialState,
    reducers: {
        addEffect: (state, action) => {
            const effect = action.payload;

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
                component: component,
                parameters: EFFECT_CONFIGS[effect.name]?.parameters || [
                    { name: "Parameter 1", min: -135, max: 135, defaultAngle: 0, value: 0 },
                    { name: "Parameter 2", min: -135, max: 135, defaultAngle: 45, value: 45 },
                    { name: "Parameter 3", min: -135, max: 135, defaultAngle: 90, value: 90 }
                ]
            };
            console.log('====================================');
            console.log("newEffect :::>", newEffect);
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
        },
        setShowEffectsTwo: (state, action) => {
            state.showEffectsTwo = action.payload;
        },
        setActiveTabs: (state, action) => {
            state.activeTabs = action.payload;
        },
        // New action to add effect to specific track
        addEffectToTrack: (state, action) => {
            const { trackId, effect } = action.payload;

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
                component: component,
                trackId: trackId, // Associate with specific track
                parameters: EFFECT_CONFIGS[effect.name]?.parameters || [
                    { name: "Parameter 1", min: -135, max: 135, defaultAngle: 0, value: 0 },
                    { name: "Parameter 2", min: -135, max: 135, defaultAngle: 45, value: 45 },
                    { name: "Parameter 3", min: -135, max: 135, defaultAngle: 90, value: 90 }
                ]
            };

            // Initialize track effects array if it doesn't exist
            if (!state.trackEffects[trackId]) {
                state.trackEffects[trackId] = [];
            }

            state.trackEffects[trackId].push(newEffect);
        },

        // New action to remove effect from specific track
        removeEffectFromTrack: (state, action) => {
            const { trackId, instanceId } = action.payload;
            if (state.trackEffects[trackId]) {
                // Filter out the effect with the specified instanceId
                state.trackEffects[trackId] = state.trackEffects[trackId].filter(
                    effect => effect.instanceId !== instanceId
                );
            }
        },

        // New action to update effect parameter for specific track
        updateTrackEffectParameter: (state, action) => {
            const { trackId, instanceId, parameterIndex, value } = action.payload;
            if (state.trackEffects[trackId]) {
                const effect = state.trackEffects[trackId].find(e => e.instanceId === instanceId);
                if (effect && effect.parameters[parameterIndex]) {
                    effect.parameters[parameterIndex].value = value;
                }
            }
        },

        // New action to set selected track for effects
        setSelectedTrackId: (state, action) => {
            state.selectedTrackId = action.payload;
        },

        // New action to get effects for specific track
        getTrackEffects: (state, action) => {
            const trackId = action.payload;
            return state.trackEffects[trackId] || [];
        },
    }
});

export const {
    addEffect,
    removeEffect,
    updateEffectParameter,
    addEffectToTrack,
    removeEffectFromTrack,
    updateTrackEffectParameter,
    setSelectedTrackId,
    getTrackEffects,
    setSelectedEffect,
    setShowEffectsLibrary,
    setShowEffectsOffcanvas,
    toggleEffectsOffcanvas,
    clearAllEffects,
    reorderEffects,
    setShowEffectsTwo,
    setActiveTabs
} = effectsSlice.actions;

export default effectsSlice.reducer;
