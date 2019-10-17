// Copyright 2014-2019, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property between 2 values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  const sun = require( 'SUN/sun' );
  const Tandem = require( 'TANDEM/Tandem' );
  const ToggleButtonInteractionStateProperty = require( 'SUN/buttons/ToggleButtonInteractionStateProperty' );
  const ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );
  const ToggleButtonModel = require( 'SUN/buttons/ToggleButtonModel' );

  /**
   * @param {Object} valueOff - value when the button is in the off state
   * @param {Object} valueOn - value when the button is in the on state
   * @param {Property} property - axon Property that can be either valueOff or valueOn
   * @param {Object} [options]
   * @constructor
   */
  function RoundToggleButton( valueOff, valueOn, property, options ) {

    // Tandem support
    options = merge( {
      tandem: Tandem.required,
      phetioType: ToggleButtonIO
    }, options );

    // @private (read-only)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.toggleButtonModel = new ToggleButtonModel( valueOff, valueOn, property, options );
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty( this.toggleButtonModel );

    RoundButtonView.call( this, this.toggleButtonModel, toggleButtonInteractionStateProperty, options );

    this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // @private
    this.disposeRoundToggleButton = function() {
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