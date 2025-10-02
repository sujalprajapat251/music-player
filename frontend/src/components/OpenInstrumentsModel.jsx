import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Play,
  ChevronRight,
  Guitar,
  Drum,
  Keyboard,
  Disc2,
  Radio,
  Volume2
} from 'lucide-react';
import { IoClose } from "react-icons/io5";
import { isAction } from '@reduxjs/toolkit';

const InstrumentPresets = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('Keys');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Pianos');
  const [searchTerm, setSearchTerm] = useState('');
  const rightPanelRef = useRef(null);
  const sectionRefs = useRef({});
  const isSyncingFromScrollRef = useRef(false);

  useEffect(() => {
    const sectionElement = sectionRefs.current[selectedSubCategory];
    if (sectionElement) {
      if (isSyncingFromScrollRef.current) {
        // Skip auto-scrolling when selection was set from scroll sync
        isSyncingFromScrollRef.current = false;
        return;
      }
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSubCategory, selectedCategory, searchTerm]);

  // Sync middle-panel selection while scrolling the right panel
  useEffect(() => {
    const container = rightPanelRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const containerTop = container.getBoundingClientRect().top;
        const entries = Object.entries(sectionRefs.current || {});
        const list = entries
          .map(([sub, el]) => ({ sub, el, rect: el ? el.getBoundingClientRect() : null }))
          .filter(item => item.el && item.rect);

        if (list.length === 0) return;

        // Sort by vertical position
        list.sort((a, b) => a.rect.top - b.rect.top);

        // Find the last section whose top is at or above the container top (with small tolerance)
        const tolerance = 8; // px
        let active = null;
        for (let i = 0; i < list.length; i++) {
          if (list[i].rect.top - containerTop <= tolerance) {
            active = list[i];
          } else {
            break;
          }
        }

        // If none are at/above, pick the first one below the top
        if (!active) {
          active = list[0];
        }

        const nextSub = active?.sub;
        if (nextSub && nextSub !== selectedSubCategory) {
          isSyncingFromScrollRef.current = true;
          setSelectedSubCategory(nextSub);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedSubCategory, selectedCategory, searchTerm]);

  const categories = [
    { name: 'My Preset Collection', icon: <Disc2 className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { name: 'Guitar', icon: <Guitar className="w-4 h-4" />, color: 'bg-[#e3e3e3] dark:bg-[#37363a] text-gray-900 dark:text-white' },
    { name: 'Bass & 808s', icon: <Volume2 className="w-4 h-4" />, color: 'bg-[#e3e3e3] dark:bg-[#37363a]  text-gray-900 dark:text-white' },
    { name: 'Orchestral', icon: <Radio className="w-4 h-4" />, color: 'bg-[#e3e3e3] dark:bg-[#37363a] text-gray-900 dark:text-white' },
    { name: 'Keys', icon: <Keyboard className="w-4 h-4" />, color: 'bg-[#e3e3e3] dark:bg-[#37363a] text-gray-900 dark:text-white' },
    { name: 'Synths', icon: <Disc2 className="w-4 h-4" />, color: 'bg-[#e3e3e3] dark:bg-[#37363a] text-gray-900 dark:text-white' },
    { name: 'Drums & Machines', icon: <Drum className="w-4 h-4" />, color: 'bg-[#e3e3e3] dark:bg-[#37363a] text-gray-900 dark:text-white' }
  ];


  // Dynamic subcategories and presets
  const subCategoryMap = {
    'Keys': ['Choir', 'Organs', 'Other', 'Pianos', 'Pitched Percussion'],
    'Guitar': ['Acoustic', 'Guitar Chords', 'Jazz', 'Pop', 'Rock', 'Traditional'],
    'Bass & 808s': ['808', '808 (with glide)', 'Bass - Acoustic', 'Bass - Electric', 'Bass - Kick (808)', 'Bass - Log Drum', 'Bass - Synth', 'Desert 808 (with glide)'],
    'Orchestral': ['Bass', 'Cinematic', 'Harp', 'Processed', 'Solo orchestral', 'String Ensemble', 'String section', 'Woodwinds'],
    'Synths': ['8 Bit', 'Bells', 'Brass', 'Cowbell', 'Drums & Machines', 'Fx', 'Leads', 'Legacy', 'Misc', 'Orchestral', 'Pads', 'Plucked', 'Retro Synth `84', 'Rhythmic' ,'Synths', 'Voice'],
    'Drums & Machines': ['Collection', 'Kits', 'Machines', 'Percussion', 'Processed']
  };

  const presetMap = {
    
    'Guitar': {
      'Acoustic': [
        { name: 'Acoustic Guitar', trial: false },
        { name: 'Acoustic Guitar Mute', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Acoustic Guitar Pick', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Baldwin Guitar', trial: true, trialType: 'Music Production trial' },
        { name: 'Banjo', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Classical Guitar', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Djeli Ngoni', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Fire Guitar', trial: true, trialType: 'Music Production trial' },
        { name: "Grandpa's Guitar", trial: true, trialType: 'Sound Starter trial' },
        { name: 'London Guitar', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Sitar', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Sitar All Bends', trial: true, trialType: 'Music Production trial' },
        { name: 'Sitar Bends Up and Down', trial: true, trialType: 'Music Production trial' },
        { name: 'Sitar Ornaments', trial: true, trialType: 'Music Production trial' },
        { name: 'Ukulele', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Xalam', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Guitar Chords': [
        { name: '1984 Smokey Chords', trial: true, trialType: 'Sound Starter trial' },
        { name: 'British Stack Smokey', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Fat Riff Power Chords', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Jazz': [
        { name: '80s Pat', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bill Thrill', trial: false },
        { name: 'Delay No Swell', trial: false },
        { name: 'Delay Swell', trial: false },
        { name: 'Going Wes', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Jim`s Hall', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Mellow Jazz', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Mike`s Turn', trial: false },
        { name: 'Pat`s Secret', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Sco Ballad', trial: false },
        { name: 'Sco Modern', trial: false },
        { name: 'Sco in the Field', trial: false }
      ],
      'Pop': [
        { name: 'Big Skye Blues', trial: false },
        { name: 'Big and Clean', trial: false },
        { name: 'Clean', trial: false },
        { name: 'Clean Rhythm', trial: false },
        { name: 'Country', trial: false },
        { name: 'Deep Sky Lead', trial: false },
        { name: 'Dirty Riff', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Funk', trial: false },
        { name: 'Outlaw', trial: false },
        { name: 'Police Bottle', trial: false },
        { name: 'RnB Guitar', trial: false },
        { name: 'Rockabilly', trial: false },
        { name: 'Slick Blues', trial: false },
        { name: 'Swamp Blues', trial: false },
        { name: 'Swirly Chords', trial: false },
        { name: 'The Edge has No Name', trial: false }
      ],
      'Rock': [
        { name: '1984', trial: true, trialType: 'Sound Starter trial' },
        { name: '70s Blues Rock', trial: true, trialType: 'Sound Starter trial' },
        { name: 'AC-AC', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Fat Riff', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Fuzz in a Stack', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Mountain Top Lead', trial: false },
        { name: 'Mountain Top Lead II', trial: false },
        { name: 'Power Chord Long', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Power Chord Muted', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Power Chord Short', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Single Note Long', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Single Note Mute', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Single Note Short', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Spaghetti Lead', trial: false },
        { name: 'Warm Lead', trial: false }
      ],
      'Traditional': [
        { name: 'Kora', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Koto', trial: true, trialType: 'Sound Starter trial' },
      ],
    },
    'Bass & 808s': {
      '808': [
        { name: '808 Atom', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Bass Tube', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Broad Stereo Dist', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 NDA Clean', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Pi Bass', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Provider', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Yeast', trial: false },
        { name: 'DRM 808', trial: false },
        { name: 'Flag 808', trial: false },
        { name: 'Gritty Long Sub 808', trial: false },
        { name: 'Gritty Rumble 808', trial: false },
        { name: 'Hangry 808', trial: false },
        { name: 'Heavy 808', trial: false },
      ],
      '808 (with glide)': [
        { name: '808 Big Wide', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Big Wide Distortion', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Broad Stereo Dist', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Cash Clean', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Cash Tube 1', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Cash Tube 2', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Clean Harmonic', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 lgor', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Pitch Sqaueak', trial: true, trialType: 'Sound Starter trial' },
        { name: '808 Pitchdown', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Bass - Acoustic': [
        { name: 'Upright Bass', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Bass - Electric': [
        { name: 'Bass Harmonic', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bass VI Clean', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bass VI Pick', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Billy Rocka', trial: false },
        { name: 'Bone Bass', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bright Pick', trial: false },
        { name: 'Clean Bass Mute', trial: true, trialType: 'Sound Starter trial'},
        { name: 'Clean Electric', trial: false },
        { name: 'Clean Jazz', trial: false },
        { name: 'Clean Precision', trial: false },
        { name: 'Cliff Dist', trial: false },
      ],
      'Bass - Kick (808)': [
        { name: 'Sticky(Secrets)', trial: false },
      ],
      'Bass - Log Drum': [
        { name: 'Am I Log Bass', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Ama Davda Bass', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Kish`s Log', trial: true, trialType: 'Music Production trial' },
        { name: 'Log D Bass ', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Log Drum 5th', trial: true, trialType: 'Music Production trial' },
        { name: 'Log Drum Hi', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Log Drum Lo', trial: true, trialType: 'Music Production trial' },
      ],
      'Bass - Synth': [
        { name: '80s Synth Bass ', trial: false },
        { name: 'Acid Bass', trial: false },
        { name: 'Attack Bass', trial: false },
        { name: 'Bass Pipes', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bass Ringmod', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bass Ringmod Dist Open', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bass Squarie', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Basswave Bass', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Desert 808 (with glide)': [
        { name: 'Bandoz 808', trial: false },
        { name: 'Blast 808', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Blower 808', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bouncer 808', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Cacti', trial: true, trialType: 'Sound Starter trial' },
      ],
    },
    'Orchestral': {
      'Bass': [
        { name: 'Big Band Trumpet', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Frech Horn', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Trombone', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Cinematic': [
        { name: 'Cello - Legato', trial: true, trialType: 'Music Production trial' },
        { name: 'Cello - Pizzicato', trial: true, trialType: 'Music Production trial' },
        { name: 'Cello - Spiccato', trial: true, trialType: 'Music Production trial' },
        { name: 'Cello - Staccato', trial: true, trialType: 'Music Production trial' },
        { name: 'Cello - Tremolo Fast', trial: true, trialType: 'Music Production trial' },
      ],
      'Harp': [
        { name: 'Celtic Harp', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Orchestral Harp', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Processed': [
        { name: 'Deturned String Sample', trial: true, trialType: 'Music Production trial' },
        { name: 'Gritty Cello', trial: true, trialType: 'Music Production trial' },
        { name: 'Hype Cello', trial: true, trialType: 'Music Production trial' }
      ],
      'Solo orchestral': [
        { name: 'Cello - Pizzicato', trial: false },
        { name: 'Cello - Spiccato', trial: true, trialType: 'Music Production trial' },
        { name: 'Double Bass - Pizzicato', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Double Bass - Spiccato', trial: true, trialType: 'Music Production trial' },
        { name: 'Viola - Pizzicato', trial: false }
      ],
      'String Ensemble': [
        { name: 'String Ensemble - Chamber', trial: true, trialType: 'Music Production trial' },
        { name: 'String Ensemble - Orchestral', trial: true, trialType: 'Music Production trial' },
        { name: 'String Ensemble - Studio', trial: true, trialType: 'Music Production trial' }
      ],
      'String section': [
        { name: 'Cello- Chamber', trial: true, trialType: 'Music Production trial' },
        { name: 'Cello - Orchestral', trial: true, trialType: 'Music Production trial' },
        { name: 'Double Bass - Chamber', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Double Bass - Orchestral', trial: true, trialType: 'Music Production trial' }
      ],
      'Woodwinds': [
        { name: 'African Pan Flute', trial: false },
        { name: 'Alto Saxophone', trial: true, trialType: 'Music Production trial' },
        { name: 'Alto Saxophone - Legato', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Alto Saxophone - Staccato', trial: true, trialType: 'Music Production trial' },
      ],
    },
    'Keys': {
      'Choir': [
        { name: "Aah Female Alto", trial: true, trialType: 'Sound Starter trial' },
        { name: 'Aah Female Soprano', trial: true, trialType: 'Music Production trial' },
        { name: 'Aah Male Barytone', trial: true, trialType: 'Music Production trial' },
        { name: 'Aah Male Tenor', trial: true, trialType: 'Music Production trial' },
        { name: 'Aah Mixed Choir', trial: false },
      ],
      'Organs': [
        { name: '8888 Organ Fast',  trial: false },
        { name: '8888 Organ slow', trial: false },
        { name: 'Cheap Organ', trial: true, trialType: 'Music Production trial' },
        { name: 'Child Organ', trial: true, trialType: 'Music Production trial' },
      ],
      'Other': [
        { name: 'Accordian', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Accordian Bass & Chords', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Accordian Oboe', trial: true, trialType: 'Music Production trial' },
        { name: 'Celesta', trial: false },
      ],
      'Pianos': [
        { name: 'Grand Piano', trial: false },
        { name: "Grandma's Ocean Wave", trial: true, trialType: 'Sound Starter trial' },
        { name: "Grandma's Piano", trial: true, trialType: 'Sound Starter trial' },
        { name: 'Harpsichord - Clean', trial: true, trialType: 'Music Production trial' },
        { name: 'Harpsichord - Lo-fi', trial: true, trialType: 'Music Production trial' },
        { name: 'Harpsichord - Main', trial: true, trialType: 'Music Production trial' },
        { name: 'Jazz Chord Memos', trial: false },
        { name: "Laura's Rhodes", trial: false },
        { name: 'Lo-fi Upright Piano', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Pianet', trial: false },
        { name: 'Pianizer', trial: false },
        { name: 'Pink Carol', trial: false }
      ],
      'Pitched Percussion': [
        { name: 'Glockenspiel 1', trial: false },
        { name: "Glockenspiel 2", trial: true, trialType: 'Sound Starter trial' },
        { name: "Kalimba", trial: true, trialType: 'Sound Starter trial' },
        { name: 'Kalimba Sansula', trial: true, trialType: 'Music Production trial' },
        { name: 'Kalimba Solid', trial: true, trialType: 'Music Production trial' },
      ],
    },
    'Synths': {
      '8 Bit': [
        { name: '8 Bit Bass', trial: true, trialType: 'Music Production trial' },
        { name: '8 Bit Coins', trial: true, trialType: 'Music Production trial' },
        { name: '8 Bit It`s-a-me', trial: true, trialType: 'Sound Starter trial' },
        { name: '8 Bit Lead', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Bells': [
        { name: 'Bell Piano', trial: false },
        { name: 'Bellish', trial: false },
        { name: 'Crown', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Dialog Lead', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Dirty Bell', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Ice Bell', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Brass': [
        { name: 'Amazon Brass', trial: false },
        { name: 'Brass Next Door', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Cheap Brass', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Cowbell': [
        { name: 'Cowbell Crunch', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Cowbell Phonk', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Drums & Machines': [
        { name: 'Tomato One Dry', trial: true, trialType: 'Music Production trial' },
      ],
      'Fx': [
        { name: 'Alarm', trial: false },
        { name: 'Alarmed', trial: false },
        { name: 'Atlantis', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Lone Star', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Leads': [
        { name: 'Broken Square', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Carbon Lead', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Legacy': [
        { name: 'Attack Me', trial: false },
        { name: 'Bells in Agony', trial: false },
        { name: 'Berlin Lead', trial: false },
        { name: 'Clean Bell', trial: false },
      ],
      'Misc': [
        { name: 'Check The Fax', trial: false },
        { name: 'Game Over', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Orchestral': [
        { name: 'After 8 Synth', trial: false },
        { name: 'Console Strings', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Pads': [
        { name: '80s Pad', trial: false },
        { name: 'Andromeda Waves', trial: false },
        { name: 'Atlantic Fm', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Plucked': [
        { name: 'Analog Mallet', trial: true, trialType: 'Music Production trial' },
        { name: 'Cheap Guitar', trial: false }
      ],
      'Retro Synth `84': [
        { name: 'Amaie Yume', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Arp Fast', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Better Eyes', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Rhythmic': [
        { name: 'Bell Repeater', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Bobble', trial: false },
        { name: 'Digital Glitter', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Synths': [
        { name: 'Academy Piano', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Big Bee', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Cushy', trial: false },
      ],
      'Voice': [
        { name: '"Ai"', trial: false },
        { name: 'Angel', trial: true, trialType: 'Music Production trial' },
        { name: 'Mellow', trial: false }
      ],
    },
    'Drums & Machines': {
      'Collection': [
        { name: 'Crystal - Claps & Snares', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Crystal - Kicks', trial: true, trialType: 'Sound Starter trial' },
        { name: 'G.O.A.T - Hi Hats', trial: true, trialType: 'Sound Starter trial' },
        { name: 'G.O.A.T - Kicks', trial: true, trialType: 'Sound Starter trial' },
        { name: 'G.O.A.T - Snares', trial: true, trialType: 'Sound Starter trial' },
      ],
      'Kits': [
        { name: '90s Rnb', trial: true, trialType: 'Music Production trial' },
        { name: 'Bass Code', trial: true, trialType: 'Music Production trial' },
        { name: 'Big Beat', trial: true, trialType: 'Music Production trial' },
        { name: 'Clean Black', trial: false },
        { name: 'Clean Red', trial: false }
      ],
      'Machines': [
        { name: '8 Bit Kit', trial: true, trialType: 'Music Production trial' },
        { name: '80s Drum Machine', trial: false },
        { name: 'Angelo', trial: false },
        { name: 'Anthem', trial: false },
        { name: 'Arcane', trial: false },
        { name: 'Blip Blop', trial: true, trialType: 'Sound Starter trial' }
      ],
      'Percussion': [ 
        { name: 'Calabash', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Dholak', trial: true, trialType: 'Sound Starter trial' },
        { name: 'Tabla', trial: true, trialType: 'Music Production trial' },
        { name: 'Taiko', trial: true, trialType: 'Music Production trial' },
      ],
      'Processed': [
        { name: 'Dist Curve', trial: true, trialType: 'Music Production trial' },
        { name: 'Garage Kit', trial: true, trialType: 'Music Production trial' },
        { name: 'Mono Kit', trial: true, trialType: 'Music Production trial' },
        { name: 'Muffled', trial: false }
      ],
    }
  };

  // Get subcategories for selectedCategory
  const subCategories = subCategoryMap[selectedCategory] || [];
  // Get presets for selectedCategory and selectedSubCategory
  const currentPresets = (presetMap[selectedCategory] && presetMap[selectedCategory][selectedSubCategory]) || [];
  const filteredPresets = currentPresets.filter(preset =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // return (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center">
  //     {/* Overlay */}
  //     <div className="absolute inset-0 bg-black bg-opacity-50" />
  //     {/* Modal Box Centered */}
  //     <div className="relative bg-[#262529] rounded-lg border border-[#23232A] shadow-2xl w-full max-w-3xl mx-auto flex flex-col" style={{ height: '660px', width: '900px' }}>
  //       {/* Header and Close */}
  //       <div className="flex items-center justify-between p-5 border-b border-[#36363C]">
  //         <h2 className="text-2xl font-semibold text-white ml-5">Instrument presets</h2>
  //         <div className="relative w-full max-w-xs ml-auto">
  //           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#c0c0c0] w-4 h-4" />
  //           <input
  //             type="text"
  //             placeholder="Search"
  //             className="w-full bg-[#1e1d20] border border-[#343238] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-[#c0c0c0] focus:outline-none focus:border-[#a78ae6]"
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //           />
  //         </div>
  //         <button className="ml-4 mb-6 text-gray-400 hover:text-white transition-colors" onClick={onClose}>
  //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //           </svg>
  //         </button>
  //       </div>
  //       {/* Three Columns */}
  //       <div className="flex flex-1 min-h-[400px]">
  //         {/* Left Sidebar */}
  //         <div className="w-64 bg-[#262529] border-r border-[#37363a]"> 
  //           {categories.map((category, index) => (
  //             <div
  //               key={index}
  //               className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer border-b border-[#36363c] hover:bg-[#2c2b2f] transition-colors ${
  //                 category.name === selectedCategory ? 'bg-[#2f2e31]' : ''
  //               }`}
  //               onClick={() => {
  //                 sectionRefs.current = {};
  //                 setSelectedCategory(category.name);
  //                 if (category.name === 'Guitar') {
  //                   setSelectedSubCategory('Acoustic');
  //                 } else if (category.name === 'Bass & 808s') {
  //                   setSelectedSubCategory('808');
  //                 } else if (subCategoryMap[category.name]) {
  //                   setSelectedSubCategory(subCategoryMap[category.name][0]);
  //                 }
  //               }}
  //             >
  //               <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
  //                 {category.icon}
  //               </div>
  //               <span className="text-sm font-medium">{category.name}</span>
  //             </div>
  //           ))}
  //         </div>
          
  //         {selectedCategory === 'My Preset Collection' ? (
  //           // Parent container
  //           <div className="flex-1 flex items-center justify-center bg-[#1e1d20] text-[#e2e2e2]">
  //             <div className="flex flex-col items-center justify-center text-center ">
  //               {/* Dummy cards */}
  //               <div className="space-y-2 mb-6">
  //                 {[1, 2, 3].map((item) => (
  //                   <div
  //                     key={item}
  //                     className="flex items-center bg-[#262529] w-80 h-12 rounded px-3 space-x-3"
  //                   >
  //                     {/* Play button */}
  //                     <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-white" />
                      
  //                     {/* Text lines */}
  //                     <div className="flex flex-col space-y-1 w-full">
  //                       <div className="h-2 bg-[#7f7b87] rounded w-2/3" />
  //                       <div className="h-2 bg-[#7f7b87] rounded w-1/2" />
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>

  //               <p>Your custom presets will end up here.</p>
  //               <a href="#" className="text-[#a78ae6] text-sm mt-2 underline">
  //                 Learn how
  //               </a>
  //             </div>
  //           </div>
  //           ) : (
  //             <>
  //               {/* Middle Panel - Subcategories */}
  //               <div className="w-64 bg-[#262529] border-r border-[#37363a] overflow-y-auto">
  //                 {subCategories.map((sub, idx) => {
  //                   const isActive = sub === selectedSubCategory;
  //                   return (
  //                     <div
  //                       key={idx}
  //                       className={`px-3 py-3 border-b border-[#36363c] rounded-md cursor-pointer transition-colors ${
  //                         isActive
  //                           ? 'bg-[#2f2e31] text-white font-semibold'
  //                           : 'text-gray-300 hover:bg-[#2c2b2f] hover:text-white'
  //                       }`}
  //                       onClick={() => setSelectedSubCategory(sub)}
  //                     >
  //                       <span className="text-sm">{sub}</span>
  //                     </div>
  //                   );
  //                 })}
  //               </div>
                
  //           {/* Right Panel - Presets List */}
  //               <div ref={rightPanelRef} className="flex-1 bg-[#262529] overflow-y-auto">
  //                 {(['Guitar', 'Bass & 808s','Orchestral', 'Keys', 'Synths','Drums & Machines'].includes(selectedCategory) ? subCategories : [selectedSubCategory]).map((sub, idx) => {
  //                   // Filter presets by search term
  //                   const presets = (presetMap[selectedCategory] && presetMap[selectedCategory][sub]) || [];
  //                   const filtered = presets.filter(preset =>
  //                     preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  //                   );
  //                   if (filtered.length === 0) return null;
  //                   return (
  //                     <div key={sub} ref={(el) => { if (el) sectionRefs.current[sub] = el; }} className="">
  //                       <div className="flex items-center justify-between px-3 py-3 border-b border-[#36363c] bg-[#37363a] z-10">
  //                         <div className="font-semibold text-white">{sub} <span className="text-gray-400">({filtered.length})</span></div>
  //                       </div>
  //                       {filtered.map((preset, index) => (
  //                         <div
  //                           key={index}
  //                           className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-[#2c2b2f] cursor-pointer transition-colors group border-b border-[#36363c]"
  //                         >
  //                           <div className="flex items-center gap-3">
  //                             <Play className="w-4 h-4 text-white" />
  //                             <div>
  //                               <div className="text-white font-medium text-sm">
  //                                 {preset.name}
  //                               </div>
  //                               {preset.trial && (
  //                                 <div className="text-gray-400 text-xs">
  //                                   Start free {preset.trialType}
  //                                 </div>
  //                               )}
  //                             </div>
  //                           </div>
  //                           <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
  //                         </div>
  //                       ))}
  //                     </div>
  //                   );
  //                 })}
  //               </div>
  //             </>
  //           )}
  //         </div>
  //     </div>
  //   </div>
  // );

  // return (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center">
  //     {/* Overlay */}
  //     <div className="absolute inset-0 bg-black bg-opacity-50" />
  //     {/* Modal Box Centered */}
  //     <div className="relative bg-[#262529] rounded-lg border border-[#23232A] shadow-2xl w-full sm:max-w-[500px] max-w-3xl mx-auto flex flex-col" style={{ height: '660px', width: '900px' }}>
  //       {/* Header and Close */}
  //       <div className="flex items-center justify-between p-5 border-b border-[#36363C]">
  //         <h2 className="text-2xl font-semibold text-white ml-5">Instrument presets</h2>
  //         <div className="relative w-full max-w-xs ml-auto">
  //           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#c0c0c0] w-4 h-4" />
  //           <input
  //             type="text"
  //             placeholder="Search"
  //             className="w-full bg-[#1e1d20] border border-[#343238] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-[#c0c0c0] focus:outline-none focus:border-[#a78ae6]"
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //           />
  //         </div>
  //         <button className="ml-4 mb-6 text-gray-400 hover:text-white transition-colors" onClick={onClose}>
  //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  //           </svg>
  //         </button>
  //       </div>
  //       {/* Three Columns */}
  //       <div className="flex flex-1 min-h-[400px]">
  //         {/* Left Sidebar */}
  //         <div className="w-64 bg-[#262529] border-r border-[#37363a]"> 
  //           {categories.map((category, index) => (
  //             <div
  //               key={index}
  //               className={`flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer border-b border-[#36363c] hover:bg-[#2c2b2f] transition-colors ${
  //                 category.name === selectedCategory ? 'bg-[#2f2e31]' : ''
  //               }`}
  //               onClick={() => {
  //                 sectionRefs.current = {};
  //                 setSelectedCategory(category.name);
  //                 if (category.name === 'Guitar') {
  //                   setSelectedSubCategory('Acoustic');
  //                 } else if (category.name === 'Bass & 808s') {
  //                   setSelectedSubCategory('808');
  //                 } else if (subCategoryMap[category.name]) {
  //                   setSelectedSubCategory(subCategoryMap[category.name][0]);
  //                 }
  //               }}
  //             >
  //               <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
  //                 {category.icon}
  //               </div>
  //               <span className="text-sm font-medium">{category.name}</span>
  //             </div>
  //           ))}
  //         </div>
          
  //         {selectedCategory === 'My Preset Collection' ? (
  //           // Parent container
  //           <div className="flex-1 flex items-center justify-center bg-[#1e1d20] text-[#e2e2e2]">
  //             <div className="flex flex-col items-center justify-center text-center ">
  //               {/* Dummy cards */}
  //               <div className="space-y-2 mb-6">
  //                 {[1, 2, 3].map((item) => (
  //                   <div
  //                     key={item}
  //                     className="flex items-center bg-[#262529] w-80 h-12 rounded px-3 space-x-3"
  //                   >
  //                     {/* Play button */}
  //                     <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-white" />
                      
  //                     {/* Text lines */}
  //                     <div className="flex flex-col space-y-1 w-full">
  //                       <div className="h-2 bg-[#7f7b87] rounded w-2/3" />
  //                       <div className="h-2 bg-[#7f7b87] rounded w-1/2" />
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>

  //               <p>Your custom presets will end up here.</p>
  //               <a href="#" className="text-[#a78ae6] text-sm mt-2 underline">
  //                 Learn how
  //               </a>
  //             </div>
  //           </div>
  //           ) : (
  //             <>
  //               {/* Middle Panel - Subcategories */}
  //               <div className="w-64 bg-[#262529] border-r border-[#37363a] overflow-y-auto">
  //                 {subCategories.map((sub, idx) => {
  //                   const isActive = sub === selectedSubCategory;
  //                   return (
  //                     <div
  //                       key={idx}
  //                       className={`px-3 py-3 border-b border-[#36363c] rounded-md cursor-pointer transition-colors ${
  //                         isActive
  //                           ? 'bg-[#2f2e31] text-white font-semibold'
  //                           : 'text-gray-300 hover:bg-[#2c2b2f] hover:text-white'
  //                       }`}
  //                       onClick={() => setSelectedSubCategory(sub)}
  //                     >
  //                       <span className="text-sm">{sub}</span>
  //                     </div>
  //                   );
  //                 })}
  //               </div>
                
  //           {/* Right Panel - Presets List */}
  //               <div ref={rightPanelRef} className="flex-1 bg-[#262529] overflow-y-auto">
  //                 {(['Guitar', 'Bass & 808s','Orchestral', 'Keys', 'Synths','Drums & Machines'].includes(selectedCategory) ? subCategories : [selectedSubCategory]).map((sub, idx) => {
  //                   // Filter presets by search term
  //                   const presets = (presetMap[selectedCategory] && presetMap[selectedCategory][sub]) || [];
  //                   const filtered = presets.filter(preset =>
  //                     preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  //                   );
  //                   if (filtered.length === 0) return null;
  //                   return (
  //                     <div key={sub} ref={(el) => { if (el) sectionRefs.current[sub] = el; }} className="">
  //                       <div className="flex items-center justify-between px-3 py-3 border-b border-[#36363c] bg-[#37363a] z-10">
  //                         <div className="font-semibold text-white">{sub} <span className="text-gray-400">({filtered.length})</span></div>
  //                       </div>
  //                       {filtered.map((preset, index) => (
  //                         <div
  //                           key={index}
  //                           className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-[#2c2b2f] cursor-pointer transition-colors group border-b border-[#36363c]"
  //                         >
  //                           <div className="flex items-center gap-3">
  //                             <Play className="w-4 h-4 text-white" />
  //                             <div>
  //                               <div className="text-white font-medium text-sm">
  //                                 {preset.name}
  //                               </div>
  //                               {preset.trial && (
  //                                 <div className="text-gray-400 text-xs">
  //                                   Start free {preset.trialType}
  //                                 </div>
  //                               )}
  //                             </div>
  //                           </div>
  //                           <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
  //                         </div>
  //                       ))}
  //                     </div>
  //                   );
  //                 })}
  //               </div>
  //             </>
  //           )}
  //         </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      {/* Modal Box Centered */}
      <div className="relative bg-white dark:bg-[#262529] rounded-lg border border-[#fdfdfd] dark:border-[#23232A] shadow-2xl w-full sm:max-w-[420px] md:max-w-2xl lg:max-w-3xl 2xl:max-w-3xl 3xl:max-w-3xl mx-auto flex flex-col h-[400px] w-[900px] sm:h-[590px] md:h-[600px] lg:h-[650px]">
        {/* Header and Close */}
        <div className="flex items-center justify-between p-5 border-b border-[#36363C]">
          <h2 className="text-2xl sm:text-[17px] md:text-xl sm:ml-0 md:ml-5 font-semibold text-black dark:text-white">Instrument presets</h2>
          <div className="relative w-full max-w-xs sm:max-w-[150px] md:max-w-[240px] lg:max-w-[260px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-[#c0c0c0] w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#f8f8f8] dark:bg-[#1e1d20] border border-[#d8d8d8] dark:border-[#343238] rounded-md pl-10 pr-4 py-2 text-sm text-gray-500 dark:text-white placeholder-[#c0c0c0] focus:outline-none focus:border-[#a78ae6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="ml-4 mb-6 sm:ml-3 md:ml-8 lg:ml-12 text-gray-400 hover:text-gray-500 dark:hover:text-white transition-colors" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Three Columns */}
        <div className="flex flex-1 min-h-[400px]">
          {/* Left Sidebar */}
          <div className="w-64 bg-white dark:bg-[#262529] sm:w-36 md:w-56 lg:w-64 border-r border-[#e3e3e3] dark:border-[#37363a]"> 
            {categories.map((category, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer border-b border-[#e3e3e3] dark:border-[#36363c] text-[#3d3d3d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2c2b2f] transition-colors ${
                  category.name === selectedCategory ? 'bg-[#d7d7d7] dark:bg-[#2f2e31] text-[#2f2f2f] dark:text-white' : ''
                }`}
                onClick={() => {
                  sectionRefs.current = {};
                  setSelectedCategory(category.name);
                  if (category.name === 'Guitar') {
                    setSelectedSubCategory('Acoustic');
                  } else if (category.name === 'Bass & 808s') {
                    setSelectedSubCategory('808');
                  } else if (subCategoryMap[category.name]) {
                    setSelectedSubCategory(subCategoryMap[category.name][0]);
                  }
                }}
              >
                <div className={`w-8 h-8 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full ${category.color} flex items-center justify-center`}>
                  {category.icon}
                </div>
                <span className="text-sm sm:text-[12px] md:text-[14px] font-medium">{category.name}</span>
              </div>
            ))}
          </div>
          
          {selectedCategory === 'My Preset Collection' ? (
            // Parent container
            <div className="flex-1 flex items-center justify-center bg-[#f8f8f8] dark:bg-[#1e1d20] text-gray-900 dark:text-[#e2e2e2]">
              <div className="flex flex-col items-center justify-center text-center ">
                {/* Dummy cards */}
                <div className="space-y-2 mb-6">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center bg-[#fdfdfd] dark:bg-[#262529] w-80 h-12 sm:w-56 sm:h-10 md:w-80 md:h-12 rounded px-3 space-x-3"
                    >
                      {/* Play button */}
                      <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-black dark:border-l-white" />
                      
                      {/* Text lines */}
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="h-2 bg-[#7f7f7f] dark:bg-[#7f7b87] rounded w-2/3" />
                        <div className="h-2 bg-[#7f7f7f] dark:bg-[#7f7b87] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>

                <p className='text-md sm:text-[14px]'>Your custom presets will end up here.</p>
                <a href="#" className="text-[#430877] dark:text-[#a78ae6] text-sm sm:text-[14px] mt-2 underline">
                  Learn how
                </a>
              </div>
            </div>
            ) : (
              <>
                {/* Middle Panel - Subcategories */}
                <div className="w-64 sm:w-32 md:w-52 lg:w-60 bg-white dark:bg-[#262529] border-r border-[#e3e3e3] dark:border-[#37363a] overflow-y-auto">
                  {subCategories.map((sub, idx) => {
                    const isActive = sub === selectedSubCategory;
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-3 border-b border-[#e3e3e3] dark:border-[#36363c] text-[#3d3d3d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2c2b2f] rounded-sm cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[#d7d7d7] dark:bg-[#2f2e31] text-[#2f2f2f] dark:text-white font-semibold' : ''
                        }`}
                        onClick={() => setSelectedSubCategory(sub)}
                      >
                        <span className="text-sm sm:text-[12px] md:text-[14px]">{sub}</span>
                      </div>
                    );
                  })}
                </div>
                
            {/* Right Panel - Presets List */}
                <div ref={rightPanelRef} className="flex-1 bg-white dark:bg-[#262529] overflow-y-auto">
                  {(['Guitar', 'Bass & 808s','Orchestral', 'Keys', 'Synths','Drums & Machines'].includes(selectedCategory) ? subCategories : [selectedSubCategory]).map((sub, idx) => {
                    // Filter presets by search term
                    const presets = (presetMap[selectedCategory] && presetMap[selectedCategory][sub]) || [];
                    const filtered = presets.filter(preset =>
                      preset.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    if (filtered.length === 0) return null;
                    return (
                      <div key={sub} ref={(el) => { if (el) sectionRefs.current[sub] = el; }} className="">
                        <div className="flex items-center justify-between px-3 py-3 sm:px-3 sm:py-2 md:px-3 md:py-3 border-b border-[#e3e3e3] dark:border-[#36363c] bg-[#e3e3e3] dark:bg-[#37363a] z-10">
                          <div className="font-semibold text-gray-900 dark:text-white sm:text-[13px] md:text-[15px]">{sub} <span className="text-gray-700 dark:text-gray-400">({filtered.length})</span></div>
                        </div>
                        {filtered.map((preset, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-3 sm:px-3 sm:py-2 md:px-3 md:py-3 rounded-sm border-b border-[#e3e3e3] dark:border-[#36363c] text-[#3d3d3d] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2c2b2f] cursor-pointer transition-colors group border-b border-[#36363c]"
                          >
                            <div className="flex items-center gap-3">
                              <Play className="w-4 h-4 text-black dark:text-white" />
                              <div>
                                <div className="text-gray-700 dark:text-white font-medium text-sm sm:text-[12px] md:text-sm">
                                  {preset.name}
                                </div>
                                {preset.trial && (
                                  <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-[11px] md:text-xs">
                                    Start free {preset.trialType}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-900 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
      </div>
    </div>
  )
};

export default InstrumentPresets;