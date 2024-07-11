

/* ************************************************************************************************
 *                                             TYPES                                              *
 ************************************************************************************************ */

/**
 * Object
 * This utility type is used to replace the original 'object' type which can become difficult to
 * deal with.
 */
type IObject = {
  [key: string]: any;
};

/**
 * Non Empty Array
 * This utility type is used to declare arrays that we know for a fact will never be empty.
 */
type NonEmptyArray<T> = [T, ...T[]];





/* ************************************************************************************************
 *                                         MODULE EXPORTS                                         *
 ************************************************************************************************ */
export type {
  IObject,
  NonEmptyArray,
};
