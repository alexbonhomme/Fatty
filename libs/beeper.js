//-----------------------------------------------------------------------------
// The MIT License
// 
// Copyright (c) 2009 Patrick Mueller
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// closure wrapper
//-----------------------------------------------------------------------------
;(function() {
    
//-----------------------------------------------------------------------------
// if audio is not available in this environment, create a fake one
//-----------------------------------------------------------------------------
if (!window.Audio) {
    window.Audio = function() {};
    
    Audio.prototype.load = Audio;
    Audio.prototype.play = Audio;
}

//-----------------------------------------------------------------------------
// return a beeper
//    sourceURL - the sound that the beeper should play
//-----------------------------------------------------------------------------
// This function returns another function, a beeper.  A beeper plays
// the sound it was created with, if passed no arguments.  If passed an
// argument, that argument should be a function.  In that case, the beeper
// will return a new function, which wraps the original function.  When that
// new function is invoked, it will play the sound the beeper was created with
// and then call the original function.
//-----------------------------------------------------------------------------
function createBeeper(soundURL) {
    
    // load the requested audio resource
    var audio = new Audio(soundURL);
    audio.load();
    audio.autoplay = false;
    
    // function returning a function which beeps and then executes the
    // passed in function.  The new function also has a property "original",
    // which is the original function, when you want to unwind the wrapper.
    function wrapper(originalFunction) {
        var result = function() {
            audio.play();
            var args = Array.prototype.slice.call(arguments);
            return originalFunction.apply(this, args);
        };
        
        result.original = originalFunction;
        
        return result;
    }
    
    // either play the sound, or wrap the requested function
    function beep(originalFunction) {
        if (originalFunction) {
            if ("function" != typeof originalFunction) {
                throw new TypeError("expecting a function");
            }
            
            return wrapper(originalFunction);
        }
        
        // didn't pass anything in, just play the sound
        audio.play();
    }
    
    // return the beep function
    return beep;
}

})();
