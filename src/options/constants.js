/*********************************************************/
/* TC Manager                                            */
/* Author: Aleš Postulka (xpostu03@stud.fit.vutbr.cz)    */
/* FIT VUT, 2020/2021                                    */
/*********************************************************/

// ID of table row with global options.
const GLOBAL_ROW_ID = 'global_row';

// Class of global option table cell.
const GLOBAL_OPTION_CLASS = 'global_option';

// Class of vendor option choice cell.
const VENDOR_OPTION_CLASS = 'vendor_option';

// Class of option table cell.
const OPTION_CLASS = 'option';

// Class prefix for cells with purposes/special features options.
// Number is added for specific purpose/special feature.
const PURPOSE_CLASS_PREFIX = 'p_';
const SPECIAL_FEATURE_CLASS_PREFIX = 'sf_';

// Classes which define color of table cell.
const CONSENT_COLOR = 'green';
const OBJECTION_COLOR = 'red';
const INHERITED_CONSENT_COLOR = 'light-green';
const INHERITED_OBJECTION_COLOR = 'light-red';

// Name of attribute used to store value of option cell.
const VALUE_ATTRIBUTE = 'data-value';