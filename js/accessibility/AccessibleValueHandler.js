// Copyright 2019, University of Colorado Boulder

/**
 * A trait for subtypes of Node. Meant for Nodes with a value that "run" on a NumberProperty and handles formatting,
 * mapping, and aria-valuetext updating.
 *
 * Also implements the listeners that respond to accessible input, such as keydown, keyup, input, and change
 * events, which may come from a keyboard or other assistive device. Bind and add these as input listeners to the
 * node mixing in this trait.
 *
 * Browsers have limitations for the interaction of a slider when the range is not evenly divisible by the step size.
 * Rather than allow the browser to natively change the valueProperty with an input event, this trait implements a
 * totally custom interaction keeping the general slider behavior the same.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg
 */

define( require => {
  'use strict';

  // modules
  const Emitter = require( 'AXON/Emitter' );
  const extend = require( 'PHET_CORE/extend' );
  const inheritance = require( 'PHET_CORE/inheritance' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Node = require( 'SCENERY/nodes/Node' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const sun = require( 'SUN/sun' );
  const SunConstants = require( 'SUN/SunConstants' );
  const timer = require( 'AXON/timer' );
  const Util = require( 'DOT/Util' );

  const AccessibleValueHandler = {

    /**
     * Implement functionality for a number spinner.
     * @public
     * @trait
     *
     * @param {function} type - The type (constructor) whose prototype that is modified.
     */
    mixInto: type => {
      assert && assert( _.includes( inheritance( type ), Node ), 'must be mixed into a Node' );

      const proto = type.prototype;

      extend( proto, {

        /**
         * This should be called in the constructor to initialize the accessible input features for the node.
         *
         * @param {Property.<number>} valueProperty
         * @param {Object} [options] - note, does not mutate the Node
         *
         * @protected
         */
        initializeAccessibleValueHandler( valueProperty, enabledRangeProperty, enabledProperty, options ) {

          // ensure that the client does not set both a custom text pattern and a text creation function
          assert && assert(
            !( options.a11yValuePattern && options.a11yCreateValueChangeAriaValueText ),
            'cannot set both a11yValuePattern and a11yCreateValueChangeAriaValueText in options'
          );

          // if rounding to keyboard step, keyboardStep must be defined so values aren't skipped and the slider   
          // doesn't get stuck while rounding to the nearest value, see https://github.com/phetsims/sun/issues/410
          if ( assert && options.roundToStepSize ) {
            assert( options.keyboardStep, 'rounding to keyboardStep, define appropriate keyboardStep to round to' );
          }

          // verify that a11yValuePattern includes SunConstants.VALUE_NAMED_PLACEHOLDER, and that is the only key in the pattern
          if ( assert && options.a11yValuePattern ) {
            assert( options.a11yValuePattern.match( /\{\{[^\{\}]+\}\}/g ).length === 1,
              'a11yValuePattern only accepts a single \'value\' key'
            );
            assert( options.a11yValuePattern.indexOf( SunConstants.VALUE_NAMED_PLACEHOLDER ) >= 0,
              'a11yValuePattern must contain a key of \'value\''
            );
          }

          const defaults = {

            // other
            startChange: _.noop, // called when a value change sequence starts
            endChange: _.noop, // called when a value change sequence ends
            constrainValue: _.identity, // called before valueProperty is set

            // keyboard steps for various keys/interactions
            keyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 20,
            shiftKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 100,
            pageKeyboardStep: ( enabledRangeProperty.get().max - enabledRangeProperty.get().min ) / 10,

            ariaOrientation: 'horizontal', // specify orientation, read by assistive technology

            a11yValuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER, // {string} if you want units or additional content, add to pattern
            a11yDecimalPlaces: 0, // number of decimal places for the value when formatted and read by assistive technology

            // {boolean} - Whether or not to round the value to a multiple of the keyboardStep. This will only round
            // the value on normal key presses, rounding will not occur on large jumps like page up/page down/home/end.
            // see https://github.com/phetsims/gravity-force-lab-basics/issues/72
            roundToStepSize: false,

            /**
             * Map the valueProperty value to another number that will be read by the assistive device on
             * valueProperty changes.
             * @param {number} value
             * @returns {number}
             */
            a11yMapValue: _.identity,

            /**
             * Custom aria-valuetext creation function, called when the valueProperty changes. Used in replacement of
             * the simpler/easier option: a11yValuePattern.
             * This string is read by AT every time the slider value changes.
             * @type {Function}
             * @param {number} formattedValue - mapped value fixed to the provided decimal places
             * @param {number} newValue - the new value, unformatted
             * @param {number} previousValue - just the "oldValue" from the property listener
             * @returns {string} - aria-valuetext to be set to the primarySibling
             */
            a11yCreateValueChangeAriaValueText: _.identity,

            /**
             * By default there will be nothing special provided on focus, just the previous value set on Property change.
             * If a specific aria-valuetext is desired when the interactive DOM element is focused, then use this option
             * to provide the proper "on focus" text. If provided, this will be called independently of the "on change"
             * valuetext updates. As a result, you can use either a11yCreateValueChangeAriaValueText or a11yValuePattern
             * with this.
             *
             * The string that this function returns is set as aria-valuetext when the component is focused.
             *
             * @type {null|Function}
             * @param {number} formattedValue - mapped value fixed to the provided decimal places
             * @param {number} value - the current value of the Property, unformatted
             * @returns {string} - aria-valuetext to be set to the primarySibling
             */
            a11yCreateOnFocusAriaValueText: null
          };

          options = _.extend( {}, defaults, options );

          assert && assert( options.ariaOrientation === 'horizontal' || options.ariaOrientation === 'vertical',
            'invalid ariaOrientation: ' + options.ariaOrientation );

          // Some options were already mutated in the constructor, only apply the accessibility-specific options here
          // so options are not doubled up, see https://github.com/phetsims/sun/issues/330
          var optionsToMutate = _.pick( options, _.keys( defaults ) );

          // cannot be set by client
          assert && assert( options.tagName === undefined, 'AccessibleSlider sets tagName' );
          optionsToMutate.tagName = 'input';

          assert && assert( options.inputType === undefined, 'AccessibleSlider sets inputType' );
          optionsToMutate.inputType = 'range';

          this.mutate( optionsToMutate );

          // @private {Property.<number>}
          this._valueProperty = valueProperty;

          // @private {Property.<Range>}
          this._enabledRangeProperty = enabledRangeProperty;

          // @private{Property.<boolean>}
          this._enabledProperty = enabledProperty;

          // @private {function} - called when value change input is starts
          this._startChange = options.startChange;

          // @private {function} - called when value change input ends
          this._endChange = options.endChange;

          // @private {function} - called before valueProperty is set
          this._constrainValue = options.constrainValue;

          // @private (a11y) - delta for the valueProperty when using keyboard to interact with slider,
          // initialized with setKeyboardStep which does some validating
          this._keyboardStep = null;
          this.setKeyboardStep( options.keyboardStep );

          // @private (a11y) - delta for valueProperty when holding shift and using the keyboard to interact with slider
          this._shiftKeyboardStep = null;
          this.setShiftKeyboardStep( options.shiftKeyboardStep );

          // @private (a11y) - delta for valueProperty when pressing page up/page down
          this._pageKeyboardStep = null;
          this.setPageKeyboardStep( options.pageKeyboardStep );

          // @private (a11y) - whether or not 'shift' key is currently held down
          this._shiftKey = false;

          // initialize slider attributes
          this.ariaOrientation = options.ariaOrientation;

          // @public - Emitted whenever there is an attempt to change the value in a particular direction. Note that
          // these will emit whether or not the value will actually change (like when stepSize is 0). These may
          // be used to change the valueProperty, changes from accessible input are handled after these are emitted.
          this.attemptedIncreaseEmitter = new Emitter();
          this.attemptedDecreaseEmitter = new Emitter();

          // @private (a11y) - whether or not an input event has been handled. If handled, we will not respond to the
          // change event. An AT (particularly VoiceOver) may send a change event (and not an input event) to the
          // browser in response to a user gesture. We need to handle that change event, whithout also handling the
          // input event in case a device sends both events to the browser.
          this.a11yInputHandled = false;

          // @private (a11y) - some browsers will receive `input` events when the user tabs away from the slider or
          // on some key presses - if we receive a keydown event, we do not want the value to change twice, so we
          // block input event after handling the keydown event
          this.blockInput = false;

          // @private - entries like { {number}: {boolean} }, key is range key code, value is whether it is down
          this.rangeKeysDown = {};

          // @private - setting to enable/disable rounding to the step size
          this.roundToStepSize = options.roundToStepSize;

          // @public (read-only) - precision for the output value to be read by an assistive device
          this.a11yDecimalPlaces = options.a11yDecimalPlaces;

          // @private {function}
          this.a11yMapValue = options.a11yMapValue;

          // @private - {null|function} see options for doc
          this.a11yCreateOnFocusAriaValueText = options.a11yCreateOnFocusAriaValueText;

          // listeners, must be unlinked in dispose
          var enabledRangeObserver = ( enabledRange ) => {

            // a11y - update enabled slider range for AT, required for screen reader events to behave correctly
            this.setAccessibleAttribute( 'min', enabledRange.min );
            this.setAccessibleAttribute( 'max', enabledRange.max );

            // update the step attribute slider element - this attribute is only added because it is required to
            // receive accessibility events on all browsers, and is totally separate from the step values above that
            // will modify the valueProperty. See function for more information.
            this.updateSiblingStepAttribute();
          };
          this._enabledRangeProperty.link( enabledRangeObserver );

          // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
          // by assistive technology when the value changes
          const valuePropertyListener = ( value, oldValue ) => {

            const formattedValue = this.getA11yFormattedValue();

            // create the final string from optional parameters. This looks messy, but in reality you can only supply
            // the valuePattern OR the create function, so this works as an "either or" situation.
            this.ariaValueText = StringUtils.fillIn( options.a11yValuePattern, {
              value: options.a11yCreateValueChangeAriaValueText( formattedValue, value, oldValue )
            } );

            // set the aria-valuenow attribute in case the AT requires it to read the value correctly, some may
            // fall back on this from aria-valuetext see
            // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-valuetext_attribute#Possible_effects_on_user_agents_and_assistive_technology
            this.setAccessibleAttribute( 'aria-valuenow', formattedValue );

            // update the PDOM input value on Property change
            this.inputValue = formattedValue;
          };
          this._valueProperty.link( valuePropertyListener );

          const valueHandlerListener = {

            // When not providing a timeout, we would often get this change for the previously focused element even
            // though it wasn't the active element of the screen. Perhaps this is just a bug/problem with how AT monitor
            // for aria-valuetext updating.
            focus: () => { timer.setTimeout( () => this.updateOnFocusAriaValueText(), 0 );}
          };
          this.addInputListener( valueHandlerListener );

          // @private - called by disposeAccessibleValueHandler to prevent memory leaks
          this._disposeAccessibleValueHandler = () => {
            this._enabledRangeProperty.unlink( enabledRangeObserver );
            this.removeInputListener( valueHandlerListener );
            this._valueProperty.unlink( valuePropertyListener );
          };
        },

        /**
         * @public
         * Update the aria-valuetext for the next time that this element is focused.
         */
        updateOnFocusAriaValueText() {
          if ( this.a11yCreateOnFocusAriaValueText ) {
            this.ariaValueText = this.a11yCreateOnFocusAriaValueText( this.getA11yFormattedValue(), this._valueProperty.value );
          }
        },

        /**
         * @private
         * get the formatted value based on the current value of the Property.
         * @returns {number}
         */
        getA11yFormattedValue() {
          const mappedValue = this.a11yMapValue( this._valueProperty.value );
          assert && assert( typeof mappedValue === 'number', 'a11yMapValue must return a number' );

          // format the value text for reading
          return Util.toFixedNumber( mappedValue, this.a11yDecimalPlaces );
        },

        /**
         * Handle a keydown event so that the value handler behaves like a traditional input that modifies
         * a number. We expect the following:
         *   - Up Arrow/Right Arrow increments value by keyboardStep
         *   - Down Arrow/Left Arrow decrements value by step size
         *   - Page up/Page down will increment/decrement value pageKeyboardStep
         *   - Home/End will set value to min/max value for the range
         *   - Pressing shift with an arrow key will increment/decrement value by shiftKeyboardStep
         *
         * Add this as an input listener to the `keydown` event to the Node mixing in AccessibleValueHandler.
         */
        handleKeyDown( event ) {
          var domEvent = event.domEvent;
          var code = domEvent.keyCode;
          this._shiftKey = domEvent.shiftKey;

          // if we receive a keydown event, we shouldn't handle any input events (which should only be provided
          // directly by an assistive device)
          this.blockInput = true;

          if ( this._enabledProperty.get() ) {

            // Prevent default so browser doesn't change input value automatically
            if ( KeyboardUtil.isRangeKey( code ) ) {
              domEvent.preventDefault();

              // if this is the first keydown this is the start of the drag interaction
              if ( !this.anyKeysDown() ) {
                this._startChange( event );
              }

              // track that a new key is being held down
              this.rangeKeysDown[ code ] = true;

              var newValue = this._valueProperty.get();
              if ( code === KeyboardUtil.KEY_END || code === KeyboardUtil.KEY_HOME ) {

                // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
                // behavior for sliders)
                if ( code === KeyboardUtil.KEY_END ) {
                  this.attemptedIncreaseEmitter.emit();
                  newValue = this._enabledRangeProperty.get().max;
                }
                else if ( code === KeyboardUtil.KEY_HOME ) {
                  this.attemptedDecreaseEmitter.emit();
                  newValue = this._enabledRangeProperty.get().min;
                }
              }
              else {
                var stepSize;
                if ( code === KeyboardUtil.KEY_PAGE_UP || code === KeyboardUtil.KEY_PAGE_DOWN ) {
                  // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
                  stepSize = this.pageKeyboardStep;

                  if ( code === KeyboardUtil.KEY_PAGE_UP ) {
                    this.attemptedIncreaseEmitter.emit();
                    newValue = this._valueProperty.get() + stepSize;
                  }
                  else if ( code === KeyboardUtil.KEY_PAGE_DOWN ) {
                    this.attemptedDecreaseEmitter.emit();
                    newValue = this._valueProperty.get() - stepSize;
                  }
                }
                else if ( KeyboardUtil.isArrowKey( code ) ) {

                  // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
                  stepSize = domEvent.shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

                  if ( code === KeyboardUtil.KEY_RIGHT_ARROW || code === KeyboardUtil.KEY_UP_ARROW ) {
                    this.attemptedIncreaseEmitter.emit();
                    newValue = this._valueProperty.get() + stepSize;
                  }
                  else if ( code === KeyboardUtil.KEY_LEFT_ARROW || code === KeyboardUtil.KEY_DOWN_ARROW ) {
                    this.attemptedDecreaseEmitter.emit();
                    newValue = this._valueProperty.get() - stepSize;
                  }

                  if ( this.roundToStepSize ) {
                    newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
                  }
                }

                // limit the value to the enabled range
                newValue = Util.clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );
              }

              // optionally constrain the value further
              this._valueProperty.set( this._constrainValue( newValue ) );
            }
          }
        },

        /**
         * Handle key up event on this accessible slider, managing the shift key, and calling an optional endDrag
         * function on release. Add this as an input listener to the node mixing in AccessibleValueHandler.
         * @private
         *
         * @param {Event} event
         */
        handleKeyUp( event ) {
          var domEvent = event.domEvent;

          // handle case where user tabbed to this input while an arrow key might have been held down
          if ( this.allKeysUp() ) {
            return;
          }

          // reset shift key flag when we release it
          if ( domEvent.keyCode === KeyboardUtil.KEY_SHIFT ) {
            this._shiftKey = false;
          }

          if ( this._enabledProperty.get() ) {
            if ( KeyboardUtil.isRangeKey( domEvent.keyCode ) ) {
              this.rangeKeysDown[ domEvent.keyCode ] = false;

              // when all range keys are released, we are done dragging
              if ( this.allKeysUp() ) {
                this._endChange( event );
              }
            }
          }
        },

        /**
         * VoiceOver sends a "change" event to the slider (NOT an input event), so we need to handle the case when
         * a change event is sent but an input event ins't handled. Guarded against the case that BOTH change and
         * input are sent to the browser by the AT.
         *
         * Add this as a listener to the 'change' input event on the Node that is mixing in AccessibleValueHandler.
         * 
         * @private
         *
         * @param  {Event} event
         */
        handleChange( event ) {

          if ( !this.a11yInputHandled ) {
            this.handleInput( event );
          }

          this.a11yInputHandled = false;
        },

        /**
         * Handle a direct 'input' event that might come from assistive technology. It is possible that the user agent
         * (particularly VoiceOver, or a switch device) will initiate an input event directly without going through
         * keydown. In that case, handle the change depending on which direction the user tried to go.
         *
         * Note that it is important to handle the "input" event, rather than the "change" event. The "input" will
         * fire when the value changes from a gesture, while the "change" will only happen on submission, like as
         * navigating away from the element.
         *
         * Add this as a listener to the `input` event on the Node that is mixing in AccessibleValueHandler.
         * 
         * @private
         *
         * @param {Event} event
         */
        handleInput( event ) {
          if ( this._enabledProperty.get() && !this.blockInput ) {

            // don't handle again on "change" event
            this.a11yInputHandled = true;

            var newValue = this._valueProperty.get();

            var inputValue = event.domEvent.target.value;
            var stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;

            // start of change event is start of drag
            this._startChange( event );

            if ( inputValue > this._valueProperty.get() ) {
              this.attemptedIncreaseEmitter.emit();
              newValue = this._valueProperty.get() + stepSize;
            }
            else if ( inputValue < this._valueProperty.get() ) {
              this.attemptedDecreaseEmitter.emit();
              newValue = this._valueProperty.get() - stepSize;
            }

            if ( this.roundToStepSize ) {
              newValue = roundValue( newValue, this._valueProperty.get(), stepSize );
            }

            // limit to enabled range
            newValue = Util.clamp( newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max );

            // optionally constrain value
            this._valueProperty.set( this._constrainValue( newValue ) );

            // end of change is the end of a drag
            this._endChange( event );
          }
        },

        /**
         * Fires when the accessible slider loses focus.
         *
         * Add this as a listener on the `blur` event to the Node that is mixing in AccessibleValueHandler.
         * 
         * @private
         */
        handleBlur() {

          // if any range keys are currently down, call end drag because user has stopped dragging to do something else
          if ( this.anyKeysDown() ) {
            this._endChange();
          }

          // reset flag in case we shift-tabbed away from slider
          this._shiftKey = false;

          // reset counter for range keys down
          this.rangeKeysDown = {};
        },

        /**
         * Set the delta for the value Property when using arrow keys to interact with the Node.
         * @public
         *
         * @param {number} keyboardStep
         */
        setKeyboardStep( keyboardStep ) {
          assert && assert( keyboardStep >= 0, 'keyboard step must be non-negative' );

          this._keyboardStep = keyboardStep;
        },
        set keyboardStep( keyboardStep ) { this.setKeyboardStep( keyboardStep ); },

        /**
         * Get the delta for value Property when using arrow keys.
         * @public
         *
         * @returns {number}
         */
        getKeyboardStep() {
          return this._keyboardStep;
        },
        get keyboardStep() { return this.getKeyboardStep(); },

        /**
         * Set the delta for value Property when using arrow keys with shift to interact with the Node.
         * @public
         *
         * @param {number} shiftKeyboardStep
         */
        setShiftKeyboardStep( shiftKeyboardStep ) {
          assert && assert( shiftKeyboardStep >= 0, 'shift keyboard step must be non-negative' );

          this._shiftKeyboardStep = shiftKeyboardStep;
        },
        set shiftKeyboardStep( shiftKeyboardStep ) { this.setShiftKeyboardStep( shiftKeyboardStep ); },

        /**
         * Get the delta for value Property when using arrow keys with shift to interact with the Node.
         * @public
         */
        getShiftKeyboardStep() {
          return this._shiftKeyboardStep;
        },
        get shiftKeyboardStep() { return this.getShiftKeyboardStep(); },

        /**
         * Returns whether or not the shift key is currently held down on this slider, changing the size of step.
         * @public
         *
         * @returns {boolean}
         */
        getShiftKeyDown() {
          return this._shiftKey;
        },
        get shiftKeyDown() { return this.getShiftKeyDown(); },

        /**
         * Set the delta for value Property when using page up/page down to interact with the Node.
         * @public
         *
         * @param {number} pageKeyboardStep
         */
        setPageKeyboardStep( pageKeyboardStep ) {
          assert && assert( pageKeyboardStep >= 0, 'page keyboard step must be non-negative' );

          this._pageKeyboardStep = pageKeyboardStep;
        },
        set pageKeyboardStep( pageKeyboardStep ) { this.setPageKeyboardStep( pageKeyboardStep ); },

        /**
         * Get the delta for value Property when using page up/page down to interact with the Node.
         * @public
         */
        getPageKeyboardStep() {
          return this._pageKeyboardStep;
        },
        get pageKeyboardStep() { return this.getPageKeyboardStep(); },

        /**
         * Set the orientation for the slider as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation.
         * Depending on the value of this attribute, a screen reader will give different indications about which
         * arrow keys should be used
         *
         * @param {string} orientation - one of "horizontal" or "vertical"
         */
        setAriaOrientation: function( orientation ) {
          assert && assert( orientation === 'horizontal' || orientation === 'vertical' );

          this._ariaOrientation = orientation;
          this.setAccessibleAttribute( 'aria-orientation', orientation );
        },
        set ariaOrientation( orientation ) { this.setAriaOrientation( orientation ); },

        /**
         * Get the orientation of the accessible slider, see setAriaOrientation for information on the behavior of this
         * attribute.
         *
         * @returns {string}
         */
        getAriaOrientation: function() {
          return this._ariaOrientation;
        },
        get ariaOrientation() { return this._ariaOrientation; },

        /**
         * Call when disposing the type that this trait is mixed into.
         * @public
         */
        disposeAccessibleValueHandler() {
          this._disposeAccessibleValueHandler();
        },

        /**
         * Returns true if all range keys are currently up (not held down).
         * @returns {boolean}
         * @private
         */
        allKeysUp() {
          return _.every( this.rangeKeysDown, function( entry ) { return !entry; } );
        },

        /**
         * Returns true if any range keys are currently down on this slider. Useful for determining when to call
         * startDrag or endDrag based on interaction.
         *
         * @returns {boolean}
         * @private
         */
        anyKeysDown() {
          return !!_.find( this.rangeKeysDown, function( entry ) { return entry; } );
        },

        /**
         * Set the `step` attribute on accessible siblings for this Node. The step attribute must be non zero
         * for the accessible input to receive accessibility events and only certain slider input values are
         * allowed depending on `step`, `min`, and `max` attributes. Only values which are equal to min value plus
         * the basis of step are allowed. If the input value is set to anything else, the result is confusing
         * keyboard behavior and the screen reader will say "Invalid" when the value changes.
         * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step
         *
         * This limitation is too restrictive for PhET as many sliders span physical ranges with keyboard steps that
         * are design to be convenient or pedagogically useful. For example, a slider that spans 0.01 to 15 requires 
         * a step of 1, but DOM specification would only allow values 0.01, 1.01, 2.01, ...
         * This restriction is the main reason we decided to "roll our own" for accessible sliders.
         *
         * We tried to use the `any` attribute which is valid according to DOM specification but screen readers
         * generally don't support it. See https://github.com/phetsims/sun/issues/413.
         *
         * Also, if the step attribute is too small relative to the entire range of the slider VoiceOver doesn't allow
         * any input events because...VoiceOver is just interesting like that.
         *
         * Current workaround for all of this is to set the step size to support the precision of the value required
         * by the client so that all values are allowed. If we encounter the VoiceOver case described above we fall
         * back to setting the step size at 1/100th of the max value since the keyboard step generally evenly divides
         * the max value rather than the full range.
         * @private
         */
        updateSiblingStepAttribute() {
          let stepValue = Math.pow( 10, -this.a11yDecimalPlaces );

          const fullRange = this._enabledRangeProperty.get().getLength();

          // step is too small relative to full range for VoiceOver to receive input, fall back to portion of
          // full range
          if ( stepValue / fullRange < 1e-5 ) {
            stepValue = this._enabledRangeProperty.get().max / 100;
          }

          this.setAccessibleAttribute( 'step', stepValue );
        }
      } );
    }
  };

  sun.register( 'AccessibleValueHandler', AccessibleValueHandler );

  /**
   * Round the value to the nearest step size.
   *
   * @param {number} newValue - value to be rounded
   * @param {number} currentValue - current value of the Property associated with this slider
   * @param {number} stepSize - the delta for this manipulation
   *
   * @returns {number}
   */
  var roundValue = function( newValue, currentValue, stepSize ) {
    var roundValue = newValue;
    if ( stepSize !== 0 ) {

      // round the value to the nearest keyboard step
      roundValue = Util.roundSymmetric( roundValue / stepSize ) * stepSize;

      // go back a step if we went too far due to rounding
      roundValue = correctRounding( roundValue, currentValue, stepSize );
    }
    return roundValue;
  };

  /**
   * Helper function, it is possible due to rounding to go up or down a step if we have passed the nearest step during
   * keyboard interaction. This function corrects that.
   *
   * @param {number} newValue - potential value of the Property associated with this slider
   * @param {number} currentValue - current value of the Property associated with this slider
   * @param {number} stepSize - the delta for this manipulation
   *
   * @returns {number}
   */
  var correctRounding = function( newValue, currentValue, stepSize ) {
    var correctedValue = newValue;

    var proposedStep = Math.abs( newValue - currentValue );
    var stepToFar = proposedStep > stepSize;

    // it is possible that proposedStep will be larger than the stepSize but only because of precision
    // constraints with floating point values, don't correct if that is the cases
    var stepsAboutEqual = Util.equalsEpsilon( proposedStep, stepSize, 1e-14 );
    if ( stepToFar && !stepsAboutEqual ) {
      correctedValue += ( newValue > currentValue ) ? ( -1 * stepSize ) : stepSize;
    }
    return correctedValue;
  };

  return AccessibleValueHandler;
} );