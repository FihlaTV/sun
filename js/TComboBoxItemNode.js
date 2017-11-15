// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var sun = require( 'SUN/sun' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );

  /**
   * Wrapper type for phet/sun's ComboBox class.
   * @param comboBoxItemNode
   * @param phetioID
   * @constructor
   */
  function TComboBoxItemNode( comboBoxItemNode, phetioID ) {
    assert && assertInstanceOf( comboBoxItemNode, phet.sun.ComboBox.ItemNode );
    NodeIO.call( this, comboBoxItemNode, phetioID );
  }

  phetioInherit( NodeIO, 'TComboBoxItemNode', TComboBoxItemNode, {}, {
    documentation: 'A traditional item node for a combo box',
    events: [ 'fired' ]
  } );

  sun.register( 'TComboBoxItemNode', TComboBoxItemNode );

  return TComboBoxItemNode;
} );