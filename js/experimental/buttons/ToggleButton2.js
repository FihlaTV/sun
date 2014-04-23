// Copyright 2002-2014, University of Colorado Boulder

/**
 * Toggle button that switches the value of a boolean property when pressed
 * and also switches the displayed icon.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/experimental/buttons/RectangularPushButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  /**
   * @param trueNode
   * @param falseNode
   * @param booleanProperty
   * @param options - See Rectangular push button for a description of the available options
   * @constructor
   */
  function ToggleButton2( trueNode, falseNode, booleanProperty, options ) {
    options = _.extend( {
      xMargin: 5,
      yMargin: 5,
      cursor: 'pointer',
      listener: function() { booleanProperty.value = !booleanProperty.value; }
    }, options );

    var content = new ToggleNode( trueNode, falseNode, booleanProperty );

    RectangularPushButton.call( this, content, options );
  }

  return inherit( RectangularPushButton, ToggleButton2 );
} );
