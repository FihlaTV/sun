// Copyright 2014-2015, University of Colorado Boulder

/**
 * A derived property that maps momentary button model states to the values needed by the button view.
 *
 * @author Chris Malley
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  /**
   * @param {ButtonModel} buttonModel
   * @constructor
   */
  function MomentaryButtonInteractionStateProperty( buttonModel ) {

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty ],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !down ? 'over' :
               down ? 'pressed' :  // remain pressed regardless of whether 'over' is true
               'idle';
      } );
  }

  return inherit( DerivedProperty, MomentaryButtonInteractionStateProperty );
} );