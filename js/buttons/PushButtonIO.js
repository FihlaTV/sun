// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var FunctionIO = require( 'ifphetio!PHET_IO/types/FunctionIO' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );
  var VoidIO = require( 'ifphetio!PHET_IO/types/VoidIO' );

  /**
   * Wrapper type for phet/sun's PushButton class.
   * @param button
   * @param phetioID
   * @constructor
   */
  function PushButtonIO( button, phetioID ) {
    NodeIO.call( this, button, phetioID );

    assert && assertInstanceOf( button, [
      phet.sun.RoundPushButton,
      phet.sun.RectangularPushButton
    ] );
  }

  phetioInherit( NodeIO, 'PushButtonIO', PushButtonIO, {
    addListener: {
      returnType: VoidIO,
      parameterTypes: [ FunctionIO( VoidIO, [] ) ],
      implementation: function( listener ) {
        this.instance.addListener( listener );
      },
      documentation: 'Adds a listener that is called back when the button is pressed.'
    },
    fire: {
      returnType: VoidIO,
      parameterTypes: [],
      implementation: function() {
        this.instance.buttonModel.fire();
      },
      documentation: 'Performs the action associated with the button'
    }
  }, {
    documentation: 'A pressable button in the simulation',
    events: [ 'fired' ]
  } );

  sun.register( 'PushButtonIO', PushButtonIO );

  return PushButtonIO;
} );