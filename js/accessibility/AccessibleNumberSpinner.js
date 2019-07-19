// Copyright 2018-2019, University of Colorado Boulder

/**
 * A trait for subtypes of Node, used to make the Node behave like a 'number' input with assistive technology.
 * An accessible number spinner behaves like:
 *
 * - Arrow keys increment/decrement the value by a specified step size.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * This number spinner is different than typical 'number' inputs because it does not support number key control. It
 * was determined that an input of type range is the best match for a PhET Number Spinner, with a custom role
 * description with aria-roledescription. See https://github.com/phetsims/sun/issues/497 for history on this
 * decision.
 *
 * This trait mixes in a "parent" mixin to handle general "value" formatting and aria-valuetext updating, see
 * AccessibleValueHandler.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */

define( require => {
  'use strict';

  // modules
  const SunA11yStrings = require( 'SUN/SunA11yStrings' );
  const AccessibleValueHandler = require( 'SUN/accessibility/AccessibleValueHandler' );
  const CallbackTimer = require( 'SUN/CallbackTimer' );
  const Emitter = require( 'AXON/Emitter' );
  const extend = require( 'PHET_CORE/extend' );
  const inheritance = require( 'PHET_CORE/inheritance' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Node = require( 'SCENERY/nodes/Node' );
  const sun = require( 'SUN/sun' );

  // a11y strings
  const numberSpinnerRoleDescriptionString = SunA11yStrings.numberSpinnerRoleDescription.value;

  const AccessibleNumberSpinner = {

    /**
     * Implement functionality for a number spinner.
     * @public
     * @trait
     * @mixes AccessibleValueHandler
     *
     * @param {function} type - The type (constructor) whose prototype we'll modify.
     */
    mixInto: function( type ) {
      assert && assert( _.includes( inheritance( type ), Node ) );

      const proto = type.prototype;

      // mixin general value handling
      AccessibleValueHandler.mixInto( type );

      extend( proto, {

        /**
         * This should be called in the constructor to initialize the accessible input features for the node.
         *
         * @param {Property.<number>} valueProperty
         * @param {Property.<Range>} enabledRangeProperty
         * @param {Property.<boolean>} enabledProperty
         * @param {Object} [options]
         *
         * @protected
         */
        initializeAccessibleNumberSpinner: function( valueProperty, enabledRangeProperty, enabledProperty, options ) {
          const self = this;

          const defaults = {
            timerDelay: 400, // start to fire continuously after pressing for this long (milliseconds)
            timerInterval: 100, // fire continuously at this frequency (milliseconds),

            ariaOrientation: 'vertical' // by default, number spinners should be oriented vertically
          };
          options = _.extend( {}, defaults, options );

          // initialize "parent" mixin
          this.initializeAccessibleValueHandler( valueProperty, enabledRangeProperty, enabledProperty, options );

          // @private - manages timing must be disposed
          this._callbackTimer = new CallbackTimer( {
            delay: options.timerDelay,
            interval: options.timerInterval
          } );

          // @protected {Emitter} emits events when increment and decrement actions occur, but only for changes
          // of keyboardStep (not pageKeyboardStep or shiftKeyboardStep)
          this.incrementDownEmitter = new Emitter( { validators: [ { valueType: 'boolean' } ] } );
          this.decrementDownEmitter = new Emitter( { validators: [ { valueType: 'boolean' } ] } );

          this.setAccessibleAttribute( 'aria-roledescription', numberSpinnerRoleDescriptionString );

          // a callback that is added and removed from the timer depending on keystate
          let downCallback = null;
          let runningTimerCallbackKeyCode = null;

          // handle all accessible event input
          const accessibleInputListener = {
            keydown: function( event ) {
              if ( enabledProperty.get() ) {

                // check for relevant keys here
                if ( KeyboardUtil.isRangeKey( event.domEvent.keyCode ) ) {
                  if ( !self._callbackTimer.isRunning() ) {
                    self.accessibleNumberSpinnerHandleKeyDown( event );

                    downCallback = self.accessibleNumberSpinnerHandleKeyDown.bind( self, event );
                    runningTimerCallbackKeyCode = event.domEvent.keyCode;
                    self._callbackTimer.addCallback( downCallback );
                    self._callbackTimer.start();
                  }
                }
              }
            },
            keyup: function( event ) {
              if ( KeyboardUtil.isRangeKey( event.domEvent.keyCode ) ) {
                if ( event.domEvent.keyCode === runningTimerCallbackKeyCode ) {
                  self.emitKeyState( event.domEvent.keyCode, false );
                  self._callbackTimer.stop( false );
                  self._callbackTimer.removeCallback( downCallback );
                  downCallback = null;
                  runningTimerCallbackKeyCode = null;
                }

                self.handleKeyUp( event );
              }
            },
            blur: function() {

              // if a key is currently down when focus leaves the spinner, stop callbacks and emit that the
              // keycode is up
              if ( downCallback ) {
                assert && assert( runningTimerCallbackKeyCode !== null, 'key should be down if running downCallback' );

                self.emitKeyState( runningTimerCallbackKeyCode, false );
                self._callbackTimer.stop( false );
                self._callbackTimer.removeCallback( downCallback );
              }

              self.handleBlur( event );
            },
            input: this.handleInput.bind( this ),
            change: this.handleChange.bind( this )
          };
          this.addInputListener( accessibleInputListener );

          // @private - called by disposeAccessibleNumberSpinner to prevent memory leaks
          this._disposeAccessibleNumberSpinner = function() {
            self._callbackTimer.dispose();

            // emitters owned by this instance, can be disposed here
            self.incrementDownEmitter.dispose();
            self.decrementDownEmitter.dispose();

            self.removeInputListener( accessibleInputListener );
            self.disposeAccessibleValueHandler();
          };
        },

        /**
         * Handle the keydown event and emit events related to the user interaction. Ideally, this would
         * override AccessibleValueHandler.handleKeyDown, but overriding is not supported with PhET Trait pattern.
         * @private
         *
         * @param   {DOMEvent} event
         */
        accessibleNumberSpinnerHandleKeyDown: function( event ) {
          this.handleKeyDown( event );
          this.emitKeyState( event.domEvent.keyCode, true );
        },

        /**
         * Emit events related to the keystate of the spinner. Typically used to style the spinner during keyboard
         * interaction.
         * @private
         *
         * @param {number} keyCode - the code of the key changing state
         * @param {boolean} isDown - whether or not event was triggered from down or up keys
         */
        emitKeyState: function( keyCode, isDown ) {
          if ( keyCode === KeyboardUtil.KEY_UP_ARROW || keyCode === KeyboardUtil.KEY_RIGHT_ARROW ) {
            this.incrementDownEmitter.emit( isDown );
          }
          else if ( keyCode === KeyboardUtil.KEY_DOWN_ARROW || keyCode === KeyboardUtil.KEY_LEFT_ARROW ) {
            this.decrementDownEmitter.emit( isDown );
          }
        },

        /**
         * Make the accessibility related aspects of this node eligible for garbage collection. Call when disposing
         * the type that this trait is mixed into.
         * @public
         */
        disposeAccessibleNumberSpinner: function() {
          this._disposeAccessibleNumberSpinner();
        }
      } );
    }
  };

  sun.register( 'AccessibleNumberSpinner', AccessibleNumberSpinner );

  return AccessibleNumberSpinner;
} );
