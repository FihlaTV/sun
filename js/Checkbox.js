// Copyright 2013-2019, University of Colorado Boulder

/**
 * Checkbox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Action = require( 'AXON/Action' );
  var BooleanIO = require( 'TANDEM/types/BooleanIO' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var commonSoundPlayers = require( 'TAMBO/commonSoundPlayers' );
  var EventType = require( 'TANDEM/EventType' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InstanceRegistry = require( 'PHET_CORE/documentation/InstanceRegistry' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var sun = require( 'SUN/sun' );
  var SunConstants = require( 'SUN/SunConstants' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  const ENABLED_PROPERTY_TANDEM_NAME = 'enabledProperty';

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   * @constructor
   */
  function Checkbox( content, property, options ) {
    var self = this;

    options = _.extend( {
      spacing: 5,
      boxWidth: 21,
      cursor: 'pointer',
      checkboxColor: 'black',
      checkboxColorBackground: 'white',
      enabledProperty: null, // {BooleanProperty} initialized below if not provided
      disabledOpacity: SunConstants.DISABLED_OPACITY,

      // phet-io
      tandem: Tandem.required,
      phetioEventType: EventType.USER,
      // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
      phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
      phetioLinkProperty: true, // whether a link to the checkbox's Property is created
      phetioComponentOptions: null, // filled in below with PhetioObject.mergePhetioComponentOptions()

      // sound options, can replace with a custom sound player or set to null to disable sound production
      checkedSoundPlayer: commonSoundPlayers.checkboxCheckedSoundPlayer,
      uncheckedSoundPlayer: commonSoundPlayers.checkboxUncheckedSoundPlayer,

      // a11y
      tagName: 'input',
      inputType: 'checkbox',
      appendDescription: true
    }, options );

    Node.call( this );

    PhetioObject.mergePhetioComponentOptions( { visibleProperty: { phetioFeatured: true } }, options );

    // @private - sends out notifications when the checkbox is toggled.
    var toggleAction = new Action( function( value ) {
      property.value = value;
    }, {
      parameters: [ { name: 'isChecked', phetioType: BooleanIO } ],
      tandem: options.tandem.createTandem( 'toggleAction' ),
      phetioDocumentation: 'Emits when user input causes the checkbox to toggle, emitting a single arg: ' +
                           'the new boolean value of the checkbox state.',
      phetioReadOnly: options.phetioReadOnly,
      phetioEventType: EventType.USER
    } );

    // @private - Create the background.  Until we are creating our own shapes, just put a rectangle behind the font
    // awesome checkbox icons.
    this.backgroundNode = new Rectangle( 0, -options.boxWidth, options.boxWidth * 0.95, options.boxWidth * 0.95,
      options.boxWidth * 0.2, options.boxWidth * 0.2, {
        fill: options.checkboxColorBackground
      } );

    // @private
    this.uncheckedNode = new FontAwesomeNode( 'check_empty', {
      fill: options.checkboxColor
    } );
    var iconScale = options.boxWidth / this.uncheckedNode.width;
    this.uncheckedNode.scale( iconScale );

    // @private
    this.checkedNode = new FontAwesomeNode( 'check_square_o', {
      scale: iconScale,
      fill: options.checkboxColor
    } );

    // @private
    this.checkboxNode = new Node( { children: [ this.backgroundNode, this.checkedNode, this.uncheckedNode ] } );

    this.addChild( this.checkboxNode );
    this.addChild( content );

    content.left = this.checkedNode.right + options.spacing;
    content.centerY = this.checkedNode.centerY;

    // put a rectangle on top of everything to prevent dead zones when clicking
    this.addChild( new Rectangle( this.left, this.top, this.width, this.height ) );

    content.pickable = false; // since there's a pickable rectangle on top of content

    // interactivity
    var checkboxButtonListener = new ButtonListener( {
      fire: function() {
        if ( self.enabledProperty.value ) {
          var newValue = !property.value;
          toggleAction.execute( newValue );
          if ( newValue && options.checkedSoundPlayer ) {
            options.checkedSoundPlayer.play();
          }
          else if ( !newValue && options.uncheckedSoundPlayer ) {
            options.uncheckedSoundPlayer.play();
          }
        }
      }
    } );
    this.addInputListener( checkboxButtonListener );

    // sync with property
    var checkboxCheckedListener = function( checked ) {
      self.checkedNode.visible = checked;
      self.uncheckedNode.visible = !checked;
      self.accessibleChecked = checked;
    };
    property.link( checkboxCheckedListener );

    // Apply additional options
    this.mutate( options );

    // does this instance own enabledProperty?
    var ownsEnabledProperty = !options.enabledProperty;

    // must be after the Checkbox is instrumented
    options.phetioLinkProperty && this.addLinkedElement( property, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    if ( !ownsEnabledProperty ) {
      assert && this.isPhetioInstrumented() && assert( !!options.enabledProperty.phetioFeatured === !!this.phetioFeatured,
        'provided enabledProperty must be phetioFeatured if this checkbox is' );

      // If enabledProperty was passed in, Studio needs to know about that linkage
      this.addLinkedElement( options.enabledProperty, {
        tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME )
      } );
    }

    // @public
    this.enabledProperty = options.enabledProperty || new BooleanProperty( true, {
      tandem: options.tandem.createTandem( ENABLED_PROPERTY_TANDEM_NAME ),
      phetioReadOnly: options.phetioReadOnly,
      phetioDocumentation: 'When disabled, the checkbox is grayed out and cannot be pressed.',
      phetioFeatured: true
    } );

    var enabledListener = function( enabled ) {
      if ( enabled ) {
        self.setAccessibleAttribute( 'onclick', '' );
        self.setAccessibleAttribute( 'aria-disabled', false );
      }
      else {
        self.interruptSubtreeInput(); // interrupt interaction

        // By returning false, we prevent the a11y checkbox from toggling when the enabledProperty is false. This way
        // we can keep the checkbox in tab order and don't need to add the `disabled` attribute. See https://github.com/phetsims/sun/issues/519
        // This solution was found at https://stackoverflow.com/a/12267350/3408502
        self.setAccessibleAttribute( 'onclick', 'return false' );
        self.setAccessibleAttribute( 'aria-disabled', true );
      }

      self.pickable = enabled;
      self.opacity = enabled ? 1 : options.disabledOpacity;
    };
    this.enabledProperty.link( enabledListener );

    // assert that phet-io is set up correctly after the PhetioObject has been properly initialized (after mutate)

    // If either one is instrumented, then the other must be too.
    assert && Tandem.errorOnFailedValidation() && assert( this.enabledProperty.isPhetioInstrumented() === this.isPhetioInstrumented(),
      'provided enabled property must be instrumented for phet-io.' );

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'Checkbox', this );

    // @private
    this.disposeCheckbox = function() {

      // Client owns property, remove the listener that we added.
      if ( property.hasListener( checkboxCheckedListener ) ) {
        property.unlink( checkboxCheckedListener );
      }

      if ( ownsEnabledProperty ) {

        // Checkbox owns enabledProperty, so dispose to release tandem and remove all listeners.
        self.enabledProperty.dispose();
      }
      else if ( self.enabledProperty.hasListener( enabledListener ) ) {

        // Client owns enabledProperty, remove the listener that we added.
        self.enabledProperty.unlink( enabledListener );
      }

      // Private to Checkbox, but we need to clean up tandem.
      toggleAction.dispose();
    };
  }

  sun.register( 'Checkbox', Checkbox );

  inherit( Node, Checkbox, {

    // @public
    dispose: function() {
      this.disposeCheckbox();
      Node.prototype.dispose.call( this );
    },

    /**
     *  Sets the background color of the checkbox.
     *  @param {Color|String} value
     *  @public
     */
    setCheckboxColorBackground: function( value ) { this.backgroundNode.fill = value; },
    set checkboxColorBackground( value ) { this.setCheckboxColorBackground( value ); },

    /**
     * Gets the background color of the checkbox.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColorBackground: function() { return this.backgroundNode.fill; },
    get checkboxColorBackground() { return this.getCheckboxColorBackground(); },

    /**
     *  Sets the color of the checkbox.
     *  @param {Color|String} value
     *  @public
     */
    setCheckboxColor: function( value ) { this.checkedNode.fill = this.uncheckedNode.fill = value; },
    set checkboxColor( value ) { this.setCheckboxColor( value ); },

    /**
     * Gets the color of the checkbox.
     * @returns {Color|String}
     * @public
     */
    getCheckboxColor: function() { return this.checkedNode.fill; },
    get checkboxColor() { return this.getCheckboxColor(); },

    /**
     * Sets whether the checkbox is enabled.
     * @param {boolean} enabled
     * @public
     */
    setEnabled: function( enabled ) { this.enabledProperty.value = enabled; },
    set enabled( value ) { this.setEnabled( value ); },

    /**
     * Is the checkbox enabled?
     * @returns {boolean}
     * @public
     */
    getEnabled: function() { return this.enabledProperty.value; },
    get enabled() { return this.getEnabled(); }

  } );

  return Checkbox;
} );