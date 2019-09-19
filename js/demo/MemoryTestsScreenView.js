// Copyright 2016-2018, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ABSwitch = require( 'SUN/ABSwitch' );
  const BooleanToggleNode = require( 'SUN/BooleanToggleNode' );
  const HSlider = require( 'SUN/HSlider' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const sun = require( 'SUN/sun' );
  const Text = require( 'SCENERY/nodes/Text' );

  function ComponentHolder( createFunction ) {
    const self = this;
    this.dispose = function() {
      self.instance.dispose();
    };
    this.create = function() {
      self.instance = createFunction();
    };
  }

  const numberProperty = new Property( 0 );
  const booleanProperty = new Property( false );

  const components = [
    new ComponentHolder( function() {
      return new HSlider( numberProperty, new Range( 0, 10 ) );
    } ),
    new ComponentHolder( function() {
      return new ABSwitch( booleanProperty, true, new Text( 'true' ), false, new Text( 'false' ) );
    } ),
    new ComponentHolder( function() {
      return new BooleanToggleNode( new Text( 'true' ), new Text( 'false' ), booleanProperty );
    } )
  ];

  /**
   * @constructor
   */
  function MemoryTestsScreenView() {
    ScreenView.call( this );
  }

  sun.register( 'MemoryTestsScreenView', MemoryTestsScreenView );

  return inherit( ScreenView, MemoryTestsScreenView, {
    step: function() {

      for ( let i = 0; i < components.length; i++ ) {
        const holder = components[ i ];

        // dispose first, then create and add at the end of the loop so components will be visible on the screen during
        // animation.
        holder.instance && this.removeChild( holder.instance );
        holder.instance && holder.dispose();

        holder.create();
        this.addChild( holder.instance );
      }
      console.log( 'create' );
    }
  } );
} );