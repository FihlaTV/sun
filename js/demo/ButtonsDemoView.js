// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView container for Buttons portion of the UI component demo.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
  var BooleanRectangularToggleButtonWithContent = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  var Color = require( 'SCENERY/util/Color' );
  var HTMLPushButton = require( 'SUN/buttons/HTMLPushButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Font = require( 'SCENERY/util/Font' );
  var Property = require( 'AXON/Property' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  var SliderKnob = require( 'SUN/experimental/SliderKnob' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Panel = require( 'SUN/Panel' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RoundMomentaryButton = require( 'SUN/buttons/RoundMomentaryButton' );
  var RectangularMomentaryButton = require( 'SUN/buttons/RectangularMomentaryButton' );

  // constants
  var BUTTON_FONT = new Font( { size: 20 } );
  var BUTTON_CAPTION_FONT = new Font( { size: 16 } );

  function ButtonsDemoView() {

    ScreenView.call( this, { renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );

    // Message area, for outputting test message
    var messagePrefix = 'Message: ';
    var messageText = new Text( messagePrefix, {
      font: new Font( { size: 16 } ),
      bottom: this.layoutBounds.height - 5,
      left:   this.layoutBounds.minX + 10
    } );
    this.addChild( messageText );
    var message = function( text ) {
      messageText.text = messagePrefix + text;
    };

    //===================================================================================
    // Radio buttons
    //===================================================================================

    var radioButtonProperty = new Property( 'TWO' );
    radioButtonProperty.lazyLink( function( value ) {
      message( 'Radio button ' + value + ' pressed' );
    } );
    var radioButtonContent = [
      { value: 'ONE', node: new Text( 'ONE', { font: BUTTON_FONT } ) },
      { value: 'TWO', node: new Text( 'TWO', { font: BUTTON_FONT } ) },
      { value: 'THREE', node: new Text( 'THREE', { font: BUTTON_FONT } ) },
      { value: 'FOUR', node: new Text( 'FOUR', { font: BUTTON_FONT } ) }
    ];
    var radioButtonGroup = new RadioButtonGroup( radioButtonProperty, radioButtonContent, {
      orientation: 'vertical',
      selectedLineWidth: 4
    } );
    var radioButtonPanel = new Panel( radioButtonGroup, {
      stroke: 'black',
      left: this.layoutBounds.left + 15,
      top:  this.layoutBounds.top + 15
    } );
    this.addChild( radioButtonPanel );

    //===================================================================================
    // Pseudo-3D buttons A, B, C, D, E
    //===================================================================================

    var buttonAFireCount = 0;
    var buttonA = new RectangularPushButton( {
      content: new Text( '--- A ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button A pressed ' + ( ++buttonAFireCount ) + 'x' ); }
    } );

    var buttonB = new RectangularPushButton( {
      content: new Text( '--- B ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button B pressed' ); },
      baseColor: new Color( 250, 0, 0 )
    } );

    var buttonC = new RectangularPushButton( {
      content: new Text( '--- C ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button C pressed' ); },
      baseColor: 'rgb( 204, 102, 204 )'
    } );

    var buttonD = new RoundPushButton( {
      content: new Text( '--- D ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button D pressed' ); }
    } );

    var buttonE = new RoundPushButton( {
      content: new Text( '--- E ---', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button E pressed' ); },
      baseColor: new Color( 245, 184, 0 )
    } );

    var pseudo3DButtonsBox = new HBox( {
      children: [ buttonA, buttonB, buttonC, buttonD, buttonE ],
      spacing: 10,
      left: radioButtonPanel.right + 25,
      top:  this.layoutBounds.top + 15
    } );

    this.addChild( pseudo3DButtonsBox );

    //===================================================================================
    // Flat buttons labeled 1, 2, 3, 4
    //===================================================================================

    var button1 = new RectangularPushButton( {
      content: new Text( '-- 1 --', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 1 pressed' ); },
      baseColor: 'rgb( 204, 102, 204 )',
      buttonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy
    } );

    var button2 = new RectangularPushButton( {
      content: new Text( '-- 2 --', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 2 pressed' ); },
      baseColor: '#A0D022',
      buttonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy,
      lineWidth: 1,
      stroke: '#202020'
    } );

    var button3 = new RoundPushButton( {
      content: new Text( '- 3 -', { font: BUTTON_FONT } ),
      listener: function() { message( 'Button 3 pressed ' ); },
      buttonAppearanceStrategy: RoundButtonView.flatAppearanceStrategy
    } );

    var button4 = new RoundPushButton( {
      content: new Text( '-- 4 --', { font: BUTTON_FONT, fill: 'white' } ),
      listener: function() { message( 'Button 4 pressed ' ); },
      baseColor: '#CC3300',
      buttonAppearanceStrategy: RoundButtonView.flatAppearanceStrategy
    } );

    var flatButtonsBox = new HBox( {
      children: [ button1, button2, button3, button4 ],
      spacing: 10,
      left: pseudo3DButtonsBox.left,
      top: pseudo3DButtonsBox.bottom + 30
    } );
    this.addChild( flatButtonsBox );

    //===================================================================================
    // Fire! Go! Help! buttons - these demonstrate more colors and sizes of buttons
    //===================================================================================

    var fireButton = new RoundPushButton( {
      content: new Text( 'Fire!', { font: BUTTON_FONT } ),
      listener: function() { message( 'Fire button pressed' ); },
      baseColor: 'orange',
      stroke: 'black',
      lineWidth: 0.5
    } );

    var goButton = new RoundPushButton( {
      content: new Text( 'Go!', { font: BUTTON_FONT } ),
      listener: function() { message( 'Go button pressed' ); },
      baseColor: new Color( 0, 163, 0 ),
      minXPadding: 10
    } );

    var helpButton = new RoundPushButton( {
      content: new Text( 'Help', { font: BUTTON_FONT } ),
      listener: function() { message( 'Help button pressed' ); },
      baseColor: new Color( 244, 154, 194 ),
      minXPadding: 10
    } );

    var actionButtonsBox = new HBox( {
      children: [ fireButton, goButton, helpButton ],
      spacing: 15,
      left: flatButtonsBox.left,
      top: flatButtonsBox.bottom + 25
    } );
    this.addChild( actionButtonsBox );

    //===================================================================================
    // Momentary buttons
    //===================================================================================

    // round
    var roundOnProperty = new Property( false );
    roundOnProperty.lazyLink( function( on ) { message( 'RoundMomentaryButton on=' + on ); } );
    var roundMomentaryButton = new RoundMomentaryButton( roundOnProperty, {
      baseColor: 'orange',
      right: this.layoutBounds.right - 10,
      centerY: this.layoutBounds.centerY
    } );
    this.addChild( roundMomentaryButton );

    // rectangular
    var rectangularOnProperty = new Property( false );
    rectangularOnProperty.lazyLink( function( on ) { message( 'RectangularMomentaryButton on=' + on ); } );
    var rectangularMomentaryButton = new RectangularMomentaryButton( rectangularOnProperty, {
      minWidth: 50,
      minHeight: 40,
      right: roundMomentaryButton.right,
      top: roundMomentaryButton.bottom + 10
    } );
    this.addChild( rectangularMomentaryButton );

    //===================================================================================
    // Miscellaneous other button examples
    //===================================================================================

    var fireOnDownCount = 0;
    var fireOnDownButton = new RectangularPushButton( {
      content: new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
      listener: function() { message( 'Fire on down button pressed ' + ( ++fireOnDownCount ) + 'x' ); },
      baseColor: new Color( 255, 255, 61 ),
      fireOnDown: true,
      stroke: 'black',
      lineWidth: 1
    } );

    var htmlButton = new HTMLPushButton( 'HTML <em>button</em> <b>example</b>', {
      listener: function() { message( 'HTML button pressed' ); },
      baseColor: new Color( 64, 225, 0 )
    } );

    // transparent button with something behind it
    var rectangleNode = new Rectangle( 0, 0, 25, 50, { fill: 'red' } );
    var transparentButton = new RectangularPushButton( {
      content: new Text( 'Transparent Button', { font: BUTTON_FONT } ),
      listener: function() { message( 'Transparent button pressed' ); },
      baseColor: new Color( 255, 255, 0, 0.7 ),
      center: rectangleNode.center
    } );
    var transparentParent = new Node( { children: [ rectangleNode, transparentButton ] } );

    var miscButtonsBox = new VBox( {
      children: [ fireOnDownButton, htmlButton, transparentParent ],
      spacing: 15,
      left: actionButtonsBox.left,
      top: actionButtonsBox.bottom + 25
    } );
    this.addChild( miscButtonsBox );

    //===================================================================================
    // Toggle buttons
    //===================================================================================

    // Demonstrate using arbitrary values for toggle button.  Wrap in extra
    // quotes so it is clear that it is a string in the debugging UI.
    var roundToggleButtonProperty = new Property( '"off"' );
    roundToggleButtonProperty.lazyLink( function( value ) {
      message( 'Round sticky toggle button state changed to: ' + value );
    } );
    var roundStickyToggleButton = new RoundStickyToggleButton( '"off"', '"on"', roundToggleButtonProperty, {
      baseColor: new Color( 255, 0, 0 ),
      left: helpButton.right + 5,
      centerY: goButton.centerY
    } );

    var rectangularToggleButtonProperty = new Property( false );
    rectangularToggleButtonProperty.lazyLink( function( value ) {
      message( 'Rectangular sticky toggle button state changed to: ' + value );
    } );
    var booleanRectangularStickyToggleButton = new BooleanRectangularStickyToggleButton( rectangularToggleButtonProperty, {
      baseColor: new Color( 0, 200, 200 ),
      left: roundStickyToggleButton.right + 10,
      centerY: goButton.centerY,
      minWidth: 50,
      minHeight: 35
    } );

    var toggleButtonsBox = new VBox( {
      children: [ roundStickyToggleButton, booleanRectangularStickyToggleButton ],
      spacing: 15,
      left: miscButtonsBox.right + 25,
      top: miscButtonsBox.top
    } );
    this.addChild( toggleButtonsBox );

    //===================================================================================
    // Slider prototypes
    //===================================================================================

    // TODO: Mid-may 2014 - It has been requested that a slider knob be
    // TODO: created that uses the new button look.  Below is an attempt at
    // TODO: this.  It should be removed when finalised.

    // ----- 1 -------
    var track1 = new Line( 0, 0, 80, 0, { stroke: 'black', lineWidth: 6 } );
    var knob1 = new SliderKnob( { center: track1.center } ); //TODO UX APIs typically call this SliderThumb, not SliderKnob
    knob1.addInputListener( new SimpleDragHandler( {  //TODO listener should be an option to SliderKnob
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        //TODO this should not be possible if the slider is disabled
        if ( ( translationParams.delta.x > 0 && knob1.centerX < track1.width ) ||
             ( translationParams.delta.x < 0 && knob1.centerX > 0 ) ) {
          knob1.centerX += translationParams.delta.x;
        }
        return translationParams.position;
      }
    } ) );
    var sliderPrototype1 = new Node( { children: [ track1, knob1 ] } );

    // ----- 2 -------
    var track2 = new Line( 0, 0, 80, 0, { stroke: 'black', lineWidth: 6 } );
    var knob2 = new SliderKnob( { center: track2.center, baseColor: 'orange' } );
    knob2.addInputListener( new SimpleDragHandler( {
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        if ( ( translationParams.delta.x > 0 && knob2.centerX < track2.width ) ||
             ( translationParams.delta.x < 0 && knob2.centerX > 0 ) ) {
          knob2.centerX += translationParams.delta.x;
        }
        return translationParams.position;
      }
    } ) );
    var sliderPrototype2 = new Node( { children: [ track2, knob2 ] } );

    // ----- 3 -------
    var track3 = new Line( 0, 0, 80, 0, { stroke: 'black', lineWidth: 6 } );
    var knob3 = new SliderKnob( { center: track3.center, width: 15, baseColor: '#00CC66', stroke: 'black', centerIndentWidth: 0 } );
    knob3.addInputListener( new SimpleDragHandler( {
      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        if ( ( translationParams.delta.x > 0 && knob3.centerX < track3.width ) ||
             ( translationParams.delta.x < 0 && knob3.centerX > 0 ) ) {
          knob3.centerX += translationParams.delta.x;
        }
        return translationParams.position;
      }
    } ) );
    var sliderPrototype3 = new Node( { children: [ track3, knob3 ] } );

    //TODO putting these sliders in a VBox demonstrates that the sliders have resize problems at min/max values
    var slidersBox = new VBox( {
      spacing: 25,
      children: [ sliderPrototype1, sliderPrototype2, sliderPrototype3 ],
      right: this.layoutBounds.right - 15,
      top:   this.layoutBounds.top + 15
    } );
    this.addChild( slidersBox );

    //===================================================================================
    // Enable/Disable buttons
    //===================================================================================

    //TODO Shouldn't all of these buttons be able to observe buttonEnabledProperty?
    // Set up a property for testing button enable/disable.
    var buttonsEnabledProperty = new Property( true );
    buttonsEnabledProperty.link( function( enabled ) {
      radioButtonGroup.enabled = enabled;
      buttonA.enabled = enabled;
      buttonB.enabled = enabled;
      buttonC.enabled = enabled;
      buttonD.enabled = enabled;
      buttonE.enabled = enabled;
      button1.enabled = enabled;
      button2.enabled = enabled;
      button3.enabled = enabled;
      button4.enabled = enabled;
      fireButton.enabled = enabled;
      goButton.enabled = enabled;
      helpButton.enabled = enabled;
      fireOnDownButton.enabled = enabled;
      htmlButton.enabled = enabled;
      transparentButton.enabled = enabled;
      roundStickyToggleButton.enabled = enabled;
      booleanRectangularStickyToggleButton.enabled = enabled;
      knob1.enabled = enabled; //TODO enabled should be a property of slider, not knob
      knob2.enabled = enabled;
      knob3.enabled = enabled;
      rectangularMomentaryButton.enabled = enabled;
      roundMomentaryButton.enabled = enabled;
    } );
    var disableEnableButton = new BooleanRectangularToggleButtonWithContent(
      new Text( 'Disable Buttons', { font: BUTTON_CAPTION_FONT } ),
      new Text( 'Enable Buttons', { font: BUTTON_CAPTION_FONT } ),
      buttonsEnabledProperty, {
        baseColor: new Color( 204, 255, 51 ),
        right: this.layoutBounds.right - 15,
        bottom: this.layoutBounds.bottom - 15
      }
    );
    this.addChild( disableEnableButton );

    // Add a button to set alternative color scheme.
    var changeButtonColorsButton = new RectangularPushButton( {
        content: new Text( 'Change Some Button Colors', { font: BUTTON_CAPTION_FONT } ),
        listener: function() {
          buttonA.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          buttonD.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          button1.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          button3.baseColor = new Color( _.random( 0, 255 ), _.random( 0, 255 ), _.random( 0, 255 ) );
          message( 'Button colors changed' );
        },
        right: disableEnableButton.right,
        bottom: disableEnableButton.top - 5
      }
    );
    this.addChild( changeButtonColorsButton );
  }

  return inherit( ScreenView, ButtonsDemoView );
} );