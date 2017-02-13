// Copyright 2014-2015, University of Colorado Boulder

/**
 * A derived property that maps push button model states to the values needed by the button view.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var sun = require( 'SUN/sun' );

  /**
   * @param {ButtonModel} buttonModel
   * @param {Object} [options]
   * @constructor
   */
  function PushButtonInteractionStateProperty( buttonModel, options ) {
    // Tandem.indicateUninstrumentedCode();  // see https://github.com/phetsims/phet-io/issues/986
    // Buttons are already instrumented, I don't know whether the button models also need to be.  Maybe not?  But
    // if we want to see in the data stream when the user mouses over a button, this would be valuable

    DerivedProperty.call(
      this,
      [ buttonModel.overProperty, buttonModel.downProperty, buttonModel.enabledProperty ],
      function( over, down, enabled ) {
        return !enabled ? 'disabled' :
               over && !down ? 'over' :
               over && down ? 'pressed' :
               'idle';
      }, options );
  }

  sun.register( 'PushButtonInteractionStateProperty', PushButtonInteractionStateProperty );

  return inherit( DerivedProperty, PushButtonInteractionStateProperty );
} );