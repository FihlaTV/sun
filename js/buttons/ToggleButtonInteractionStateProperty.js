// Copyright 2014-2020, University of Colorado Boulder

/**
 * A derived property that maps sticky toggle button model states to the values needed by the button view.
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';

class ToggleButtonInteractionStateProperty extends DerivedProperty {

  /**
   * @param {ButtonModel} buttonModel
   */
  constructor( buttonModel ) {
    super( [ buttonModel.overProperty, buttonModel.looksPressedProperty, buttonModel.enabledProperty ],
      ( over, looksPressed, enabled ) => {
        return !enabled ? ButtonInteractionState.DISABLED :
               over && !( looksPressed ) ? ButtonInteractionState.OVER :
               looksPressed ? ButtonInteractionState.PRESSED :
               ButtonInteractionState.IDLE;
      }
    );
  }
}

sun.register( 'ToggleButtonInteractionStateProperty', ToggleButtonInteractionStateProperty );
export default ToggleButtonInteractionStateProperty;