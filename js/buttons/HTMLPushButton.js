// Copyright 2014-2019, University of Colorado Boulder

/**
 * Push button with HTML text on a rectangular push button.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const sun = require( 'SUN/sun' );

  /**
   * @param {string} html
   * @param {Object} [options]
   * @constructor
   */
  function HTMLPushButton( html, options ) {
    options = merge( {
      textFill: 'black'
    }, options );

    const htmlTextNode = new RichText( html, options );
    RectangularPushButton.call( this, merge( { content: htmlTextNode }, options ) );
  }

  sun.register( 'HTMLPushButton', HTMLPushButton );

  return inherit( RectangularPushButton, HTMLPushButton );
} );
