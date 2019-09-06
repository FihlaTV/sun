// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for AccordionBox
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var sun = require( 'SUN/sun' );

  class AccordionBoxIO extends NodeIO {}

  AccordionBoxIO.documentation = 'A traditional accordionBox';
  AccordionBoxIO.events = [ 'expanded', 'collapsed' ];
  AccordionBoxIO.validator = { isValidValue: v => v instanceof phet.sun.AccordionBox };
  AccordionBoxIO.typeName = 'AccordionBoxIO';
  ObjectIO.validateSubtype( AccordionBoxIO );

  return sun.register( 'AccordionBoxIO', AccordionBoxIO );
} );

