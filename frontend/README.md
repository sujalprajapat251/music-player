# Music Player Frontend

## Track Volume Control Features

### Individual Track Volume Control
Each track now has its own volume control that works independently of the master volume. Here's how to use it:

#### Visual Controls
- **Volume Knob**: Each track in the sidebar has a volume knob that you can drag up/down to adjust volume
- **Volume Display**: The current volume percentage is shown below the knob
- **Real-time Updates**: Volume changes are applied immediately to the audio

#### Keyboard Shortcuts
- **Ctrl+↑ or Alt+↑**: Increase selected track volume by 5%
- **Ctrl+↓ or Alt+↓**: Decrease selected track volume by 5%

#### Context Menu Options
Right-click on any track to access volume controls:
- **Volume Up**: Increase volume by 10%
- **Volume Down**: Decrease volume by 10%
- **Reset Volume**: Set volume back to default (80%)

#### Volume Calculation
The final volume is calculated as:
- **Master Volume** (global control) + **Track Volume** (individual control)
- Both volumes range from 0-100%
- The system automatically converts to decibels for audio processing

#### Features
- **Volume Persistence**: Track volumes are saved in the Redux store
- **Visual Feedback**: Volume changes show a temporary indicator on screen
- **Mute Integration**: Volume controls work properly with mute/solo functionality
- **Default Values**: New tracks start with 80% volume

### Usage Tips
1. Select a track by clicking on it in the sidebar
2. Use the volume knob for fine control
3. Use keyboard shortcuts for quick adjustments
4. Use context menu for larger volume changes
5. The master volume affects all tracks globally
6. Individual track volumes allow for precise mixing

## Other Features
[Existing documentation...]
