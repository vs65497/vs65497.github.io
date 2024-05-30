export class Sound {
    constructor() {
        this.keys;
        this.mappings = mappings;
        this.reset = mappings;

        this.setKeys();
    }

    init_sound() 
    {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audio = new AudioContext();
        const sine = (new SoundPlayer(audio));
        const sine2 = (new SoundPlayer(audio));

        var form = document.getElementsByTagName("form")[0];
    
        var soundbtn = document.createElement("input");
        soundbtn.setAttribute("type","button");
        soundbtn.setAttribute("name","sine");
        soundbtn.setAttribute("value","sine");
        soundbtn.addEventListener('click',function(){
            var index = mappings[13];
            var note1 = notes[index[0]];
            var note2 = notes[index[1]];

            var delay = 0.2;
            var vol = 0.02;
            sine.play(note1, 0.1, "sine").stop(1);
            sine.play(note2, 0.1, "sine").stop(1);
            /*sine.play(note, vol*7, "sine").stop(delay*7);
            sine.setVolume(vol*6, delay*1);
            sine.setVolume(vol*5, delay*2);
            sine.setVolume(vol*4, delay*3);
            sine.setVolume(vol*3, delay*4);
            sine.setVolume(vol*2, delay*5);
            sine.setVolume(vol*1, delay*6);*/
        });

        var soundbtn2 = document.createElement("input");
        soundbtn2.setAttribute("type","button");
        soundbtn2.setAttribute("name","sine2");
        soundbtn2.setAttribute("value","sine2");
        soundbtn2.addEventListener('click',function(){
            var delay = 0.2;
            sine2.play(750.0, 0.02*5, "sine").stop(delay*7);
            sine2.setFrequency(745.0, delay*1);
            sine2.setFrequency(740.0, delay*2);
            sine2.setFrequency(735.0, delay*3);
            sine2.setFrequency(730.0, delay*4);
            sine2.setFrequency(725.0, delay*5);
            sine2.setFrequency(720.0, delay*6);
        });
    
        form.appendChild(soundbtn);
        form.appendChild(soundbtn2);
    }

    setKeys() {
        this.keys = [];

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audio = new AudioContext();

        for (var i = 0; i < this.mappings.length; i++) {
            var index = this.mappings[i];
            var note1 = notes[index[0]];
            var note2 = notes[index[1]];

            this.keys.push({
                "player1": (new SoundPlayer(audio)),
                "player2": (new SoundPlayer(audio)),
                "note1": note1,
                "note2": note2,
                "name1": index[0],
                "name2": index[1]
            });
            //console.log(note1, note2);
        }
    }

    resetKeys() {
        this.mappings = this.reset;
        this.setKeys();
    }

    setMappings(newMappings) {
        this.mappings = newMappings;
        this.setKeys();
    }

    main() {
        Sound.prototype.init_sound();
    }
}

// Original JavaScript code by Chirp Internet: www.chirpinternet.eu
// Please acknowledge use of this code by including this header.
// https://www.the-art-of-web.com/javascript/creating-sounds/

function SoundPlayer(audioContext, filterNode) {

this.audioCtx = audioContext;
this.gainNode = this.audioCtx.createGain();

if(filterNode) {
    // run output through extra filter (already connected to audioContext)
    this.gainNode.connect(filterNode);
} else {
    this.gainNode.connect(this.audioCtx.destination);
}

this.oscillator = null;
}

SoundPlayer.prototype.setFrequency = function(val, when) {
if(this.oscillator !== null) {
    if(when) {
    this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime + when);
    } else {
    this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime);
    }
}
return this;
};

SoundPlayer.prototype.setVolume = function(val, when) {
if(when) {
    this.gainNode.gain.exponentialRampToValueAtTime(val, this.audioCtx.currentTime + when);
} else {
    this.gainNode.gain.setValueAtTime(val, this.audioCtx.currentTime);
}
return this;
};

SoundPlayer.prototype.setWaveType = function(waveType) {
this.oscillator.type = waveType;
return this;
};

SoundPlayer.prototype.play = function(freq, vol, wave, when) {
this.oscillator = this.audioCtx.createOscillator();
this.oscillator.connect(this.gainNode);
this.setFrequency(freq);
if(wave) {
    this.setWaveType(wave);
}
this.setVolume(1/1000);

if(when) {
    this.setVolume(1/1000, when - 0.02);
    this.oscillator.start(when - 0.02);
    this.setVolume(vol, when);
} else {
    this.oscillator.start();
    this.setVolume(vol, 0.02);
}

return this;
};

SoundPlayer.prototype.stop = function(when) {
if(when) {
    this.gainNode.gain.setTargetAtTime(1/1000, this.audioCtx.currentTime + when - 0.05, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + when);
} else {
    this.gainNode.gain.setTargetAtTime(1/1000, this.audioCtx.currentTime, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + 0.05);
}
return this;
};

var notes = {
    "C": 261.63,
    "C#": 277.18,
    "D": 293.66,
    "D#": 311.13,
    "E": 329.63,
    "F": 349.23,
    "F#": 369.99,
    "G": 392.00,
    "G#": 415.30,
    "A": 440.00,
    "A#": 466.16,
    "B": 493.88,
    "X": 0
};

/*var mappings = [
    ["C", "X"], ["C#", "X"],["D", "X"],["D#", "X"],["E", "X"],["F", "X"],["F#", "X"],["G", "X"],["G#", "X"],["A", "X"],["A#", "X"],["B", "X"],
    ["D", "C"], ["D", "C#"],["D", "D"],["D", "D#"],["D", "E"],["D", "F"],["D", "F#"],["D", "G"],["D", "G#"],["D", "A"],["D", "A#"],["D", "B"],
    ["E", "C"], ["E", "C#"],["E", "D"],["E", "D#"],["E", "E"],["E", "F"],["E", "F#"],["E", "G"],["E", "G#"],["E", "A"],["E", "A#"],["E", "B"],
    ["F#", "C"],["F#","C#"],["F#","D"],["F#","D#"],["F#","E"],["F#","F"],["F#","F#"],["F#","G"],["F#","G#"],["F#","A"],["F#","A#"],["F#","B"],
    ["G#", "C"],["G#","C#"],["G#","D"],["G#","D#"],["G#","E"],["G#","F"],["G#","F#"],["G#","G"],["G#","G#"],["G#","A"],["G#","A#"],["G#","B"],
    ["A#", "C"],["A#","C#"],["A#","D"],["A#","D#"],["A#","E"],["A#","F"],["A#","F#"],["A#","G"],["A#","G#"],["A#","A"],["A#","A#"],["A#","B"]
];*/

var mappings = [
    // longitude 1
    ["C", "X"], 
    ["D", "C"], 
    ["E", "C"], 
    ["F#", "C"],
    ["G#", "C"],
    ["A#", "C"],
    // longitude 2
    ["C#", "X"],
    ["D", "C#"],
    ["E", "C#"],
    ["F#","C#"],
    ["G#","C#"],
    ["A#","C#"],
    // longitude 3
    ["D", "X"],
    ["D", "X"],
    ["E", "D"],
    ["F#","D"],
    ["G#","D"],
    ["A#","D"],
    // longitude 4
    ["D#", "X"],
    ["D", "D#"],
    ["E", "D#"],
    ["F#","D#"],
    ["G#","D#"],
    ["A#","D#"],
    // longitude 5
    ["E", "X"],
    ["D", "E"],
    ["E", "X"],
    ["F#","E"],
    ["G#","E"],
    ["A#","E"],
    // longitude 6
    ["F", "X"],
    ["D", "F"],
    ["E", "F"],
    ["F#","F"],
    ["G#","F"],
    ["A#","F"],
    // longitude 7
    ["F#", "X"],
    ["D", "F#"],
    ["E", "F#"],
    ["F#","X"],
    ["G#","F#"],
    ["A#","F#"],
    // longitude 8
    ["G", "X"],
    ["D", "G"],
    ["E", "G"],
    ["F#","G"],
    ["G#","G"],
    ["A#","G"],
    // longitude 9
    ["G#", "X"],
    ["D", "G#"],
    ["E", "G#"],
    ["F#","G#"],
    ["G#","X"],
    ["A#","G#"],
    // longitude 10
    ["A", "X"],
    ["D", "A"],
    ["E", "A"],
    ["F#","A"],
    ["G#","A"],
    ["A#","A"],
    // longitude 11
    ["A#", "X"],
    ["D", "A#"],
    ["E", "A#"],
    ["F#","A#"],
    ["G#","A#"],
    ["A#","X"],
    // longitude 12
    ["B", "X"],
    ["D", "B"],
    ["E", "B"],
    ["F#","B"],
    ["G#","B"],
    ["A#","B"]
];