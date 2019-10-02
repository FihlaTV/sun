// Copyright 2014-2019, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var commonSoundPlayers = require( 'TAMBO/commonSoundPlayers' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  var ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );
  var ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   * @constructor
   */
  function RoundToggleButton( valueOff, valueOn, property, options ) {

    options = _.extend( {

      // {Playable} - sounds to be played on toggle transitions
      valueOffSound: commonSoundPlayers.stepForwardButton,
      valueOnSound: commonSoundPlayers.stepBackwardButton,

      // tandem support
      tandem: Tandem.required,
      phetioType: ToggleButtonIO

    }, options );

    // @private (read-only)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    var toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( this.toggleButtonModel );

    RoundButtonView.call( this, this.toggleButtonModel, toggleButtonInteractionStateProperty, options );

    // sound generation
    function playSounds() {
      if ( property.value === valueOff && options.valueOffSound ) {
        options.valueOffSound.play();
      }
      else if ( property.value === valueOn && options.valueOnSound ) {
        options.valueOnSound.play();
      }
    }

    this.buttonModel.produceSoundEmitter.addListener( playSounds );

    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private
    this.disposeRoundToggleButton = function() {
      this.buttonModel.produceSoundEmitter.removeListener( playSounds );
      this.toggleButtonModel.dispose();
      toggleButtonInteractionStateProperty.dispose();
    };
  }

  sun.register( 'RoundToggleButton', RoundToggleButton );

  return inherit( RoundButtonView, RoundToggleButton, {

    // @public
    dispose: function() {
      this.disposeRoundToggleButton();
      RoundButtonView.prototype.dispose.call( this );
    }
  } );
} );